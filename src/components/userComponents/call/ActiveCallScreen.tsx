// src/components/call/ActiveCallScreen.tsx
import React, { useRef, useEffect } from 'react';
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
  FaDesktop
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
    shareScreen
  } = useCall();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);
  
  if (!callerInfo) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Remote Video/User */}
      <div className="absolute inset-0">
       {callType === 'video' && remoteStream ? (
  <video
    id="remoteVideo"
    ref={remoteVideoRef}
    autoPlay
    playsInline
    muted={false}
    className="w-full h-full object-cover"
    onLoadedMetadata={(e) => {
      e.currentTarget.play().catch(console.error);
    }}
  />
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
              {/* Connection indicator */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-1 px-3 py-1 bg-black/70 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-white/80">Connected</span>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">
              {callerInfo.name}
            </h2>
            <p className="text-purple-300 font-mono text-lg">{callTime}</p>
          </div>
        )}
      </div>
      
      {/* Local Video Preview (for video calls) */}
      {callType === 'video' && localStream && (
        <div className="absolute top-4 right-4 w-48 h-64 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
            You
          </div>
        </div>
      )}
      
      {/* Call Controls */}
      <div className="absolute bottom-8 left-0 right-0">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-center gap-6">
              {/* Mute Toggle */}
              <button
                onClick={toggleMute}
                className="relative group"
              >
                <div className={`absolute inset-0 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50 ${isMuted ? 'bg-red-500' : 'bg-gray-700'}`} />
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 ${isMuted ? 'bg-red-600' : 'bg-gray-800'}`}>
                  {isMuted ? (
                    <FaMicrophoneSlash className="w-6 h-6 text-white" />
                  ) : (
                    <FaMicrophone className="w-6 h-6 text-white" />
                  )}
                </div>
              </button>
              
              {/* Speaker Toggle */}
              <button
                onClick={toggleSpeaker}
                className="relative group"
              >
                <div className={`absolute inset-0 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50 ${isSpeakerOn ? 'bg-blue-500' : 'bg-gray-700'}`} />
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 ${isSpeakerOn ? 'bg-blue-600' : 'bg-gray-800'}`}>
                  {isSpeakerOn ? (
                    <FaVolumeUp className="w-6 h-6 text-white" />
                  ) : (
                    <FaVolumeMute className="w-6 h-6 text-white" />
                  )}
                </div>
              </button>
              
              {/* End Call Button */}
              <button
                onClick={endCall}
                className="relative group"
              >
                <div className="absolute inset-0 bg-red-500 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-70" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  <FaPhoneSlash className="w-8 h-8 text-white" />
                </div>
              </button>
              
              {/* Screen Share (video calls only) */}
              {callType === 'video' && (
                <button
                  onClick={shareScreen}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-purple-500 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50" />
                  <div className="relative w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <FaDesktop className="w-6 h-6 text-white" />
                  </div>
                </button>
              )}
              
              {/* Fullscreen (video calls only) */}
              {callType === 'video' && (
                <button
                  onClick={() => document.documentElement.requestFullscreen()}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gray-700 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50" />
                  <div className="relative w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <FaExpand className="w-6 h-6 text-white" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Top Bar Info */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white font-medium">{callTime}</span>
          <span className="text-purple-300">
            {callType === 'video' ? 'Video Call' : 'Voice Call'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-full">
          <span className="text-white/90">{callerInfo.name}</span>
        </div>
      </div>
    </div>
  );
};

export default ActiveCallScreen;