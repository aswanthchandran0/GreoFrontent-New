import { useParams } from "react-router-dom";
import { useCall } from "../../../context/CallContext";
import PreCallScreen from "./PreCallScreen";
import { useEffect, useState } from "react";
import { User } from "../../../redux/slices/userSlice";
import { getUserByIdApi } from "../../../services/user/api";
import CallScreen from "./CallScreen";

const VideoCall = () => {
  const { userId } = useParams();
  const {
    inCall,
    setIsCallActive,
    toggleAudio,
    toggleVideo,
    videoEnabled,
    audioEnabled,
    myVideo,
    callUser,
    me,
    leaveCall,
    userVideo
  } = useCall();
  const [user, setUser] = useState<User | null>(null);

  // fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const respones = await getUserByIdApi(userId ?? "");
      setUser(respones.data);
    };
    fetchUser();
  }, [userId]);

  // set is call isCallActive

  useEffect(() => {
    setIsCallActive(true);
  }, []);

  return inCall ? (
    <CallScreen
      me={me}
      user={user}
      myVideo={myVideo}
      userVideo={userVideo}
      toggleAudio={toggleAudio}
      toggleVideo={toggleVideo}
      videoEnabled={videoEnabled}
      audioEnabled={audioEnabled}
      leaveCall={leaveCall}
    />
  ) : (
    <PreCallScreen
      user={user}
      myVideo={myVideo}
      toggleAudio={toggleAudio}
      toggleVideo={toggleVideo}
      videoEnabled={videoEnabled}
      audioEnabled={audioEnabled}
      callUser={callUser}
    />
  );
};

export default VideoCall;

// const VideoCall = () => {
// const { userId } = useParams();
// const {
//   socket,
//   incomingCall,
//   setIncomingCall,
//   peerRef,
//   mediaStream,
//   remoteStream,
//   videoEnabled,
//   audioEnabled,
//   startCall,
//   toggleAudio,
//   toggleVideo,
// } = useCall();

// const localUser = useSelector((state:RootState)=> state.UserReducer.user)
// const [user, setUser] = useState<User>();
// const [inCall,setInCall] = useState(false)
// const videoRef = useRef<HTMLVideoElement>(null);
// const remoteVideoRef = useRef<HTMLVideoElement>(null);

// const [videoEnabled, setVideoEnabled] = useState(true);
// const [audioEnabled, setAudioEnabled] = useState(true);
// const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
// const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

// const localVideoRef = useRef<HTMLVideoElement>(null);

// useEffect(() => {
//   if (videoRef.current && mediaStream) {
//     videoRef.current.srcObject = mediaStream;
//   }
// }, [mediaStream]);

// const handleStartCall = () => {
//   if (userId && user) {
//     startCall(userId, user);
//     setInCall(true);
//   }
// };

// // fetch user
// useEffect(() => {
//     const fetchUser = async () => {
//       const respones = await getUserByIdApi(userId ?? "");
//       setUser(respones.data);
//     }
//     fetchUser();
// }, [userId]);

// // Initialize media stream
//  useEffect(()=>{
//   const initMedia = async () =>{
//       try{
//           const stream = await getUserMedia(videoEnabled,audioEnabled)
//           setMediaStream(stream)
//           if(videoRef.current){
//               videoRef.current.srcObject = stream
//           }
//         }catch(err){
//             console.error("Error initializing media:", err);
//         }
//   }
//   initMedia()
//   return ()=>{
//       mediaStream?.getTracks().forEach((track)=>track.stop())
//   }
//  },[videoEnabled,audioEnabled])

// Toggle video
//  const toggleVideo = ()=>{
//   setVideoEnabled((prev)=> !prev)
//   mediaStream?.getVideoTracks().forEach((track) => (track.enabled = !videoEnabled));
//  }

// Toggle audio
//  const toggleAudio = ()=>{
//   setAudioEnabled((prev)=> !prev)
//   mediaStream?.getAudioTracks().forEach((track)=>(track.enabled = !audioEnabled))
//  }

// Start call
//  const startCall = async ()=>{
//   try{
//     console.log('request was reaching inside starta acall')

//     if (!peerRef.current || peerRef.current.signalingState === "closed") {
//       peerRef.current = createPeerConnection();  // Initialize a new connection
//     }

//     // Add local stream tracks to the connection
//     mediaStream?.getTracks().forEach((track) => {
//       peerRef.current?.addTrack(track, mediaStream);
//     });

//       // Handle ICE candidates
//       peerRef.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("send-ice-candidate", {
//             candidate: event.candidate,
//             receiverId: userId,
//           });
//         }
//       };

//     // Handle remote stream
//     peerRef.current.ontrack = (event) => {
//       setRemoteStream(event.streams[0]);
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//     };

//    // Create and send offer
//    const offer = await peerRef.current.createOffer();
//    await peerRef.current.setLocalDescription(offer);
//  console.log('socket in start call',socket)
//  // Send the offer through signaling
//  socket?.emit("send-offer", {
//   offer,
//   senderId: localUser?.id,
//   receiverId:user?.id,
//   senderName:localUser?.name,
//   senderProfileImage:localUser?.profileImage
// });

// setInCall(true)
//   } catch (error) {
//       console.error("Error starting call:", error);
//     }
//  }

// Handle incoming ICE candidates
// useEffect(()=>{
// if(socket){
//   socket.on("receive-ice-candidate", async({candidate})=>{
//     if(peerRef.current){
//       try{
//        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate))
//        console.log("Added received ICE candidate:", candidate);
//       }catch(error){
//         console.error("Error adding received ICE candidate:", error);
//       }
//     }
//   })
// }
// return ()=>{
//   if (socket) {
//     socket.off("receive-ice-candidate");
//   }
// }
// },[socket])

// Cleanup on unmount
// useEffect(() => {
//   return () => {
//     mediaStream?.getTracks().forEach((track) => track.stop());
//     peerRef.current?.close();
//   };
// }, [mediaStream, peerRef]);

// Handle receiving answers
// useEffect(()=>{
//  if(socket){
//   socket.on('receive-answer', async({answer})=>{
//     if(peerRef.current){
//       try{
//         await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer))
//       }catch(error){
//         console.log("Error setting remote description with answer:", error)
//       }
//     }
//   })
//  }

//   return ()=>{
//     if(socket){
//       socket.off('receive-answer')
//     }
//   }
// },[socket])

// return(
//   <div>
//     this is the video call
//   </div>
// )
// }
