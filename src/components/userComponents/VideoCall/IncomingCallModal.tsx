import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { MdCallEnd } from "react-icons/md";
import { MdCall } from "react-icons/md";
import { useCall } from "../../../context/CallContext";
import { createPeerConnection } from "../../../utils/webrtc";
import { useEffect, useRef } from "react";

const IncomingCallModal = () => {
  const { incomingCall ,socket,setIncomingCall} = useCall();
  if (!incomingCall) return null;
  const { senderName, senderProfileImage,offer,senderId} = incomingCall;
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const acceptCall  = async ()=>{
    try{
      // Create a new peer connection
     const peerConnection = createPeerConnection()
     peerRef.current = peerConnection
     
      // Set remote description from the received offer
     await peerConnection.setRemoteDescription(offer)
 
     // Add local tracks (video/audio)
     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
     stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      // Create an answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
        // Send the answer to the caller
        socket.emit("send-answer", { answer, receiverId: senderId });

        // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("send-ice-candidate", {
          candidate: event.candidate,
          receiverId: senderId,
        });
      }
    };
    
      // Handle incoming remote stream
      peerConnection.ontrack = (event) => {
        console.log("Received remote stream:", event.streams[0]);
        // You can set the stream to a remote video element here
      };

      console.log("Call accepted and answer sent");
    }catch(error){
      console.error("Error accepting call:", error);
    }
 
  }

  const rejectCall = () => {
    // Emit rejection event
    console.log('call ending ')
    socket.emit("end-video-call", { receiverId: senderId });
      setIncomingCall(null)
    console.log('incomingCall',incomingCall)
  };
  
  return (
    <div className="absolute z-50 flex flex-col items-center justify-center space-y-2 rounded-lg shadow-xl bg-background-customDarkGray p4 right-3 top-20 w-72 h-80 ">
      <div className="w-24 h-24 overflow-hidden rounded-full">
        <img
          className="object-cover w-full h-full"
          src={senderProfileImage || DEFAULT_PROFILE_IMAGE}
          alt="profile image"
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        <p className="text-xl font-bold font-outfit text-text-white">
          {senderName || "Unknown User"}
        </p>
        <p className="text-[10px] cursor-pointer text-green-500">video call</p>
      </div>

      <div className="flex flex-row items-center justify-center w-full space-x-11">
        <div   onClick={rejectCall} className="flex flex-col items-center justify-center space-y-2 ">
          <div className="flex flex-col p-2 bg-red-500 rounded-full hover:cursor-pointer text-text-white">
            <MdCallEnd className="text-2xl" />
          </div>
          <p className="text-[10px] cursor-pointer text-text-white font-golos">
            Decline
          </p>
        </div>

        <div  onClick={acceptCall} className="flex flex-col items-center justify-center space-y-2 ">
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
