import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketContext";
import { Socket } from "socket.io-client";
import { createPeerConnection } from "../utils/webrtc";


export interface IincomingCall{
  offer: RTCSessionDescriptionInit
   senderId: string
   senderName:string
   senderProfileImage:string
}
interface ISocketContext {
    socket: Socket;
    incomingCall: IincomingCall | null;
    setIncomingCall:(call: IincomingCall | null) => void;
    peerRef: React.RefObject<RTCPeerConnection | null>;
  }

const CallContext = createContext<ISocketContext | undefined>(undefined)

export const CallProvider:React.FC<{children:ReactNode}> = ({children})=>{
  const [incomingCall, setIncomingCall] = useState<IincomingCall | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const {socket} = useSocket()
  


   // Initialize PeerConnection
   useEffect(() => {
     console.log('the useEffect of peerConnection initialiation working')
    if (!peerRef.current) {
      peerRef.current = createPeerConnection();
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    };
  }, []);


   // Listen for incoming offers and call end events

  // Listen for offers
  useEffect(()=>{
  
    const handleIncomingOffer = ({
      offer,
      senderId,
      senderName,
      senderProfileImage,
    }: IincomingCall) => {
      setIncomingCall({ offer, senderId, senderName, senderProfileImage });
    };

    const handleVideoCallByOpponent = ()=>{
      setIncomingCall(null)
    }

    if(socket){
    socket.on("receive-offer", handleIncomingOffer);
     socket.on('video-call-ended',handleVideoCallByOpponent)

    }
    return () => {
     socket?.off("receive-offer");
     socket?.off("video-call-ended", handleVideoCallByOpponent);
   };   
  },[socket])
 


    return (
        <CallContext.Provider value={{socket,incomingCall,setIncomingCall,peerRef}}>
          {children}
        </CallContext.Provider>
      );
}



export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) {
      throw new Error("useCall must be used within a CallProvider");
    }
    return context;
  };



