import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { MdCallEnd } from "react-icons/md";
import { MdCall } from "react-icons/md";
import { useCall } from "../../../context/CallContext";
import { useEffect, useRef, useState } from "react";
import CallScreen from "./CallScreen";
import { User } from "../../../redux/slices/userSlice";
import { getUserByIdApi } from "../../../services/user/api";
import { getUserMedia } from "../../../utils/mediaUtils";
const IncomingCallModal = () => {
  const { incomingCall, socket, setIncomingCall,peerRef } = useCall();

  const [user, setUser] = useState<User>();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [inCall,setInCall] = useState(false)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  

  // fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const respones = await getUserByIdApi(incomingCall?.senderId ?? "");
  
      setUser(respones.data);
    };
    fetchUser();
  }, [incomingCall?.senderId]);


  
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
   },[videoEnabled,audioEnabled,inCall])

   
   
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

  const acceptCall = async () => {
    try {
      const peerConnection = peerRef.current;
      if (!peerConnection) {
        console.error("PeerConnection is not initialized!");
        return;
      }

      // Set remote description from the received offer
      if (incomingCall?.offer) {
        console.log("Incoming offer:", incomingCall.offer);
        await peerConnection.setRemoteDescription(incomingCall.offer);
      }

      // Add local tracks (video/audio)
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => peerConnection.addTrack(track, mediaStream));
      }

      // Create an answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send the answer to the caller
      socket.emit("send-answer", { answer, receiverId: incomingCall?.senderId });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("send-ice-candidate", {
            candidate: event.candidate,
            receiverId: incomingCall?.senderId,
          });
        }
      };


      // Handle incoming remote stream
  
      peerConnection.ontrack = (event) => {
        console.log("Received remote stream:", event.streams[0]);
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      setInCall(true);
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };


  const rejectCall = () => {
    // Emit rejection event
    console.log("call ending ");
    socket.emit("end-video-call", { receiverId: incomingCall?.senderId });
    setIncomingCall(null);
  
  };

  return inCall ? (
    <CallScreen
    user={user}
    videoEnabled={videoEnabled}
    audioEnabled={audioEnabled}
    toggleVideo={toggleVideo}
    toggleAudio={toggleAudio}
    endCall={() => rejectCall()}
    remoteVideoRef={remoteVideoRef}
    localVideoRef={videoRef}
    localStream={mediaStream}
    remoteStream={remoteStream}
    socket={socket}
    opponentUserId={incomingCall?.senderId ?? ''}
    
    />
  ) : (
    <div className="absolute z-50 flex flex-col items-center justify-center space-y-2 rounded-lg shadow-xl bg-background-customDarkGray p4 right-3 top-20 w-72 h-80 ">
      <div className="w-24 h-24 overflow-hidden rounded-full">
        <img
          className="object-cover w-full h-full"
          src={incomingCall?.senderProfileImage || DEFAULT_PROFILE_IMAGE}
          alt="profile image"
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        <p className="text-xl font-bold font-outfit text-text-white">
          {incomingCall?.senderName || "Unknown User"}
        </p>
        <p className="text-[10px] cursor-pointer text-green-500">video call</p>
      </div>

      <div className="flex flex-row items-center justify-center w-full space-x-11">
        <div
          onClick={rejectCall}
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
          onClick={acceptCall}
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
  );
};

export default IncomingCallModal;
