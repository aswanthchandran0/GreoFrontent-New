// src/components/VideoCall/VideoCallUI.tsx
import React from 'react';

interface VideoCallUIProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  isCallActive: boolean;
  isCallIncoming: boolean;
  callStatus: 'idle' | 'calling' | 'ringing' | 'active' | 'ended';
  incomingCall: { callId: string; callerId: string } | null;
  onAcceptCall: () => Promise<boolean>;
  onRejectCall: () => void;
  onEndCall: () => void;
  // ADD THESE MISSING PROPS:
  videoEnabled: boolean;
  audioEnabled: boolean;
  toggleVideo: () => void;
  toggleAudio: () => void;
}

export const VideoCallUI: React.FC<VideoCallUIProps> = ({
  localVideoRef,
  remoteVideoRef,
  isCallActive,
  isCallIncoming,
  callStatus,
  incomingCall,
  onAcceptCall,
  onRejectCall,
  onEndCall,
  // ADD THESE:
  videoEnabled,
  audioEnabled,
  toggleVideo,
  toggleAudio,
}) => {
  const getStatusText = () => {
    switch (callStatus) {
      case 'calling': return 'Calling...';
      case 'ringing': return 'Incoming Call';
      case 'active': return 'Call Active';
      case 'ended': return 'Call Ended';
      default: return 'Video Call';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 bg-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{getStatusText()}</h2>
          {(isCallActive || callStatus === 'calling') && (
            <div className="flex gap-2">
              {/* Add media controls */}
              <button
                onClick={toggleVideo}
                className={`w-10 h-10 p-2 text-lg rounded-full cursor-pointer ${
                  videoEnabled ? "bg-green-500" : "bg-gray-500"
                }`}
              >
                {videoEnabled ? '📹' : '📵'}
              </button>
              <button
                onClick={toggleAudio}
                className={`w-10 h-10 p-2 text-lg rounded-full cursor-pointer ${
                  audioEnabled ? "bg-green-500" : "bg-gray-500"
                }`}
              >
                {audioEnabled ? '🎤' : '🔇'}
              </button>
              <button
                onClick={onEndCall}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                End Call
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Areas */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Local Video */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
            You {!videoEnabled && "(Camera off)"}
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
            Remote
          </div>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {isCallIncoming && incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg text-center max-w-sm w-full mx-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📞</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Incoming Video Call</h3>
            <p className="text-gray-600 mb-4">From: {incomingCall.callerId}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onRejectCall}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                Decline
              </button>
              <button
                onClick={onAcceptCall}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};