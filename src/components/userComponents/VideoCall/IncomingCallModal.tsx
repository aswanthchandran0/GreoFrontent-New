import { MdCall, MdCallEnd } from "react-icons/md";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { useCall } from "../../../context/CallContext";
import CallScreen from "./CallScreen";
import { useEffect, useRef } from "react";
import ringtone from "../../../assets/sounds/iPHONE RINGTONE CALLING SOUND EFFECT.mp3"


const IncomingCallModal = () => {
   const {
    inCall,
    caller,
    setIsCallActive,
    toggleAudio,
    toggleVideo,
    videoEnabled,
    audioEnabled,
    myVideo,
    me,
    leaveCall,
    userVideo,
  answerCall
  } = useCall()

  const audioRef = useRef<HTMLAudioElement | null>(null);
   // set is call isCallActive
    useEffect(() => {
      setIsCallActive(true);
      
      if(!inCall && caller){
        const audio = new Audio(ringtone)
        audio.loop = true
        audio.play().catch((err) =>console.log("Error playing sound:",err))
        audioRef.current = audio; 
      }

      return ()=>{
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0; // Reset the playback position
          audioRef.current = null;
        }
      }
    }, [inCall,setIsCallActive]);

 return inCall ? (
    <CallScreen
    me={me}
    user={caller}
    myVideo={myVideo}
    userVideo={userVideo}
    toggleAudio={toggleAudio}
    toggleVideo={toggleVideo}
    videoEnabled={videoEnabled}
    audioEnabled={audioEnabled}
    leaveCall={leaveCall} />
  ) : (
    <div className="absolute z-50 flex flex-col items-center justify-center space-y-2 rounded-lg shadow-xl bg-background-customDarkGray p4 right-3 top-20 w-72 h-80 ">
       <div className="w-24 h-24 overflow-hidden rounded-full">
       <img
          className="object-cover w-full h-full"
          src={caller?.profileImage || DEFAULT_PROFILE_IMAGE}
          alt="profile image"
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        <p className="text-xl font-bold font-outfit text-text-white">
          {caller?.name || "Unknown User"}
        </p>
        <p className="text-[10px] cursor-pointer text-green-500">video call</p>
      </div>

      <div className="flex flex-row items-center justify-center w-full space-x-11">
        <div
          onClick={leaveCall}
          className="flex flex-col items-center justify-center space-y-2 "
        >
          <div className="flex flex-col p-2 bg-red-500 rounded-full hover:cursor-pointer text-text-white">
            <MdCallEnd className="text-2xl" />
          </div>
          <p className="text-[10px] cursor-pointer text-text-white font-golos">
            Decline
          </p>
        </div>

        <div
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause(); // Stop sound when answering the call
            }
            answerCall();
          }}
          className="flex flex-col items-center justify-center space-y-2 "
        >
          <div className="p-2 bg-green-400 rounded-full hover:cursor-pointer text-text-white">
            <MdCall className="text-2xl" />
          </div>
          <p className="text-[10px] cursor-pointer text-text-white font-golos">
            Accept
          </p>
        </div>
      </div>
    </div>
   )
};


export default IncomingCallModal;
