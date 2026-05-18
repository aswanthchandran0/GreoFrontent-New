// src/components/call/IncomingCallModal.tsx
import React, { useEffect, useState } from 'react';
import { 
  FaPhone, 
  FaPhoneSlash, 
  FaVideo, 
  FaMicrophone,
  FaVolumeUp,
  FaUser
} from 'react-icons/fa';
import { useCall } from '../../../context/CallContext';
import toast from 'react-hot-toast';

const IncomingCallModal: React.FC = () => {
  const { 
    callerInfo, 
    callType, 
    answerCall, 
    rejectCall 
  } = useCall();
  
  const [ringing, setRinging] = useState(true);
  
  useEffect(() => {
    // Play ringtone
    const audio = new Audio('/sounds/ringtone.mp3');
    audio.loop = true;
    
    if (ringing) {
      audio.play().catch(console.error);
    }
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [ringing]);
  
  if (!callerInfo) return null;
 
  const handleAnswer = () => {
    setRinging(false);
    answerCall();
  };
  
  const handleReject = () => {
    setRinging(false);
    rejectCall();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative p-8 text-center">
          {/* Caller Info */}
          <div className="mb-8">
            <div className="relative mx-auto mb-6">
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-purple-500/50 shadow-2xl">
                  {callerInfo.image ? (
                    <img 
                      src={callerInfo.image} 
                      alt={callerInfo.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <FaUser className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                </div>
                {/* Ringing animation */}
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/30 animate-ping" />
                <div className="absolute inset-4 rounded-full border-4 border-purple-500/20 animate-ping delay-500" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {callerInfo.name}
            </h2>
            <div className="flex items-center justify-center gap-2 text-purple-300">
              {callType === 'video' ? (
                <>
                  <FaVideo className="w-4 h-4" />
                  <span>Video Call...</span>
                </>
              ) : (
                <>
                  <FaMicrophone className="w-4 h-4" />
                  <span>Voice Call...</span>
                </>
              )}
            </div>
          </div>
          
          {/* Call Type Indicator */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/50 rounded-full">
              <div className={`w-3 h-3 rounded-full ${ringing ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-white/80">
                {ringing ? 'Ringing...' : 'Connecting...'}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-6">
            {/* Reject Button */}
            <button
              onClick={handleReject}
              className="relative group"
            >
              <div className="absolute inset-0 bg-red-500 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-2xl">
                <FaPhoneSlash className="w-8 h-8 text-white" />
              </div>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-red-300 font-medium whitespace-nowrap">
                Decline
              </span>
            </button>
            
            {/* Answer Button */}
            <button
              onClick={handleAnswer}
              className="relative group"
            >
              <div className="absolute inset-0 bg-green-500 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <FaPhone className="w-10 h-10 text-white" />
              </div>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-green-300 font-medium whitespace-nowrap">
                {callType === 'video' ? 'Video' : 'Answer'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;