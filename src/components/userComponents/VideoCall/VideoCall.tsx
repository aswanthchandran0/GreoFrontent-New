import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { User } from "../../../redux/slices/userSlice";
import { getUserByIdApi } from "../../../services/user/api";
import { getUserMedia } from "../../../utils/mediaUtils";
import { createPeerConnection } from "../../../utils/webrtc";
import { useSocket } from "../../../context/SocketContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import CallScreen from "./CallScreen";
import PreCallScreen from "./PreCallScreen";


const VideoCall = () => {
  const { userId } = useParams();
  const localUser = useSelector((state:RootState)=> state.UserReducer.user)
  const [user, setUser] = useState<User>();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [inCall,setInCall] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  
  const { socket } = useSocket();

  
  // fetch user 
  useEffect(() => {
      const fetchUser = async () => {
        const respones = await getUserByIdApi(userId ?? "");
        setUser(respones.data);
      }
      fetchUser();
  }, [userId]);

  // Initialize media stream
   useEffect(()=>{  
    const initMedia = async () =>{    
        try{    
            const stream = await getUserMedia(videoEnabled,audioEnabled)
            setMediaStream(stream)
            if(videoRef.current){
                videoRef.current.srcObject = stream
            }
          }catch(err){
              console.error("Error initializing media:", err);
          }
    }
    initMedia()
    return ()=>{
        mediaStream?.getTracks().forEach((track)=>track.stop())
    }
   },[videoEnabled,audioEnabled])

 // Toggle video
   const toggleVideo = ()=>{
    setVideoEnabled((prev)=> !prev)
    mediaStream?.getVideoTracks().forEach((track) => (track.enabled = !videoEnabled));
   }

   // Toggle audio
   const toggleAudio = ()=>{
    setAudioEnabled((prev)=> !prev)
    mediaStream?.getAudioTracks().forEach((track)=>(track.enabled = !audioEnabled))
   }

  // Start call
   const startCall = async ()=>{
    try{
       const peerConnection = createPeerConnection()
       peerRef.current = peerConnection
       
        // Add local stream tracks to the connection
       mediaStream?.getTracks().forEach((track)=> {
        peerConnection.addTrack(track,mediaStream)
       })

        // Handle ICE candidates
        peerConnection.onicecandidate = (event)=>{
            if(event.candidate){
                socket?.emit("send-ice-candidate", {
                    candidate: event.candidate,
                    receiverId: userId,
                  });
            }
        }


      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

     // Create and send offer
   const offer = await peerConnection.createOffer();
   await peerConnection.setLocalDescription(offer); 

   // Send the offer through signaling
   socket?.emit("send-offer", {
    offer,
    senderId: localUser?.id,
    receiverId:user?.id,
    senderName:localUser?.name,
    senderProfileImage:localUser?.profileImage
  });
    
  setInCall(true)
    } catch (error) {
        console.error("Error starting call:", error);
      }
   }


   

useEffect(()=>{
if(socket){
  socket.on("receive-ice-candidate", async({candidate})=>{
    if(peerRef.current){
      try{
       await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate))
       console.log("Added received ICE candidate:", candidate);
      }catch(error){
        console.error("Error adding received ICE candidate:", error);
      }
    }
  })
}
return ()=>{
  if (socket) {
    socket.off("receive-ice-candidate");
  }
}
},[socket])

// Cleanup on unmount
useEffect(() => {
  return () => {
    mediaStream?.getTracks().forEach((track) => track.stop());
    peerRef.current?.close();
  };
}, []);


// receiving answeres

useEffect(()=>{
 if(socket){
  socket.on('receive-answer', async({answer})=>{
    if(peerRef.current){
      try{
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer))
        console.log("Remote description set with received answer");
      }catch(error){
        console.log("Error setting remote description with answer:", error)
      }
    }
  })
 }

  return ()=>{
    if(socket){
      socket.off('receive-answer')
    }
  }
},[socket])



return inCall ? (
  <CallScreen
    user={user}
    videoEnabled={videoEnabled}
    audioEnabled={audioEnabled}
    toggleVideo={toggleVideo}
    toggleAudio={toggleAudio}
    endCall={() => setInCall(false)}
    remoteVideoRef={remoteVideoRef}
    localVideoRef={localVideoRef}
    localStream={mediaStream}
    socket={socket}
    opponentUserId={userId ?? ''}
  />
) : (
  <PreCallScreen
    user={user}
    videoEnabled={videoEnabled}
    audioEnabled={audioEnabled}
    toggleVideo={toggleVideo}
    toggleAudio={toggleAudio}
    startCall={startCall}
    videoRef={videoRef}
  />
);

}

export default VideoCall;
