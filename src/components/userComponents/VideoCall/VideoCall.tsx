import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { AiFillAudio, AiOutlineAudioMuted } from "react-icons/ai";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { User } from "../../../redux/slices/userSlice";
import { getUserByIdApi } from "../../../services/user/api";
import { getUserMedia } from "../../../utils/mediaUtils";
import { createPeerConnection } from "../../../utils/webrtc";
import { useSocket } from "../../../context/SocketContext";

const VideoCall = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User>();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [inCall,setInCall] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null);

  const { socket } = useSocket();
  const peerRef = useRef<RTCPeerConnection | null>(null);
  
  // fetch user 
  useEffect(() => {
      const fetchUser = async () => {
        const respones = await getUserByIdApi(userId ?? "");
        setUser(respones.data);
      }
      fetchUser();
  }, []);

  // Get init user media
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


   const toggleVideo = ()=>{
    setVideoEnabled((prev)=> !prev)
    mediaStream?.getVideoTracks().forEach((track) => (track.enabled = !videoEnabled));
   }

   const toggleAudio = ()=>{
    setAudioEnabled((prev)=> !prev)
    mediaStream?.getAudioTracks().forEach((track)=>(track.enabled = !audioEnabled))
   }

   // call Start

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
                socket.emit("send-ice-candidate", {
                    candidate: event.candidate,
                    receiverId: userId,
                  });
            }
        }

   // Create an offer
   const offer = await peerConnection.createOffer();
   await peerConnection.setLocalDescription(offer); 
   
   // Send the offer through signaling
   socket.emit("send-offer", {
    offer,
    receiverId: userId,
  });
    
  console.log("Offer sent:", offer);
  setInCall(true)
    } catch (error) {
        console.error("Error starting call:", error);
      }
   }


   // Listening the signal server's received offer
   useEffect(()=>{
     if(socket){
      socket.on('receive-offer',async({offer,senderId})=>{
        console.log("Received offer:",offer)
        try{
           const peerConnection = createPeerConnection()
            peerRef.current = peerConnection
            
            // Add local media tracks to the connection
            mediaStream?.getTracks().forEach((track)=>{
              peerConnection.addTrack(track,mediaStream)
            })

            // set remote desicrption with the received offer
            await peerConnection.remoteDescription(new RTCSessionDescription(offer))
            
            // Handle ICE candidate
            peerConnection.onicecandidate = (event) =>{
              if(event.candidate){
                console.log("Sending  ICE candidate...")
                socket.emit("send-ice-candidate",{
                  candidate:event.candidate,
                  receiverId:senderId
                })
              }
            }

            // create and send an answer to the signaling server
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)
            
            socket.emit("send-answer",{
              answer,
              receiverId:senderId
            })
            console.log("answer sent:",answer)
            setInCall(true)
        }catch(error){
          console.error("Error handling offer:", error);
        }
      })
     }

     return () => {
      socket?.off("receive-offer");
    };
    
   },[socket,mediaStream])
  
   // Render call screen 
   const renderCallScreen =  ()=> (
    <div  className="flex items-center justify-center w-screen h-dvh bg-background-dark"> 
    
    </div>
   )

   // Render pre call screen 

   const renderPreCallScreen = () =>(
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
 
   return inCall ? renderCallScreen() : renderPreCallScreen()
};

export default VideoCall;
