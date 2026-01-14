// src/hooks/useVideoCall.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import SimplePeer from 'simple-peer';

interface UseVideoCallProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
}

interface CallState {
  isCallActive: boolean;
  isCallIncoming: boolean;
  callStatus: 'idle' | 'calling' | 'ringing' | 'active' | 'ended';
  incomingCall: { callId: string; callerId: string } | null;
  activeCallId: string | null;
}

export const useVideoCall = ({ localVideoRef, remoteVideoRef }: UseVideoCallProps) => {
  const { socket } = useSocket();
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);


  const initialState: CallState = {
  isCallActive: false,
  isCallIncoming: false,
  callStatus: 'idle',
  incomingCall: null,
  activeCallId: null,
};


  const [callState, setCallState] = useState<CallState>(initialState);

  // Initialize media stream
  const initializeMedia = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return true;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return false;
    }
  }, [localVideoRef]);

  // Clean up media streams
  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [localVideoRef, remoteVideoRef]);

  // Initialize call - as caller
  const startCall = useCallback(async (calleeId: string): Promise<boolean> => {
    if (!socket) return false;

    const mediaSuccess = await initializeMedia();
    if (!mediaSuccess) return false;

    setCallState(prev => ({
      ...prev,
      callStatus: 'calling',
      activeCallId: null
    }));

    // Create simple-peer instance as initiator
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: localStreamRef.current || undefined
    });

    peerRef.current = peer;

    peer.on('signal', (signal) => {
      socket.emit('call:initiate', {
        calleeId,
        signal
      });
    });

    peer.on('connect', () => {
      console.log('WebRTC connection established!');
      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        callStatus: 'active'
      }));
    });

    peer.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    peer.on('error', (error) => {
      console.error('Peer connection error:', error);
      endCall();
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      endCall();
    });

    return true;
  }, [socket, initializeMedia, remoteVideoRef]);

  // Accept incoming call - as callee
  const acceptCall = useCallback(async (): Promise<boolean> => {
    if (!socket || !callState.incomingCall) return false;

    const mediaSuccess = await initializeMedia();
    if (!mediaSuccess) return false;

    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: localStreamRef.current || undefined
    });

    peerRef.current = peer;

    // Signal the offer we received
    if (callState.incomingCall) {
      // We'll signal this when we receive the offer via socket
    }

    peer.on('signal', (signal) => {
      socket.emit('call:accept', {
        callId: callState.incomingCall!.callId,
        signal
      });
    });

    peer.on('connect', () => {
      console.log('WebRTC connection established!');
      setCallState(prev => ({
        ...prev,
        isCallActive: true,
        isCallIncoming: false,
        callStatus: 'active',
        activeCallId: prev.incomingCall?.callId || null
      }));
    });

    peer.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    peer.on('error', (error) => {
      console.error('Peer connection error:', error);
      endCall();
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      endCall();
    });

    return true;
  }, [socket, callState.incomingCall, initializeMedia, remoteVideoRef]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (!socket || !callState.incomingCall) return;

    socket.emit('call:reject', {
      callId: callState.incomingCall.callId,
      reason: "User rejected the call"
    });

    setCallState(prev => ({
      ...prev,
      isCallIncoming: false,
      incomingCall: null,
      callStatus: 'idle'
    }));
  }, [socket, callState.incomingCall]);

  // End active call
  const endCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (callState.activeCallId && socket) {
      socket.emit('call:end', {
        callId: callState.activeCallId,
        reason: "Call ended by user"
      });
    }

    cleanupMedia();

    setCallState({
      isCallActive: false,
      isCallIncoming: false,
      callStatus: 'idle',
      incomingCall: null,
      activeCallId: null,
    });
  }, [socket, callState.activeCallId, cleanupMedia]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data: { callId: string; callerId: string; signal: any }) => {
      console.log("incomming call was comming...................................")
      setCallState(prev => ({
        ...prev,
        isCallIncoming: true,
        callStatus: 'ringing',
        incomingCall: {
          callId: data.callId,
          callerId: data.callerId
        }
      }));

      // If we already have a peer instance (for accepting), signal the offer
      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    };

    const handleCallAccepted = (data: { callId: string; signal: any }) => {
      setCallState(prev => ({
        ...prev,
        activeCallId: data.callId
      }));

      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    };

    const handleCallRejected = (data: { callId: string; reason: string }) => {
      console.log('Call rejected:', data.reason);
      endCall();
    };

    const handleCallEnded = (data: { callId: string; reason: string; endedBy: string }) => {
      console.log('Call ended:', data.reason);
      endCall();
    };

    const handleCallSignal = (data: { signal: any; callId: string; fromUserId: string }) => {
      if (peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    };

    const handleCallInitiated = (data: { callId: string }) => {
      setCallState(prev => ({
        ...prev,
        activeCallId: data.callId
      }));
    };

    // Register socket events
    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:ended', handleCallEnded);
    socket.on('call:signal', handleCallSignal);
    socket.on('call:initiated', handleCallInitiated);

    return () => {
      // Cleanup socket events
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:ended', handleCallEnded);
      socket.off('call:signal', handleCallSignal);
      socket.off('call:initiated', handleCallInitiated);
      
      // Cleanup call on unmount
      endCall();
    };
  }, [socket, endCall]);

  return {
    // State
    ...callState,
    
    // Actions
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    
    // Media control
    initializeMedia,
    cleanupMedia,
    
    // Peer instance (for advanced usage)
    peer: peerRef.current,
  };
};