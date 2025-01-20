
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";
import { User } from "../../../redux/slices/userSlice";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";



interface Props{
  me:User|null
  user:User|null
  myVideo: React.RefObject<HTMLVideoElement>;
  userVideo: React.RefObject<HTMLVideoElement>;
  toggleVideo: () => void;
  toggleAudio: () => void;
      videoEnabled: boolean;
    audioEnabled: boolean;
    leaveCall:()=>void
}


const CallScreen:React.FC<Props> = ({myVideo,videoEnabled,audioEnabled,toggleAudio,toggleVideo,me,leaveCall,userVideo})=>{
  
  console.log("user video in call screeen ",userVideo)
  return (
           <div className="flex items-center justify-center w-screen h-dvh bg-background-dark">
      <div className="relative w-full h-full">
        <video
        ref={userVideo}
          autoPlay
          className="absolute inset-0 object-cover w-full h-full bg-black"
          style={{transform: "scaleX(-1)",}}
        ></video>

        <div className="absolute w-1/4 border-2 rounded-md border-background-Grayish bottom-4 right-4">
        {
          videoEnabled ?

          <video
          ref={myVideo}
          autoPlay
          muted
           className="w-full h-full"
           style={{transform: "scaleX(-1)", }} 
        ></video>
        :
        (
          <div className="flex p-4 ">
            <div className="flex flex-col items-center justify-center w-full h-full space-y-4">

            <div className="w-24 h-24 overflow-hidden rounded-full">
            <img className="object-cover w-full h-full" src={ me?.profileImage || DEFAULT_PROFILE_IMAGE} alt="" />
            </div>

            <p className="font-bold text-md font-golos text-text-white">{me?.name || 'user'}</p>
            </div>
          </div>
        )
        }
        
        
        </div>
        
        <div className="absolute flex gap-4 transform -translate-x-1/2 bottom-4 left-1/2">

          <div onClick={toggleVideo} className="flex flex-col items-center justify-center space-y-2 ">
          <div className={`flex flex-col p-3 ${videoEnabled ? "bg-green-500" : "bg-gray-500"} rounded-full hover:cursor-pointer text-text-white`}>
          {videoEnabled ? <FaVideo  className="text-2xl" /> : <FaVideoSlash  className="text-2xl" />}
          </div>
          
        </div>

          <div onClick={toggleAudio} className="flex flex-col items-center justify-center space-y-2 ">
          <div className={`flex flex-col p-3 ${audioEnabled ? "bg-green-500" : "bg-gray-500"} rounded-full hover:cursor-pointer text-text-white`}>
          {audioEnabled ? <AiFillAudio  className="text-2xl" /> : <AiOutlineAudioMuted  className="text-2xl" />}
          </div>
          
        </div>


          <div onClick={leaveCall}  className="flex flex-col items-center justify-center space-y-2 ">
          <div className="flex flex-col p-2 bg-red-500 rounded-full hover:cursor-pointer text-text-white">
            <MdCallEnd className="text-3xl" />
          </div>
          
        </div>

        </div>
      </div>
    </div>
  )
  
}

export default CallScreen

// interface CallScreenProps{
//   user:User | undefined,
//   videoEnabled: boolean;
//   audioEnabled: boolean;
//   toggleVideo: () => void;
//   toggleAudio: () => void;
//   endCall: () => void;
//   remoteVideoRef: React.RefObject<HTMLVideoElement>;
//   localVideoRef: React.RefObject<HTMLVideoElement>;
//   localStream: MediaStream | null;
//   remoteStream: MediaStream | null;
//   socket: Socket | null
//   opponentUserId: string;
// }

// const CallScreen: React.FC<CallScreenProps>  = ({
//   user,
//   videoEnabled,
//   audioEnabled,
//   toggleVideo,
//   toggleAudio,
//   endCall,
//   remoteVideoRef,
//   localVideoRef,
//   localStream,
//   remoteStream,
//   socket,
//   opponentUserId
//   })=>{

//     console.log('user in call screen',user)
//      const localUser = useSelector((state:RootState)=> state.UserReducer.user)
//   useEffect(()=>{
//     if (localVideoRef.current && localStream){
//       localVideoRef.current.srcObject = localStream
//       localVideoRef.current.style.transform = "scaleX(1)"
//     }

//     if(remoteVideoRef.current && remoteStream){
//       remoteVideoRef.current.srcObject = remoteStream
//       remoteVideoRef.current.style.transform = "scaleX(1)"
//     }
    
//     if(localStream){
//       const videoTrack = localStream.getVideoTracks()[0]
//       if(videoTrack) videoTrack.enabled = videoEnabled

//       const audioTrack = localStream.getAudioTracks()[0]
//       if(audioTrack) audioTrack.enabled = audioEnabled
//     }
//   },[localStream,remoteStream,videoEnabled,audioEnabled,localVideoRef,remoteVideoRef])

//   const endVideoCall = ()=>{
//     console.log('video call end request was reached')
//     localStream?.getTracks().forEach((track) => track.stop());
//     remoteStream?.getTracks().forEach((track) => track.stop());
//     socket?.emit("end-video-call", { opponentUserId });
//     endCall()
//   }
  
//   useEffect(()=>{
//     if (socket) {
//       socket.on("video-call-ended", endVideoCall);
//     }
//     return () => {
//       if (socket) {
//         socket.off("video-call-ended", endVideoCall);
//       }
//     };
    
//   },[socket, localUser?.id, opponentUserId])
 
 
//     return(
//         <div className="flex items-center justify-center w-screen h-dvh bg-background-dark">
//       <div className="relative w-full h-full">
//         <video
//           ref={remoteVideoRef}
//           autoPlay
//           className="absolute inset-0 object-cover w-full h-full bg-black"
//           style={{transform: "scaleX(-1)",}}
//         ></video>

//         <div className="absolute w-1/4 border-2 rounded-md border-background-Grayish bottom-4 right-4">
//         {
//           videoEnabled && localStream ?

//           <video
//           ref={localVideoRef}
//           autoPlay
//           muted
//            className="w-full h-full"
//            style={{transform: "scaleX(-1)", }} 
//         ></video>
//         :
//         (
//           <div className="flex p-4 ">
//             <div className="flex flex-col items-center justify-center w-full h-full space-y-4">

//             <div className="w-24 h-24 overflow-hidden rounded-full">
//             <img className="object-cover w-full h-full" src={ localUser?.profileImage || DEFAULT_PROFILE_IMAGE} alt="" />
//             </div>

//             <p className="font-bold text-md font-golos text-text-white">{localUser?.name || 'user'}</p>
//             </div>
//           </div>
//         )
//         }
        
        
//         </div>
        
//         <div className="absolute flex gap-4 transform -translate-x-1/2 bottom-4 left-1/2">

//           <div onClick={toggleVideo} className="flex flex-col items-center justify-center space-y-2 ">
//           <div className={`flex flex-col p-3 ${videoEnabled ? "bg-green-500" : "bg-gray-500"} rounded-full hover:cursor-pointer text-text-white`}>
//           {videoEnabled ? <FaVideo  className="text-2xl" /> : <FaVideoSlash  className="text-2xl" />}
//           </div>
          
//         </div>

//           <div onClick={toggleAudio} className="flex flex-col items-center justify-center space-y-2 ">
//           <div className={`flex flex-col p-3 ${audioEnabled ? "bg-green-500" : "bg-gray-500"} rounded-full hover:cursor-pointer text-text-white`}>
//           {audioEnabled ? <AiFillAudio  className="text-2xl" /> : <AiOutlineAudioMuted  className="text-2xl" />}
//           </div>
          
//         </div>


//           <div onClick={endVideoCall}  className="flex flex-col items-center justify-center space-y-2 ">
//           <div className="flex flex-col p-2 bg-red-500 rounded-full hover:cursor-pointer text-text-white">
//             <MdCallEnd className="text-3xl" />
//           </div>
          
//         </div>

//         </div>
//       </div>
//     </div>
//     )
// }


// export default CallScreen