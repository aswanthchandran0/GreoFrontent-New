import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { Socket } from "socket.io-client";


interface IincomingCall{
  offer: RTCSessionDescriptionInit
   senderId: string
   senderName:string
   senderProfileImage:string
}
interface ISocketContext {
    socket: Socket;
    incomingCall: IincomingCall | null;
    setIncomingCall:()=>void
  }

const CallContext = createContext<ISocketContext | undefined>(undefined)

export const CallProvider:React.FC<{children:ReactNode}> = ({children})=>{
  const [incomingCall, setIncomingCall] = useState<IincomingCall | null>(null);
  const {socket} = useSocket()
  // Listen for offers
  useEffect(()=>{
  
    const handleVideoCallByOpponent = ()=>{
   console.log('incoming call opponet declined')
      setIncomingCall(null)
    }

    if(socket){
     socket.on('receive-offer' ,({offer,senderId,senderName,senderProfileImage})=>{
       setIncomingCall({offer,senderId,senderName,senderProfileImage})
      
     })

     socket.on('video-call-ended',handleVideoCallByOpponent)
    }
    return () => {
     socket?.off("receive-offer");
   };   
  },[socket])
 


    return (
        <CallContext.Provider value={{socket,incomingCall,setIncomingCall}}>
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



