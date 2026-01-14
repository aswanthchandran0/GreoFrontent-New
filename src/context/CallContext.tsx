// src/context/CallContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getSocket } from '../services/socket';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

interface UserInfo {
  id: string;
  name: string;
  image?: string;
}

interface CallContextType {
  isIncomingCall: boolean;
  isOutgoingCall: boolean;
  isCallActive: boolean;
  callType: 'voice' | 'video' | null;
  callerInfo: UserInfo | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isSpeakerOn: boolean;
  callTime: string;
  initiateCall: (targetUserId: string, type: 'voice' | 'video') => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  shareScreen: () => Promise<void>;
  peerConnection: RTCPeerConnection | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }
  return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const { socket: socketFromContext } = useSocket();

  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [isOutgoingCall, setIsOutgoingCall] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video' | null>(null);
  const [callerInfo, setCallerInfo] = useState<UserInfo | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callTime, setCallTime] = useState('00:00');
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socket = socketFromContext || getSocket();
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get WebRTC configuration
  const getWebRTCConfig = useCallback(() => {
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10,
    };
  }, []);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) {
      console.error('❌ Socket not available for call setup');
      toast.error('Socket connection not available');
      return;
    }

    if (!user) {
      console.error('❌ User not authenticated for call setup');
      toast.error('Please login to make calls');
      return;
    }

    console.log('📞 Setting up call event listeners for user:', {
      userId: user.id,
      userName: user.name,
      socketConnected: socket.connected
    });
    
    toast.success('Call system ready');

    const handleIncomingCall = (data: {
      callerId: string;
      callerName: string;
      callerImage?: string;
      type: 'voice' | 'video';
    }) => {
      console.log('📞 Incoming call from:', data);
      toast.success(`📞 Incoming ${data.type} call from ${data.callerName}`);
      
      setCallerInfo({
        id: data.callerId,
        name: data.callerName,
        image: data.callerImage
      });
      setCallType(data.type);
      setTargetUserId(data.callerId);
      setIsIncomingCall(true);
    };

    const handleCallAnswered = (data: {
      answeredBy: string;
      callerId: string;
    }) => {
      console.log('✅ Call answered by:', data.answeredBy);
      toast.success(`✅ Call answered by ${data.answeredBy}`);
      
      if (isOutgoingCall && data.answeredBy === targetUserId) {
        setIsOutgoingCall(false);
        setIsCallActive(true);
        setCallStartTime(new Date());
      }
    };

    const handleCallRejected = (data: {
      rejectedBy: string;
      callerId: string;
    }) => {
      console.log('❌ Call rejected by:', data.rejectedBy);
      toast.error(`❌ Call rejected by ${data.rejectedBy}`);
      
      if (isOutgoingCall) {
        resetCallState();
      }
    };

    const handleCallEnded = (data: { endedBy: string }) => {
      console.log('📴 Call ended by:', data.endedBy);
      toast(`📴 Call ended by ${data.endedBy}`);
      
      resetCallState();
    };

    const handleCallCanceled = (data: { canceledBy: string }) => {
      console.log('🚫 Call canceled by:', data.canceledBy);
      toast(`🚫 Call canceled by ${data.canceledBy}`);
      
      if (isIncomingCall) {
        resetCallState();
      }
    };

    const handleCallSignal = async (data: {
      signal: any;
      fromUserId: string;
      toUserId: string;
    }) => {
      console.log('📡 Received WebRTC signal:', {
        type: data.signal.type,
        from: data.fromUserId,
        to: data.toUserId
      });
      
      try {
        await handleSignal(data.signal, data.fromUserId);
        toast.success('📡 WebRTC signal processed');
      } catch (error) {
        console.error('Error handling signal:', error);
        toast.error('❌ Failed to process WebRTC signal');
      }
    };

    // Register event listeners
    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:answered', handleCallAnswered);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:ended', handleCallEnded);
    socket.on('call:canceled', handleCallCanceled);
    socket.on('call:signal', handleCallSignal);

    // Cleanup
    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:answered', handleCallAnswered);
      socket.off('call:rejected', handleCallRejected);
      socket.off('call:ended', handleCallEnded);
      socket.off('call:canceled', handleCallCanceled);
      socket.off('call:signal', handleCallSignal);
    };
  }, [socket, user, isOutgoingCall, targetUserId, isIncomingCall]);

  // Update call timer
  useEffect(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }

    if (isCallActive && callStartTime) {
      callTimerRef.current = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - callStartTime.getTime()) / 1000);
        const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
        const seconds = (diff % 60).toString().padStart(2, '0');
        setCallTime(`${minutes}:${seconds}`);
      }, 1000);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isCallActive, callStartTime]);

  const resetCallState = useCallback(() => {
    console.log('🔄 Resetting call state');
    toast('🔄 Resetting call state');
    
    setIsIncomingCall(false);
    setIsOutgoingCall(false);
    setIsCallActive(false);
    setCallType(null);
    setCallerInfo(null);
    setTargetUserId(null);
    setCallTime('00:00');
    setCallStartTime(null);
    
    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      toast('🎤 Local stream stopped');
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
      toast('🎧 Remote stream stopped');
    }
    
    // Clean up peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      toast('🔌 Peer connection closed');
    }
    setPeerConnection(null);
    
    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, [localStream, remoteStream]);

  // MODIFIED: createPeerConnection now accepts parameters
  const createPeerConnection = useCallback((currentTargetUserId: string, currentCallType: 'voice' | 'video') => {
    console.log('🔧 Creating peer connection with:', {
      targetUserId: currentTargetUserId,
      callType: currentCallType,
      hasSocket: !!socket,
      hasUser: !!user,
      hasLocalStream: !!localStream
    });
    
    toast('🔧 Creating peer connection...');

    if (!socket || !user) {
      const error = 'Cannot create peer connection: Socket or user not available';
      console.error(error);
      toast.error(error);
      throw new Error(error);
    }

    if (!currentTargetUserId) {
      const error = 'Cannot create peer connection: Target user ID is missing';
      console.error(error);
      toast.error(error);
      throw new Error(error);
    }

    // Close existing connection if any
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      toast('🔌 Closed existing peer connection');
    }

    const pc = new RTCPeerConnection(getWebRTCConfig());
    peerConnectionRef.current = pc;
    setPeerConnection(pc);
    
    toast.success('✅ Peer connection created');

    // Add local stream if available
    if (localStream) {
      console.log('➕ Adding local tracks to peer connection');
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
      toast.success('🎤 Added local audio track');
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log('📨 Received remote track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        toast.success('🎧 Received remote stream');
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && currentTargetUserId) {
        console.log('🧊 Sending ICE candidate');
        socket.emit('call:signal', {
          targetUserId: currentTargetUserId,
          signal: {
            type: 'candidate',
            candidate: event.candidate
          },
          type: currentCallType,
          callerId: user.id
        });
        toast.success('🧊 ICE candidate sent');
      }
    };

    // Handle connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log('🌐 ICE connection state:', pc.iceConnectionState);
      toast(`🌐 ICE: ${pc.iceConnectionState}`);
      
      if (pc.iceConnectionState === 'disconnected' || 
          pc.iceConnectionState === 'failed' ||
          pc.iceConnectionState === 'closed') {
        console.log('❌ ICE connection failed');
        toast.error('❌ ICE connection failed');
      }
      
      if (pc.iceConnectionState === 'connected') {
        toast.success('✅ ICE connected successfully');
      }
    };

    return pc;
  }, [socket, user, localStream, getWebRTCConfig]);

  const initiateCall = useCallback(async (targetUserId: string, type: 'voice' | 'video') => {
    console.log('🚀 INITIATE CALL STARTED:', {
      targetUserId,
      type,
      hasSocket: !!socket,
      hasUser: !!user,
      userId: user?.id,
      userName: user?.name
    });
    
    toast('🚀 Starting call initiation...');

    if (!socket) {
      console.error('❌ Cannot initiate call: Socket not connected');
      toast.error('❌ Cannot initiate call: No socket connection');
      return;
    }
    
    if (!user) {
      console.error('❌ Cannot initiate call: User not authenticated');
      toast.error('❌ Cannot initiate call: Please login first');
      return;
    }
    
    if (!targetUserId) {
      console.error('❌ Cannot initiate call: No target user ID provided');
      toast.error('❌ Cannot initiate call: Target user not found');
      return;
    }
    
    try {
      console.log(`📞 Initiating ${type} call to ${targetUserId}`);
      toast(`📞 Starting ${type} call to ${targetUserId}...`);
      
      // Get local media stream
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: type === 'video' ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        } : false
      };
      
      toast('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🎤 Got local media stream with tracks:', stream.getTracks().length);
      toast.success('✅ Microphone access granted');
      
      // Set state
      setLocalStream(stream);
      setCallType(type);
      setTargetUserId(targetUserId);
      setIsOutgoingCall(true);
      
      // Set caller info for UI (we are calling someone)
      setCallerInfo({
        id: targetUserId,
        name: 'User', // This should come from your user data
        image: undefined
      });
      
      // Create peer connection with parameters
      toast('🔧 Creating peer connection...');
      createPeerConnection(targetUserId, type);
      toast.success('✅ Peer connection created');
      
      // Send call initiation
      console.log('📤 Sending call initiation to server');
      socket.emit('call:initiate', {
        targetUserId,
        type,
        callerId: user.id,
        callerName: user.name || 'User',
        callerImage: user.profileImage
      });
      
      console.log(`✅ Call initiation sent to ${targetUserId}`);
      toast.success(`✅ Call started! Waiting for answer...`);
      
    } catch (error: any) {
      console.error('❌ Failed to initiate call:', error);
      toast.error(`❌ Failed to start call: ${error.message || 'Unknown error'}`);
      resetCallState();
      
      if (error.name === 'NotAllowedError') {
        toast.error('❌ Microphone/camera access was denied. Please check browser permissions.');
      } else if (error.name === 'NotFoundError') {
        toast.error('❌ No microphone/camera found on this device.');
      } else {
        toast.error(`❌ Failed to start call: ${error.message || 'Unknown error'}`);
      }
    }
  }, [socket, user, createPeerConnection, resetCallState]);

  const answerCall = useCallback(async () => {
    console.log('📞 ANSWER CALL STARTED:', {
      targetUserId,
      callType,
      callerInfo,
      hasSocket: !!socket,
      hasUser: !!user
    });
    
    toast('📞 Answering call...');

    if (!socket) {
      console.error('❌ Cannot answer call: Socket not connected');
      toast.error('❌ Cannot answer call: No socket connection');
      return;
    }
    
    if (!user) {
      console.error('❌ Cannot answer call: User not authenticated');
      toast.error('❌ Cannot answer call: Please login first');
      return;
    }
    
    if (!callerInfo) {
      console.error('❌ Cannot answer call: No caller info');
      toast.error('❌ Cannot answer call: Caller information missing');
      return;
    }
    
    if (!targetUserId) {
      console.error('❌ Cannot answer call: No target user ID');
      toast.error('❌ Cannot answer call: Target user not found');
      return;
    }
    
    if (!callType) {
      console.error('❌ Cannot answer call: No call type specified');
      toast.error('❌ Cannot answer call: Call type not specified');
      return;
    }
    
    try {
      console.log(`✅ Answering call from ${targetUserId}`);
      toast(`✅ Answering ${callType} call...`);
      
      // Get local media
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: callType === 'video' ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        } : false
      };
      
      toast('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🎤 Got local stream for answering');
      toast.success('✅ Microphone access granted');
      
      setLocalStream(stream);
      setIsIncomingCall(false);
      setIsCallActive(true);
      setCallStartTime(new Date());
      
      // Create peer connection with parameters
      toast('🔧 Creating peer connection...');
      createPeerConnection(targetUserId, callType);
      toast.success('✅ Peer connection created');
      
      // Notify caller that we answered
      console.log('📤 Notifying caller of answer...');
      socket.emit('call:answered', {
        callerId: targetUserId
      });
      
      console.log(`✅ Answered call from ${targetUserId}`);
      toast.success(`✅ Call answered! Connection established.`);
      
    } catch (error: any) {
      console.error('❌ Failed to answer call:', error);
      toast.error(`❌ Failed to answer call: ${error.message || 'Unknown error'}`);
      resetCallState();
    }
  }, [socket, user, callerInfo, targetUserId, callType, createPeerConnection, resetCallState]);

  const rejectCall = useCallback(() => {
    console.log('❌ REJECT CALL:', { targetUserId });
    toast('❌ Rejecting call...');

    if (!socket) {
      console.error('❌ Cannot reject call: Socket not connected');
      toast.error('❌ Cannot reject call: No socket connection');
      return;
    }
    
    if (!targetUserId) {
      console.error('❌ Cannot reject call: No target user ID');
      toast.error('❌ Cannot reject call: Target user not found');
      return;
    }
    
    console.log(`❌ Sending reject to ${targetUserId}`);
    socket.emit('call:rejected', {
      callerId: targetUserId
    });
    
    resetCallState();
    console.log(`❌ Rejected call from ${targetUserId}`);
    toast.success('❌ Call rejected');
  }, [socket, targetUserId, resetCallState]);

  const endCall = useCallback(() => {
    console.log('📴 END CALL:', { targetUserId });
    toast('📴 Ending call...');

    if (!socket) {
      console.error('❌ Cannot end call: Socket not connected');
      toast.error('❌ Cannot end call: No socket connection');
      return;
    }
    
    if (!targetUserId) {
      console.error('❌ Cannot end call: No target user ID');
      toast.error('❌ Cannot end call: Target user not found');
      return;
    }
    
    console.log(`📴 Sending end call to ${targetUserId}`);
    socket.emit('call:end', {
      targetUserId
    });
    
    resetCallState();
    console.log(`📴 Ended call with ${targetUserId}`);
    toast.success('📴 Call ended');
  }, [socket, targetUserId, resetCallState]);

  const toggleMute = useCallback(() => {
    console.log('🔇 TOGGLE MUTE');
    
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log(`🔇 ${audioTrack.enabled ? 'Unmuted' : 'Muted'}`);
        toast.success(audioTrack.enabled ? '🎤 Unmuted' : '🔇 Muted');
      }
    }
  }, [localStream]);

  const toggleSpeaker = useCallback(() => {
    console.log('🔈 TOGGLE SPEAKER');
    setIsSpeakerOn(!isSpeakerOn);
    console.log(`🔈 ${isSpeakerOn ? 'Speaker off' : 'Speaker on'}`);
    toast.success(isSpeakerOn ? '🔈 Speaker off' : '🔊 Speaker on');
  }, [isSpeakerOn]);

  const shareScreen = useCallback(async () => {
    console.log('🖥️ SHARE SCREEN');
    toast('🖥️ Starting screen share...');
    
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        } as MediaTrackConstraints,
        audio: false
      });
      
      if (localStream && peerConnectionRef.current) {
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
          console.log('🖥️ Started screen sharing');
          toast.success('🖥️ Screen sharing started');
        }
      }
    } catch (error) {
      console.error('Failed to share screen:', error);
      toast.error('❌ Failed to share screen');
    }
  }, [localStream]);

  const handleSignal = useCallback(async (signal: any, fromUserId: string) => {
    console.log('📡 HANDLE SIGNAL:', {
      type: signal.type,
      fromUserId,
      hasPeerConnection: !!peerConnectionRef.current
    });
    
    toast(`📡 Processing ${signal.type} signal...`);

    if (!peerConnectionRef.current) {
      console.error('❌ No peer connection available for signal');
      toast.error('❌ No peer connection available');
      return;
    }
    
    try {
      if (signal.type === 'offer') {
        // Handle offer from remote
        console.log('📥 Setting remote description from offer');
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        toast.success('📥 Remote description set');
        
        // Create answer
        const answer = await peerConnectionRef.current.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: callType === 'video'
        });
        
        console.log('📤 Created answer');
        await peerConnectionRef.current.setLocalDescription(answer);
        toast.success('📤 Answer created');
        
        // Send answer back
        if (socket && user) {
          socket.emit('call:signal', {
            targetUserId: fromUserId,
            signal: answer,
            type: callType || 'voice',
            callerId: user.id
          });
          toast.success('📤 Answer sent back');
        }
      } else if (signal.type === 'answer') {
        // Handle answer from remote
        console.log('📥 Setting remote description from answer');
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        toast.success('📥 Remote description set from answer');
      } else if (signal.type === 'candidate' && signal.candidate) {
        // Handle ICE candidate
        console.log('🧊 Adding ICE candidate');
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
        toast.success('🧊 ICE candidate added');
      }
    } catch (error) {
      console.error('❌ Error processing signal:', error);
      toast.error('❌ Failed to process signal');
    }
  }, [socket, user, callType]);

  const value: CallContextType = {
    isIncomingCall,
    isOutgoingCall,
    isCallActive,
    callType,
    callerInfo,
    localStream,
    remoteStream,
    isMuted,
    isSpeakerOn,
    callTime,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    shareScreen,
    peerConnection,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};