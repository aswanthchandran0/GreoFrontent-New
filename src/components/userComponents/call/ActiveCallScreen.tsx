// src/components/call/ActiveCallScreen.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  FaPhoneSlash, 
  FaMicrophone, 
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaVideo,
  FaVideoSlash,
  FaExpand,
  FaUser,
  FaDesktop,
  FaSpinner,
  FaInfoCircle,
  FaSignal,
  FaWifi,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useCall } from '../../../context/CallContext';

const ActiveCallScreen: React.FC = () => {
  const {
    callType,
    callerInfo,
    localStream,
    remoteStream,
    isMuted,
    isSpeakerOn,
    callTime,
    endCall,
    toggleMute,
    toggleSpeaker,
    shareScreen,
    peerConnection
  } = useCall();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioElementRef = useRef<HTMLAudioElement | null>(null);
  
  const [isRemoteVideoReady, setIsRemoteVideoReady] = useState(false);
  const [isLocalVideoReady, setIsLocalVideoReady] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [hasRemoteAudio, setHasRemoteAudio] = useState(false);
  const [isRemoteAudioReady, setIsRemoteAudioReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [iceConnectionState, setIceConnectionState] = useState<string>('');
  const [signalingState, setSignalingState] = useState<string>('');
  const [showDebug, setShowDebug] = useState(true);
  
  // Debug logging - enhanced
  useEffect(() => {
    console.log('🎥 ActiveCallScreen Debug:', {
      callType,
      hasCallerInfo: !!callerInfo,
      hasLocalStream: !!localStream,
      hasRemoteStream: !!remoteStream,
      peerConnection: !!peerConnection,
      peerConnectionState: peerConnection?.connectionState,
      iceState: peerConnection?.iceConnectionState,
      signalingState: peerConnection?.signalingState,
      localTracks: localStream?.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState
      })),
      remoteTracks: remoteStream?.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState
      }))
    });
  }, [callType, callerInfo, localStream, remoteStream, peerConnection]);
  
  // Monitor peer connection states
  useEffect(() => {
    if (!peerConnection) return;
    
    const updateConnectionStatus = () => {
      const connectionState = peerConnection.connectionState;
      const iceState = peerConnection.iceConnectionState;
      const sigState = peerConnection.signalingState;
      
      setIceConnectionState(iceState);
      setSignalingState(sigState);
      
      console.log('🔌 Connection States:', {
        connectionState,
        iceConnectionState: iceState,
        signalingState: sigState
      });
      
      // Update connection status display
      if (connectionState === 'connected') {
        setConnectionStatus('Connected');
      } else if (connectionState === 'connecting') {
        setConnectionStatus('Connecting...');
      } else if (connectionState === 'disconnected') {
        setConnectionStatus('Disconnected');
      } else if (connectionState === 'failed') {
        setConnectionStatus('Failed');
      }
    };
    
    // Set initial state
    updateConnectionStatus();
    
    // Add listeners for state changes
    peerConnection.addEventListener('connectionstatechange', updateConnectionStatus);
    peerConnection.addEventListener('iceconnectionstatechange', updateConnectionStatus);
    peerConnection.addEventListener('signalingstatechange', updateConnectionStatus);
    
    return () => {
      peerConnection.removeEventListener('connectionstatechange', updateConnectionStatus);
      peerConnection.removeEventListener('iceconnectionstatechange', updateConnectionStatus);
      peerConnection.removeEventListener('signalingstatechange', updateConnectionStatus);
    };
  }, [peerConnection]);
  
  // Set up LOCAL video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log('🎥 Setting up LOCAL video stream');
      
      // Clear previous stream
      localVideoRef.current.srcObject = null;
      
      // Set new stream
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.muted = true; // Always mute local video
      localVideoRef.current.playsInline = true;
      
      // Ensure video plays
      localVideoRef.current.play().then(() => {
        console.log('✅ Local video playing');
        setIsLocalVideoReady(true);
      }).catch(error => {
        console.error('❌ Failed to play local video:', error);
        setIsLocalVideoReady(false);
      });
    }
    
    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [localStream]);
  
  // Monitor remote stream changes
  useEffect(() => {
    if (remoteStream) {
      console.log('🎬 REMOTE STREAM MONITOR: Stream updated');
      
      const videoTracks = remoteStream.getVideoTracks();
      const audioTracks = remoteStream.getAudioTracks();
      
      console.log('📊 Remote stream details:', {
        id: remoteStream.id,
        active: remoteStream.active,
        tracks: remoteStream.getTracks().length,
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length,
        trackDetails: remoteStream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          label: t.label
        }))
      });
      
      setHasRemoteVideo(videoTracks.length > 0);
      setHasRemoteAudio(audioTracks.length > 0);
      
      // Reset readiness states when stream changes
      setIsRemoteVideoReady(false);
      setIsRemoteAudioReady(false);
      
    } else {
      console.log('📭 No remote stream available');
      setHasRemoteVideo(false);
      setHasRemoteAudio(false);
      setIsRemoteVideoReady(false);
      setIsRemoteAudioReady(false);
    }
  }, [remoteStream]);
  
  // Set up remote media - FIXED VERSION
  const setupRemoteMedia = useCallback(async () => {
    console.log('🎬 SETUP REMOTE MEDIA CALLED:', {
      callType,
      hasRemoteStream: !!remoteStream,
      hasRemoteVideoRef: !!remoteVideoRef.current,
      hasRemoteVideo,
      hasRemoteAudio
    });
    
    if (!remoteStream) {
      console.log('📭 No remote stream to set up');
      return;
    }
    
    // Clean up previous media elements
    if (remoteAudioElementRef.current) {
      console.log('🧹 Cleaning up previous audio element');
      remoteAudioElementRef.current.pause();
      remoteAudioElementRef.current.srcObject = null;
      remoteAudioElementRef.current = null;
    }
    
    if (callType === 'voice') {
      // VOICE CALL: Use audio element
      console.log('🔊 Setting up VOICE call audio');
      
      const audioTracks = remoteStream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.log('🔇 No audio tracks in remote stream for voice call');
        return;
      }
      
      // Create new audio element
      const audioElement = new Audio();
      remoteAudioElementRef.current = audioElement;
      
      // Set audio properties
      audioElement.srcObject = remoteStream;
      audioElement.muted = false;
      audioElement.volume = isSpeakerOn ? 1.0 : 0.0;
      audioElement.autoplay = true;
      audioElement.playsInline = true;
      
      console.log('🎵 Audio element configured for voice call');
      
      // Try to play the audio
      try {
        console.log('▶️ Attempting to play audio...');
        await audioElement.play();
        console.log('✅ Remote audio playing successfully for voice call');
        setIsRemoteAudioReady(true);
        
        // Add event listeners for audio
        audioElement.addEventListener('playing', () => {
          console.log('🔊 Audio playing event');
          setIsRemoteAudioReady(true);
        });
        
        audioElement.addEventListener('error', (e) => {
          console.error('❌ Audio error event:', e);
          setIsRemoteAudioReady(false);
        });
        
      } catch (error: any) {
        console.error('❌ Failed to play remote audio:', error);
        
        if (error.name === 'NotAllowedError') {
          console.error('🔇 Autoplay was blocked by browser');
          // Will retry on user interaction
        }
        
        setIsRemoteAudioReady(false);
      }
      
    } else if (callType === 'video') {
      // VIDEO CALL: Use video element for both video and audio
      console.log('🎬 Setting up VIDEO call media');
      
      // Wait for video ref to be available
      if (!remoteVideoRef.current) {
        console.error('❌ Video ref is not available!');
        console.error('This is the BUG - React ref not yet attached to DOM');
        return;
      }
      
      const videoElement = remoteVideoRef.current;
      const videoTracks = remoteStream.getVideoTracks();
      const audioTracks = remoteStream.getAudioTracks();
      
      console.log('📊 Video call stream details:', {
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length
      });
      
      // Clear any existing stream
      if (videoElement.srcObject) {
        console.log('🧹 Clearing existing video stream');
        videoElement.srcObject = null;
      }
      
      // Set video properties
      videoElement.srcObject = remoteStream;
      videoElement.muted = false;
      videoElement.volume = isSpeakerOn ? 1.0 : 0.0;
      videoElement.playsInline = true;
      videoElement.autoplay = true;
      
      console.log('🎯 Video element configured for video call');
      
      // Try to play the video
      try {
        console.log('▶️ Attempting to play video...');
        await videoElement.play();
        console.log('✅ Remote video/audio playing successfully');
        setIsRemoteVideoReady(true);
        setIsRemoteAudioReady(audioTracks.length > 0);
        
      } catch (error: any) {
        console.error('❌ Failed to play remote video:', error);
        
        if (error.name === 'NotAllowedError') {
          console.error('🔇 Autoplay was blocked by browser');
          // Will retry on user interaction
        }
        
        setIsRemoteVideoReady(false);
        setIsRemoteAudioReady(false);
      }
      
      // Add event listeners
      const handleCanPlay = () => {
        console.log('🎬 Video can play event');
        setIsRemoteVideoReady(true);
      };
      
      const handlePlaying = () => {
        console.log('▶️ Video playing event');
        setIsRemoteVideoReady(true);
        if (audioTracks.length > 0) {
          setIsRemoteAudioReady(true);
        }
      };
      
      const handleError = (e: Event) => {
        console.error('❌ Video error event:', e);
        const video = e.target as HTMLVideoElement;
        console.error('Video error details:', {
          error: video.error,
          errorCode: video.error?.code,
          errorMessage: video.error?.message
        });
        setIsRemoteVideoReady(false);
        setIsRemoteAudioReady(false);
      };
      
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('playing', handlePlaying);
      videoElement.addEventListener('error', handleError);
      
      // Listen for track ended events
      remoteStream.getTracks().forEach(track => {
        track.onended = () => {
          console.log(`📴 Remote ${track.kind} track ended`);
          if (track.kind === 'video') {
            setHasRemoteVideo(false);
            setIsRemoteVideoReady(false);
          } else if (track.kind === 'audio') {
            setHasRemoteAudio(false);
            setIsRemoteAudioReady(false);
          }
        };
      });
      
      // Return cleanup function
      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('playing', handlePlaying);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [remoteStream, callType, isSpeakerOn, hasRemoteVideo, hasRemoteAudio]);
  
  // FIXED: Use separate effects to handle timing issues
  useEffect(() => {
    if (callType === 'voice' && remoteStream) {
      console.log('🔊 Triggering voice call media setup');
      setupRemoteMedia();
    }
  }, [remoteStream, callType, setupRemoteMedia]);
  
  // FIXED: Special handling for video calls - runs after component mounts
  useEffect(() => {
    if (callType === 'video' && remoteStream) {
      console.log('🎬 Video call detected, waiting for DOM...');
      
      // Use a timeout to ensure video ref is available
      const setupVideoTimeout = setTimeout(() => {
        console.log('⏰ Checking video ref after delay...');
        if (remoteVideoRef.current) {
          console.log('✅ Video ref is now available, setting up media');
          setupRemoteMedia();
        } else {
          console.error('❌ Video ref still not available after delay!');
          console.error('This indicates a React ref/DOM timing issue');
          
          // Try one more time with longer delay
          setTimeout(() => {
            if (remoteVideoRef.current && remoteStream) {
              console.log('🔄 Second attempt to setup video media');
              setupRemoteMedia();
            }
          }, 500);
        }
      }, 100); // Small delay to ensure DOM is updated
      
      return () => clearTimeout(setupVideoTimeout);
    }
  }, [remoteStream, callType, setupRemoteMedia]);
  
  // Also trigger setup when remoteVideoRef becomes available
  useEffect(() => {
    if (callType === 'video' && remoteStream && remoteVideoRef.current) {
      console.log('🎬 Video ref became available, setting up media');
      setupRemoteMedia();
    }
  }, [callType, remoteStream, remoteVideoRef.current, setupRemoteMedia]);
  
  // Update audio volume when speaker changes
  useEffect(() => {
    console.log(`🔈 Volume update: Speaker ${isSpeakerOn ? 'ON' : 'OFF'}`);
    
    if (callType === 'video' && remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.volume = isSpeakerOn ? 1.0 : 0.0;
      console.log(`🔈 Video volume set to: ${isSpeakerOn ? '1.0' : '0.0'}`);
    }
    
    if (callType === 'voice' && remoteAudioElementRef.current) {
      remoteAudioElementRef.current.volume = isSpeakerOn ? 1.0 : 0.0;
      console.log(`🔈 Audio volume set to: ${isSpeakerOn ? '1.0' : '0.0'}`);
    }
  }, [isSpeakerOn, callType]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up ActiveCallScreen');
      
      // Clean up audio element
      if (remoteAudioElementRef.current) {
        remoteAudioElementRef.current.pause();
        remoteAudioElementRef.current.srcObject = null;
        remoteAudioElementRef.current = null;
      }
      
      // Clean up video elements
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, []);
  
  // Handle fullscreen
  const handleFullscreen = () => {
    const elem = remoteVideoRef.current || document.documentElement;
    
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Add a click handler to help with autoplay
  const handleScreenClick = () => {
    console.log('🖱️ Screen clicked, attempting to play media...');
    
    if (callType === 'video' && remoteVideoRef.current && remoteVideoRef.current.paused) {
      remoteVideoRef.current.play()
        .then(() => {
          console.log('✅ Video started after user interaction');
          setIsRemoteVideoReady(true);
        })
        .catch(error => {
          console.error('❌ Failed to play video after click:', error);
        });
    }
    
    if (callType === 'voice' && remoteAudioElementRef.current && remoteAudioElementRef.current.paused) {
      remoteAudioElementRef.current.play()
        .then(() => {
          console.log('✅ Audio started after user interaction');
          setIsRemoteAudioReady(true);
        })
        .catch(error => {
          console.error('❌ Failed to play audio after click:', error);
        });
    }
  };
  
  // Toggle debug overlay with Ctrl+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        setShowDebug(prev => !prev);
        console.log(`🔧 Debug overlay ${showDebug ? 'hidden' : 'shown'}`);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDebug]);
  
  if (!callerInfo) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black" onClick={handleScreenClick}>
      {/* Debug overlay - toggle with Ctrl+D */}
      {showDebug && (
        <div className="absolute top-20 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs max-w-xs z-50">
          <div className="text-white font-mono">
            <div className="flex items-center gap-2 mb-2">
              <FaInfoCircle className="w-4 h-4 text-blue-400" />
              <span className="font-bold">Connection Debug</span>
              <button 
                onClick={() => setShowDebug(false)}
                className="ml-auto text-white/50 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-1">
              <div>Call Type: <span className="text-purple-300">{callType}</span></div>
              <div>Connection: <span className={connectionStatus === 'Connected' ? 'text-green-400' : 'text-yellow-400'}>{connectionStatus}</span></div>
              <div>ICE State: <span className={
                iceConnectionState === 'connected' ? 'text-green-400' : 
                iceConnectionState === 'checking' ? 'text-yellow-400' : 
                'text-red-400'
              }>{iceConnectionState || 'unknown'}</span></div>
              <div>Signaling: <span className="text-blue-400">{signalingState || 'unknown'}</span></div>
              <div>Local Stream: <span className={localStream ? 'text-green-400' : 'text-red-400'}>{localStream ? '✅' : '❌'}</span></div>
              <div>Remote Stream: <span className={remoteStream ? 'text-green-400' : 'text-red-400'}>{remoteStream ? '✅' : '❌'}</span></div>
              <div>Remote Video: <span className={hasRemoteVideo ? 'text-green-400' : 'text-red-400'}>{hasRemoteVideo ? '✅' : '❌'}</span></div>
              <div>Remote Audio: <span className={hasRemoteAudio ? 'text-green-400' : 'text-red-400'}>{hasRemoteAudio ? '✅' : '❌'}</span></div>
              <div>Peer Connection: <span className={peerConnection ? 'text-green-400' : 'text-red-400'}>{peerConnection ? '✅' : '❌'}</span></div>
              <div>Video Ref: <span className={remoteVideoRef.current ? 'text-green-400' : 'text-red-400'}>{remoteVideoRef.current ? '✅' : '❌'}</span></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Remote Video/User */}
      <div className="absolute inset-0">
        {callType === 'video' && hasRemoteVideo ? (
          <div className="relative w-full h-full">
            {/* CRITICAL: This video element MUST be rendered */}
            <video
              id="remoteVideo"
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-cover bg-black"
              onCanPlay={() => {
                console.log('✅ onCanPlay event fired');
                setIsRemoteVideoReady(true);
              }}
              onPlaying={() => {
                console.log('▶️ onPlaying event fired');
                setIsRemoteVideoReady(true);
              }}
              onError={(e) => {
                console.error('❌ onError event fired:', e);
                const video = e.target as HTMLVideoElement;
                console.error('Video error details:', {
                  error: video.error,
                  errorCode: video.error?.code,
                  errorMessage: video.error?.message
                });
                setIsRemoteVideoReady(false);
              }}
            />
            
            {/* Loading overlay */}
            {!isRemoteVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <FaSpinner className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                  <p className="text-white text-lg">Connecting video/audio...</p>
                  <p className="text-white/70 text-sm mt-2">
                    Video: {hasRemoteVideo ? 'Received ✓' : 'Not received'} |
                    Audio: {hasRemoteAudio ? 'Received ✓' : 'Not received'}
                  </p>
                  <p className="text-white/50 text-xs mt-2">
                    Click the screen to start playback if stuck
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2">
                      <FaSignal className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm">{connectionStatus}</span>
                    </div>
                    <div className="text-white/60 text-xs mt-1">
                      ICE: {iceConnectionState} | Signaling: {signalingState}
                    </div>
                  </div>
                  {!remoteVideoRef.current && (
                    <div className="mt-4 p-3 bg-red-900/50 rounded-lg">
                      <div className="flex items-center gap-2 text-red-300">
                        <FaExclamationTriangle className="w-4 h-4" />
                        <span className="text-sm">Video ref not available</span>
                      </div>
                      <p className="text-red-300/70 text-xs mt-1">
                        This is a React timing issue. Click screen to retry.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Track status indicator */}
            <div className="absolute top-4 left-4 flex gap-2">
              {hasRemoteVideo && (
                <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${isRemoteVideoReady ? 'bg-green-900/80' : 'bg-yellow-900/80'}`}>
                  <div className={`w-2 h-2 rounded-full ${isRemoteVideoReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                  <FaVideo className={`w-3 h-3 ${isRemoteVideoReady ? 'text-green-300' : 'text-yellow-300'}`} />
                  <span className={`text-xs ${isRemoteVideoReady ? 'text-green-300' : 'text-yellow-300'}`}>
                    {isRemoteVideoReady ? 'Video Live' : 'Video Connecting...'}
                  </span>
                </div>
              )}
              {hasRemoteAudio && (
                <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${isRemoteAudioReady ? 'bg-blue-900/80' : 'bg-yellow-900/80'}`}>
                  <div className={`w-2 h-2 rounded-full ${isRemoteAudioReady ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500'}`} />
                  <FaMicrophone className={`w-3 h-3 ${isRemoteAudioReady ? 'text-blue-300' : 'text-yellow-300'}`} />
                  <span className={`text-xs ${isRemoteAudioReady ? 'text-blue-300' : 'text-yellow-300'}`}>
                    {isRemoteAudioReady ? 'Audio Live' : 'Audio Connecting...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center">
            <div className="relative mb-8">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl">
                {callerInfo.image ? (
                  <img 
                    src={callerInfo.image} 
                    alt={callerInfo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <FaUser className="w-24 h-24 text-white/80" />
                  </div>
                )}
              </div>
              
              {/* Audio status indicator */}
              {hasRemoteAudio && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${isRemoteAudioReady ? 'bg-green-900/80' : 'bg-yellow-900/80'}`}>
                    <div className={`w-2 h-2 rounded-full ${isRemoteAudioReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                    <span className={`text-xs ${isRemoteAudioReady ? 'text-green-300' : 'text-yellow-300'}`}>
                      Audio {isRemoteAudioReady ? 'Connected ✓' : 'Connecting...'}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Video status indicator */}
              {callType === 'video' && !hasRemoteVideo && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-900/80 rounded-full">
                    <FaSpinner className="w-3 h-3 text-yellow-300 animate-spin" />
                    <span className="text-xs text-yellow-300">Video Connecting...</span>
                  </div>
                </div>
              )}
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              {callerInfo.name}
            </h2>
            <p className="text-purple-300 font-mono text-lg">{callTime}</p>
            
            {/* Connection status */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 mb-2">
                <FaWifi className={`w-4 h-4 ${
                  connectionStatus === 'Connected' ? 'text-green-400' : 
                  connectionStatus === 'Connecting...' ? 'text-yellow-400' : 
                  'text-red-400'
                }`} />
                <span className={`text-sm ${
                  connectionStatus === 'Connected' ? 'text-green-400' : 
                  connectionStatus === 'Connecting...' ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {connectionStatus}
                </span>
              </div>
              
              {!hasRemoteVideo && callType === 'video' && (
                <div className="text-yellow-400 text-sm flex items-center gap-2">
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Waiting for video stream...</span>
                </div>
              )}
              {!hasRemoteAudio && (
                <div className="text-red-400 text-sm flex items-center gap-2">
                  <span>No audio stream received</span>
                </div>
              )}
              {hasRemoteAudio && !isRemoteAudioReady && (
                <div className="text-blue-400 text-sm flex items-center gap-2">
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Starting audio... (click screen if stuck)</span>
                </div>
              )}
              
              {/* Connection details */}
              <div className="text-white/50 text-xs mt-2 text-center">
                <div>ICE: {iceConnectionState || 'unknown'}</div>
                <div>Signaling: {signalingState || 'unknown'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Local Video Preview (for video calls) */}
      {callType === 'video' && localStream && isLocalVideoReady && (
        <div className="absolute top-4 right-4 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>You</span>
            <span className="text-green-300">
              {isMuted ? '🔇 Muted' : '🎤'}
            </span>
          </div>
        </div>
      )}
      
      {/* Call Controls */}
      <div className="absolute bottom-8 left-0 right-0">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-center gap-6">
              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className="relative group"
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                <div className={`absolute inset-0 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50 ${isMuted ? 'bg-red-500' : 'bg-gray-700'}`} />
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 ${isMuted ? 'bg-red-600' : 'bg-gray-800'}`}>
                  {isMuted ? (
                    <FaMicrophoneSlash className="w-6 h-6 text-white" />
                  ) : (
                    <FaMicrophone className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-white/70 whitespace-nowrap">
                  {isMuted ? 'Muted' : 'Mute'}
                </div>
              </button>
              
              {/* Speaker Toggle */}
              <button
                onClick={toggleSpeaker}
                className="relative group"
                aria-label={isSpeakerOn ? "Turn off speaker" : "Turn on speaker"}
              >
                <div className={`absolute inset-0 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50 ${isSpeakerOn ? 'bg-blue-500' : 'bg-gray-700'}`} />
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 ${isSpeakerOn ? 'bg-blue-600' : 'bg-gray-800'}`}>
                  {isSpeakerOn ? (
                    <FaVolumeUp className="w-6 h-6 text-white" />
                  ) : (
                    <FaVolumeMute className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-white/70 whitespace-nowrap">
                  {isSpeakerOn ? 'Speaker' : 'Muted'}
                </div>
              </button>
              
              {/* End Call Button */}
              <button
                onClick={endCall}
                className="relative group"
                aria-label="End call"
              >
                <div className="absolute inset-0 bg-red-500 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-70" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <FaPhoneSlash className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-red-300 whitespace-nowrap">
                  End Call
                </div>
              </button>
              
              {/* Screen Share (video calls only) */}
              {callType === 'video' && (
                <button
                  onClick={shareScreen}
                  className="relative group"
                  aria-label="Share screen"
                >
                  <div className="absolute inset-0 bg-purple-500 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50" />
                  <div className="relative w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <FaDesktop className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-white/70 whitespace-nowrap">
                    Screen
                  </div>
                </button>
              )}
              
              {/* Fullscreen (video calls only) */}
              {callType === 'video' && hasRemoteVideo && (
                <button
                  onClick={handleFullscreen}
                  className="relative group"
                  aria-label="Toggle fullscreen"
                >
                  <div className="absolute inset-0 bg-gray-700 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50" />
                  <div className="relative w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <FaExpand className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-xs text-white/70 whitespace-nowrap">
                    Fullscreen
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Bar Info */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 
            connectionStatus === 'Connecting...' ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500 animate-pulse'
          }`} />
          <span className="text-white font-medium">{callTime}</span>
          <span className="text-purple-300">
            {callType === 'video' ? 'Video Call' : 'Voice Call'}
          </span>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full">
          <div className="flex flex-col items-end">
            <span className="text-white/90 font-medium">{callerInfo.name}</span>
            <div className="flex items-center gap-2 text-xs">
              {hasRemoteAudio && (
                <span className={`flex items-center gap-1 ${isRemoteAudioReady ? 'text-green-400' : 'text-yellow-400'}`}>
                  <FaMicrophone className="w-3 h-3" />
                  {isRemoteAudioReady ? 'Audio Live' : 'Audio'}
                </span>
              )}
              {hasRemoteVideo && callType === 'video' && (
                <span className={`flex items-center gap-1 ${isRemoteVideoReady ? 'text-blue-400' : 'text-yellow-400'}`}>
                  <FaVideo className="w-3 h-3" />
                  {isRemoteVideoReady ? 'Video Live' : 'Video'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveCallScreen;