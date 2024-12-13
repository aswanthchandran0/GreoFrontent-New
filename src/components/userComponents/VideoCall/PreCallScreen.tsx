import React from "react";
import { User } from "../../../redux/slices/userSlice"
import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";

interface PreCallScreenProps{
    user:User | undefined,
    videoEnabled: boolean;
    audioEnabled: boolean;
    toggleVideo: () => void;
    toggleAudio: () => void;
    startCall: () => void;
    videoRef: React.RefObject<HTMLVideoElement>;
}

const PreCallScreen:React.FC<PreCallScreenProps> = ({
    user,
    videoEnabled,
    audioEnabled,
    toggleVideo,
    toggleAudio,
    startCall,
    videoRef
})=>{
    return (
        <div className="flex items-center justify-center w-screen h-dvh bg-background-dark">
    <div className="flex flex-row gap-4 ">
      <div className="flex flex-col justify-center items-center  w-[650px] rounded-md h-96 bg-background-customGray">
      <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full bg-black"
          style={{ display: videoEnabled ? "block" : "none" }}
        ></video>
        {!videoEnabled && (
          <div className="flex flex-col items-center justify-center w-full h-full space-y-2">
            <FaVideoSlash className="text-3xl cursor-pointer text-text-darkGray" />
            <p className="font-bold font-golos text-text-darkGray">Camera off</p>
          </div>
        )}

        <div className="w-full p-2 mt-auto bg-background-customDarkGray">
          <div className="flex items-center justify-center w-full h-full gap-5">
          <button
              onClick={toggleVideo}
              className={`w-10 h-10 p-2 text-2xl rounded-full cursor-pointer ${
                videoEnabled ? "bg-green-500" : "bg-gray-500"
              }`}
            >
              {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
            </button>
            <button
              onClick={toggleAudio}
              className={`w-10 h-10 p-2 text-2xl rounded-full cursor-pointer ${
                audioEnabled ? "bg-green-500" : "bg-gray-500"
              }`}
            >
              {audioEnabled ? <AiFillAudio /> : <AiOutlineAudioMuted />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center space-y-5 rounded-md w-80 h-96 bg-background-customGray">
        <div className="flex w-20 h-20 overflow-hidden rounded-full">
          <img
            className="object-cover w-full h-full"
            src={user?.profileImage || DEFAULT_PROFILE_IMAGE}
            alt="profile image"
          />
        </div>

        <div className="flex flex-col items-center justify-center w-full">
          <span className="text-xl font-bold font-outfit text-text-white ">
            {user?.name || ""}
          </span>
          <span className="text-sm font-golos text-text-white">
            Ready To Call?
          </span>
        </div>

        <button onClick={startCall} className="items-center justify-center px-2 font-bold bg-blue-500 rounded-full font-golos text-text-white">
          Start call
        </button>
      </div>
    </div>
  </div>
    )
}

export default PreCallScreen