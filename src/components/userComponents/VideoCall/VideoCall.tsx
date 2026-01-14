// src/components/VideoCall/VideoCall.tsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useVideoCall } from '../../../hooks/useVideoCall';
import { VideoCallUI } from './VideoCallUI';
import { User } from '../../../redux/slices/userSlice'; 
import { useParams } from 'react-router-dom';
import { getUserByIdApi } from '../../../services/user/api';
import PreCallScreen from './PreCallScreen';

interface VideoCallProps {
  onCallEnd?: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({ onCallEnd }) => {
  const { userId } = useParams();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const {
    // State from hook
    isCallActive,
    isCallIncoming,
    callStatus,
    incomingCall,
    
    // Actions from hook
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    initializeMedia,
  } = useVideoCall({
    localVideoRef,
    remoteVideoRef
  });

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserByIdApi(userId ?? "");
        console.log("respone of the fetchUser",response.data)
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Initialize media when component mounts
  useEffect(() => {
    initializeMedia();
  }, [initializeMedia]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Handle starting a call from PreCallScreen
  const handleStartCall = useCallback(async () => {
    if (!user?.id) return false;
    
    const success = await startCall(user.id);
    return success;
  }, [user, startCall]);

  // Handle call end
  const handleCallEnd = useCallback(() => {
    endCall();
    if (onCallEnd) {
      onCallEnd();
    }
  }, [endCall, onCallEnd]);

  // If we're in an active call or calling state, show VideoCallUI
  if (isCallActive || callStatus === 'active' || callStatus === 'calling') {
    return (
      <VideoCallUI
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isCallActive={isCallActive}
        isCallIncoming={isCallIncoming}
        callStatus={callStatus}
        incomingCall={incomingCall}
        onAcceptCall={acceptCall}
        onRejectCall={rejectCall}
        onEndCall={handleCallEnd}
        videoEnabled={videoEnabled}
        audioEnabled={audioEnabled}
        toggleVideo={toggleVideo}
        toggleAudio={toggleAudio}
      />
    );
  }

  // If we have an incoming call, show VideoCallUI with incoming call modal
  if (isCallIncoming) {
    return (
      <VideoCallUI
         localVideoRef={localVideoRef}
  remoteVideoRef={remoteVideoRef}
  isCallActive={isCallActive}
  isCallIncoming={isCallIncoming}
  callStatus={callStatus}
  incomingCall={incomingCall}
  onAcceptCall={acceptCall}
  onRejectCall={rejectCall}
  onEndCall={handleCallEnd}
  videoEnabled={videoEnabled}
  audioEnabled={audioEnabled}
  toggleVideo={toggleVideo}
  toggleAudio={toggleAudio}
      />
    );
  }

  // Otherwise, show the PreCallScreen (your existing UI)
  return (
    <PreCallScreen
      user={user}
      myVideo={localVideoRef}
      videoEnabled={videoEnabled}
      audioEnabled={audioEnabled}
      toggleVideo={toggleVideo}
      toggleAudio={toggleAudio}
      onStartCall={handleStartCall} 
      isCalling={(callStatus as string) === 'calling'}
    />
  );
};

export default VideoCall;