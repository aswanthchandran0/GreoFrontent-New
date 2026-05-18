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
  initiateCall: (targetUserId: string, targetUserImage: string, targetUserName: string, type: 'voice' | 'video') => Promise<void>;
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
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingIceCandidatesRef = useRef<any[]>([]); // Store pending ICE candidates

  // Get WebRTC configuration
  const getWebRTCConfig = useCallback(() => {
    return {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        {
          urls: 'turn:global.relay.metered.ca:80',
          username: '1d20b2d1bbee5cbe0aedf606',
          credential: 'tfL6lR40n7uG9GNR'
        },
        {
          urls: 'turn:global.relay.metered.ca:443',
          username: '1d20b2d1bbee5cbe0aedf606',
          credential: 'tfL6lR40n7uG9GNR'
        },
        {
          urls: 'turn:global.relay.metered.ca:443?transport=tcp',
          username: '1d20b2d1bbee5cbe0aedf606',
          credential: 'tfL6lR40n7uG9GNR'
        }
      ],
      iceCandidatePoolSize: 10,
    };
  }, []);

  // Update localStream ref when localStream changes
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Reset call state function
  const resetCallState = useCallback(() => {
    console.log('🔄 Resetting call state');
    
    setIsIncomingCall(false);
    setIsOutgoingCall(false);
    setIsCallActive(false);
    setCallType(null);
    setCallerInfo(null);
    setTargetUserId(null);
    setCallTime('00:00');
    setCallStartTime(null);
    
    // Clean up streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    
    // Clean up peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setPeerConnection(null);
    
    // Clear pending data
    pendingOfferRef.current = null;
    pendingIceCandidatesRef.current = [];
    
    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, [remoteStream]);

  // Process pending ICE candidates after peer connection is created
  const processPendingIceCandidates = useCallback(async () => {
    if (pendingIceCandidatesRef.current.length === 0 || !peerConnectionRef.current) {
      return;
    }

    console.log(`🧊 Processing ${pendingIceCandidatesRef.current.length} pending ICE candidates`);
    
    for (const candidate of pendingIceCandidatesRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
        console.log('✅ Added pending ICE candidate');
      } catch (error) {
        console.warn('⚠️ Failed to add pending ICE candidate:', error);
      }
    }
    
    pendingIceCandidatesRef.current = [];
  }, []);

  // Process pending offer after peer connection is created
  const processPendingOffer = useCallback(async () => {
    if (!pendingOfferRef.current || !peerConnectionRef.current) {
      console.log('⏳ No pending offer or no peer connection');
      return;
    }

    console.log('📥 Processing pending offer...');
    
    try {
      // Set the remote description (offer from caller)
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(pendingOfferRef.current)
      );
      console.log('✅ Remote description set from pending offer');
      
      // Process any pending ICE candidates
      await processPendingIceCandidates();
      
      // Create and send answer back
      const answer = await peerConnectionRef.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video'
      });
      
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log('✅ Answer created for pending offer');
      
      // Send answer back to caller
      if (socket && user && targetUserId) {
        socket.emit('call:signal', {
          targetUserId: targetUserId,
          signal: answer,
          type: callType || 'voice',
          callerId: user.id
        });
        console.log('📤 Answer sent for pending offer to', targetUserId);
      }
      
      // Clear pending offer
      pendingOfferRef.current = null;
      
    } catch (error) {
      console.error('❌ Error processing pending offer:', error);
      pendingOfferRef.current = null;
    }
  }, [socket, user, targetUserId, callType, processPendingIceCandidates]);

  // Handle WebRTC signaling
  const handleSignal = useCallback(async (signal: any, fromUserId: string) => {
    console.log('📡 HANDLE SIGNAL:', {
      type: signal.type,
      fromUserId,
      hasPeerConnection: !!peerConnectionRef.current,
      signalingState: peerConnectionRef.current?.signalingState,
      iceState: peerConnectionRef.current?.iceConnectionState
    });

    try {
      if (signal.type === 'offer') {
        console.log('📥 Received offer from', fromUserId);
        
        if (!peerConnectionRef.current) {
          console.log('⏳ No peer connection yet, storing offer as pending');
          // Store the offer to process later when we create peer connection
          pendingOfferRef.current = signal;
          setTargetUserId(fromUserId);
          return;
        }
        
        // If we already have a peer connection, process the offer immediately
        console.log('📥 Setting remote description from offer...');
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        
        // Create and send answer
        const answer = await peerConnectionRef.current.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: callType === 'video'
        });
        
        await peerConnectionRef.current.setLocalDescription(answer);
        console.log('✅ Answer created');
        
        // Send answer back
        if (socket && user) {
          socket.emit('call:signal', {
            targetUserId: fromUserId,
            signal: answer,
            type: callType || 'voice',
            callerId: user.id
          });
          console.log('📤 Answer sent to', fromUserId);
        }
        
      } else if (signal.type === 'answer') {
        console.log('📥 Received answer, setting remote description...');
        
        if (!peerConnectionRef.current) {
          console.error('❌ No peer connection for answer');
          return;
        }
        
        const remoteDesc = new RTCSessionDescription(signal);
        await peerConnectionRef.current.setRemoteDescription(remoteDesc);
        console.log('✅ Remote description set from answer');
        
      } else if (signal.type === 'candidate' && signal.candidate) {
        console.log('🧊 Adding ICE candidate...');
        
        if (!peerConnectionRef.current) {
          console.warn('⚠️ No peer connection for ICE candidate, storing it');
          pendingIceCandidatesRef.current.push(signal.candidate);
          return;
        }
        
        // Check if we can add the candidate
        if (peerConnectionRef.current.remoteDescription) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
            console.log('✅ ICE candidate added');
          } catch (candidateError) {
            console.warn('⚠️ Failed to add ICE candidate:', candidateError);
          }
        } else {
          console.warn('⚠️ No remote description yet, storing ICE candidate');
          pendingIceCandidatesRef.current.push(signal.candidate);
        }
      }
    } catch (error) {
      console.error('❌ Error processing signal:', error);
      toast.error(`Error processing signal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [socket, user, callType]);

  // Create WebRTC offer
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current || !socket || !targetUserId || !user) {
      console.error('Cannot create offer: missing requirements');
      return;
    }

    try {
      console.log('📤 Creating WebRTC offer...');
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video'
      });
      
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('✅ Offer created:', offer.type);
      
      // Send offer to remote peer
      socket.emit('call:signal', {
        targetUserId: targetUserId,
        signal: offer,
        type: callType || 'voice',
        callerId: user.id
      });
      console.log('📤 Offer sent to', targetUserId);
      
    } catch (error) {
      console.error('❌ Failed to create offer:', error);
      toast.error('Failed to create offer');
    }
  }, [socket, targetUserId, user, callType]);

  // Create peer connection with enhanced event handling
  const createPeerConnection = useCallback((
    stream: MediaStream | null, 
    currentTargetUserId: string, 
    currentCallType: 'voice' | 'video'
  ) => {
    console.log('🔧 CREATING PEER CONNECTION:', {
      target: currentTargetUserId,
      type: currentCallType,
      hasStream: !!stream,
      streamTracks: stream?.getTracks().length
    });

    // Close existing connection
    if (peerConnectionRef.current) {
      console.log('🔄 Closing existing peer connection');
      peerConnectionRef.current.close();
    }

    // Create new peer connection
    const pc = new RTCPeerConnection(getWebRTCConfig());
    peerConnectionRef.current = pc;
    setPeerConnection(pc);

    // Add local tracks to peer connection
    if (stream) {
      console.log('➕ Adding local tracks to peer connection:', stream.getTracks().length);
      stream.getTracks().forEach(track => {
        console.log(`➕ Adding ${track.kind} track to peer connection`);
        pc.addTrack(track, stream);
      });
    }

    // CRITICAL: Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && user && currentTargetUserId) {
        console.log('🧊 ICE candidate generated, sending...');
        socket.emit('call:signal', {
          targetUserId: currentTargetUserId,
          signal: {
            type: 'candidate',
            candidate: event.candidate
          },
          type: currentCallType,
          callerId: user.id
        });
      }
    };

    // CRITICAL: Handle connection state
    pc.onconnectionstatechange = () => {
      console.log('🔌 Connection state changed:', pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        console.log('✅ Peer connection established successfully!');
        toast.success('Connection established!');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.warn('⚠️ Connection failed or disconnected');
        toast.error('Connection lost. Trying to reconnect...');
      }
    };

    // CRITICAL: Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'failed') {
        console.warn('⚠️ ICE connection failed');
        toast.error('Connection failed. Please check your network.');
      } else if (pc.iceConnectionState === 'connected') {
        console.log('✅ ICE connection established!');
      }
    };

    // CRITICAL: Handle negotiation needed
    pc.onnegotiationneeded = async () => {
      console.log('🔄 Negotiation needed');
      try {
        if (pc.signalingState === 'stable') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          if (socket && user && currentTargetUserId) {
            socket.emit('call:signal', {
              targetUserId: currentTargetUserId,
              signal: offer,
              type: currentCallType,
              callerId: user.id
            });
            console.log('📤 Re-offer sent after negotiation');
          }
        }
      } catch (error) {
        console.error('❌ Error during negotiation:', error);
      }
    };

    // CRITICAL: Handle track events
    pc.ontrack = (event) => {
      console.log('🎬 ONTRACK EVENT:', {
        trackKind: event.track.kind,
        streams: event.streams.length,
        trackEnabled: event.track.enabled
      });

      if (event.streams && event.streams[0]) {
        const incomingStream = event.streams[0];
        console.log('📡 Received remote stream with tracks:', 
          incomingStream.getTracks().map(t => t.kind));
        
        // IMPORTANT: Create a NEW MediaStream object
        const newRemoteStream = new MediaStream();
        incomingStream.getTracks().forEach(track => {
          newRemoteStream.addTrack(track);
        });
        
        // Update state
        setRemoteStream(newRemoteStream);
        
        // Log track details
        newRemoteStream.getTracks().forEach((track, index) => {
          console.log(`🎯 Remote Track ${index}:`, {
            kind: track.kind,
            enabled: track.enabled,
            readyState: track.readyState,
            label: track.label
          });
        });
      }
    };

    console.log('✅ Peer connection created successfully');
  }, [socket, user, getWebRTCConfig]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket) {
      console.error('❌ Socket not available for call setup');
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
      console.log('✅ Call answered by:', data.answeredBy, 'We are:', user?.id);
      
      // If WE answered the call (person B)
      if (data.answeredBy === user?.id) {
        console.log('🎯 WE answered the call! Transitioning to active call...');
        setIsIncomingCall(false);
        setIsCallActive(true);
        setCallStartTime(new Date());
        toast.success('✅ Call answered!');
      }
      // If someone answered OUR call (person A)
      else if (isOutgoingCall && data.answeredBy === targetUserId) {
        console.log('🎯 Someone answered OUR call! Transitioning to active call...');
        setIsOutgoingCall(false);
        setIsCallActive(true);
        setCallStartTime(new Date());
        toast.success(`✅ ${callerInfo?.name || 'User'} answered the call!`);
      }
    };

    const handleCallRejected = (data: {
      rejectedBy: string;
      callerId: string;
    }) => {
      console.log('❌ Call rejected by:', data.rejectedBy);
      toast.error(`❌ Call rejected by ${data.rejectedBy}`);
      
      resetCallState();
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
      console.log('📡 Received WebRTC signal from:', data.fromUserId, 'type:', data.signal?.type);
      
      if (data.toUserId !== user?.id) {
        console.log('📡 Signal not for us, ignoring');
        return;
      }
      
      try {
        await handleSignal(data.signal, data.fromUserId);
      } catch (error) {
        console.error('Error handling signal:', error);
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
  }, [socket, user, isOutgoingCall, targetUserId, isIncomingCall, isCallActive, callerInfo, resetCallState, createOffer, handleSignal]);

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

  const initiateCall = useCallback(async (targetUserId: string, targetUserImage: string, targetUserName: string, type: 'voice' | 'video') => {
    console.log('🚀 INITIATE CALL STARTED:', {
      targetUserId,
      type,
      targetUserName,
      hasSocket: !!socket,
      hasUser: !!user
    });

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
      console.log(`🎬 STARTING ${type.toUpperCase()} CALL FLOW`);
      console.log(`📞 Initiating ${type} call to ${targetUserName}`);
      
      // Request media with constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: type === 'video' ? {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 24 },
          facingMode: 'user'
        } : false
      };
      
      console.log('🎥 Requesting media with constraints');
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ MEDIA STREAM ACQUIRED');
      console.log('🎤 Got local media stream with tracks:', stream.getTracks().length);
      
      // Check specifically for video track
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      console.log('📊 Stream analysis:', {
        hasVideo: videoTracks.length > 0,
        hasAudio: audioTracks.length > 0,
        videoTrackCount: videoTracks.length,
        audioTrackCount: audioTracks.length
      });
      
      // Set state
      setLocalStream(stream);
      localStreamRef.current = stream;
      setCallType(type);
      setTargetUserId(targetUserId);
      setIsOutgoingCall(true);
      
      // Set caller info for UI
      setCallerInfo({
        id: targetUserId,
        name: targetUserName || 'User',
        image: targetUserImage
      });
      
      // Create peer connection WITH the stream
      console.log('🔧 Creating peer connection with stream...');
      createPeerConnection(stream, targetUserId, type);
      
      // Create offer immediately
      console.log('📤 Creating offer...');
      const offer = await peerConnectionRef.current!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video'
      });
      
      console.log('📄 OFFER CREATED:', {
        type: offer.type,
        hasSDP: !!offer.sdp
      });
      
      // Log SDP content to check for video m-lines
      if (offer.sdp) {
        console.log('🔍 Checking SDP for video m-lines...');
        const videoMLines = offer.sdp.match(/m=video.*/g);
        const audioMLines = offer.sdp.match(/m=audio.*/g);
        console.log('📊 SDP Analysis:', {
          hasVideoMLine: !!videoMLines,
          hasAudioMLine: !!audioMLines,
          videoMLines: videoMLines?.length,
          audioMLines: audioMLines?.length
        });
      }
      
      await peerConnectionRef.current!.setLocalDescription(offer);
      console.log('✅ Offer created and set as local description');
      
      // Send offer to remote peer
      socket.emit('call:signal', {
        targetUserId: targetUserId,
        signal: offer,
        type: type,
        callerId: user.id
      });
      console.log(`📤 Offer sent to ${targetUserId} (type: ${type})`);
      
      // Send call initiation
      console.log('📤 Sending call initiation to server');
      socket.emit('call:initiate', {
        targetUserId,
        type,
        callerId: user.id,
        callerName: user.name || 'User',
        callerImage: user.profileImage
      });
      
      console.log(`✅ Call initiation complete for ${targetUserId}`);
      console.log(`🎉 ${type.toUpperCase()} CALL INITIATED SUCCESSFULLY`);
      toast.success(`✅ ${type === 'video' ? 'Video' : 'Voice'} calling ${targetUserName || 'User'}...`);
      
    } catch (error: any) {
      console.error('❌ Failed to initiate call:', error);
      toast.error(`❌ Failed to start call: ${error.message || 'Unknown error'}`);
      resetCallState();
      
      if (error.name === 'NotAllowedError') {
        toast.error('❌ Microphone/camera access was denied. Please check browser permissions.');
      } else if (error.name === 'NotFoundError') {
        toast.error('❌ No microphone/camera found on this device.');
      } else if (error.name === 'OverconstrainedError') {
        toast.error('❌ Cannot satisfy video constraints. Try lower resolution.');
      }
    }
  }, [socket, user, createPeerConnection, resetCallState]);

  const answerCall = useCallback(async () => {
    console.log('📞 ANSWER CALL STARTED:', {
      targetUserId,
      callType,
      callerInfo,
      hasSocket: !!socket,
      hasUser: !!user,
      hasPendingOffer: !!pendingOfferRef.current
    });
    
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
      console.log(`✅ Answering ${callType} call from ${callerInfo.name}`);
      
      // Request media with constraints
      const constraints = {
        audio: true, // Simplify constraints for better compatibility
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      };
      
      console.log('🎥 Requesting media for answer');
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Got local stream for answering with tracks:', stream.getTracks().length);
      
      setLocalStream(stream);
      localStreamRef.current = stream;
      
      // Create peer connection WITH the stream
      console.log('🔧 Creating peer connection with stream...');
      createPeerConnection(stream, targetUserId, callType);
      
      // Process any pending offer (from the caller)
      if (pendingOfferRef.current) {
        console.log('📥 Processing caller\'s offer after creating peer connection...');
        await processPendingOffer();
      } else {
        console.log('⚠️ No pending offer to process');
      }
      
      // Update UI state
      setIsIncomingCall(false);
      setIsCallActive(true);
      setCallStartTime(new Date());
      
      // Notify caller that we answered
      console.log('📤 Notifying caller of answer...');
      socket.emit('call:answered', {
        callerId: targetUserId
      });
      
      console.log(`✅ Answered call from ${callerInfo.name}`);
      toast.success(`✅ Call answered! ${callType === 'video' ? 'Video' : 'Voice'} connected`);
      
    } catch (error: any) {
      console.error('❌ Failed to answer call:', error);
      toast.error(`❌ Failed to answer call: ${error.message || 'Unknown error'}`);
      resetCallState();
    }
  }, [socket, user, callerInfo, targetUserId, callType, createPeerConnection, resetCallState, processPendingOffer]);

  const rejectCall = useCallback(() => {
    console.log('❌ REJECT CALL:', { targetUserId });

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
    
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log(`🔇 ${audioTrack.enabled ? 'Unmuted' : 'Muted'}`);
      }
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    console.log('🔈 TOGGLE SPEAKER');
    setIsSpeakerOn(!isSpeakerOn);
    console.log(`🔈 ${isSpeakerOn ? 'Speaker off' : 'Speaker on'}`);
  }, [isSpeakerOn]);

  const shareScreen = useCallback(async () => {
    console.log('🖥️ SHARE SCREEN');
    
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        } as MediaTrackConstraints,
        audio: false
      });
      
      if (localStreamRef.current && peerConnectionRef.current) {
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
          console.log('🖥️ Started screen sharing');
        }
      }
    } catch (error) {
      console.error('Failed to share screen:', error);
    }
  }, []);

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