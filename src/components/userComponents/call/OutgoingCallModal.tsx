// src/components/call/OutgoingCallModal.tsx
import React, { useEffect, useState } from 'react';
import { 
  FaPhoneSlash, 
  FaUser,
  FaMicrophone,
  FaVideo
} from 'react-icons/fa';
import { useCall } from '../../../context/CallContext';
import toast from 'react-hot-toast';

const OutgoingCallModal: React.FC = () => {
   const { 
    callerInfo, 
    callType, 
    endCall,
    isCallActive // Add this
  } = useCall();
  
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(()=>{
 console.log('Outgoing call modal mounted',callerInfo);
 toast('Calling '+callerInfo?.name)
  },[])
   // Auto-start WebRTC when call is answered
  useEffect(() => {
    if (isCallActive) {
      console.log('Call answered, WebRTC connection should be established');
    }
  }, [isCallActive]);
  
  
  if (!callerInfo) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden border border-blue-500/30">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative p-8 text-center">
          {/* Caller Info */}
          <div className="mb-8">
            <div className="relative mx-auto mb-6">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-blue-500/50 shadow-2xl">
                {callerInfo.image ? (
                  <img 
                    src={callerInfo.image} 
                    alt={callerInfo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                    <FaUser className="w-16 h-16 text-white/80" />
                  </div>
                )}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {callerInfo.name}
            </h2>
            <div className="flex items-center justify-center gap-2 text-blue-300">
              {callType === 'video' ? (
                <>
                  <FaVideo className="w-4 h-4" />
                  <span>Calling{dots}</span>
                </>
              ) : (
                <>
                  <FaMicrophone className="w-4 h-4" />
                  <span>Calling{dots}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Status */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/50 rounded-full">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-white/80">
                Waiting for answer{dots}
              </span>
            </div>
          </div>
          
          {/* Cancel Button */}
          <div className="flex justify-center">
            <button
              onClick={endCall}
              className="relative group"
            >
              <div className="absolute inset-0 bg-red-500 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 opacity-50" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-2xl">
                <FaPhoneSlash className="w-8 h-8 text-white" />
              </div>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-red-300 font-medium whitespace-nowrap">
                Cancel
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutgoingCallModal;