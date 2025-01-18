import { Children, createContext, useContext, useEffect, useRef, useState } from "react";
import { User } from "../redux/slices/userSlice";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useSocket } from "./SocketContext";
import Peer,{ Instance,SignalData } from 'simple-peer'

interface CallContextType {
  me: User | null;
  stream: MediaStream | undefined;
  receivingCall: boolean;
  inCall:boolean
  caller: User | null;
  callAccepted: boolean;
  setCallAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCallActive: React.Dispatch<React.SetStateAction<boolean>>;
  callEnded: boolean;
  myVideo: React.RefObject<HTMLVideoElement>;
  userVideo: React.RefObject<HTMLVideoElement>;
  callUser: (user: User | null) => void;
  answerCall: () => void;
  leaveCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  videoEnabled:boolean
  audioEnabled:boolean
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
   const me = useSelector((state:RootState)=>state.UserReducer.user)
   const [stream,setStream]= useState<MediaStream | undefined>(undefined)
   const [receivingCall,setReceivingCall] = useState<boolean>(false)
   const [caller,setCaller] = useState<User | null>(null)
   const [callerSignal,setCallerSignal] = useState<SignalData | string>('')
   const [callAccepted,setCallAccepted] = useState<boolean>(false)
   const [videoEnabled,setVideoEnabled] = useState<boolean>(true)
   const [audioEnabled,setAudioEnabled] = useState<boolean>(true)
   const [isCallActive,setIsCallActive] = useState<boolean>(false)
   const [ callEnded, setCallEnded] = useState<boolean>(false)
   const [inCall,setInCall] = useState<boolean>(false)
   const myVideo = useRef<HTMLVideoElement | null>(null)
   const userVideo = useRef<HTMLVideoElement | null>(null)
   const connectionRef= useRef<Instance | null>(null)

   const {socket}  = useSocket()
 
  useEffect(()=>{
    if(isCallActive  && myVideo.current){
   navigator.mediaDevices.getUserMedia({video:videoEnabled,audio:audioEnabled}).then((stream)=>{
    setStream(stream)
    if(myVideo.current){
      myVideo.current.srcObject =stream
    }

  }).catch((err)=> console.log("error accessing media devices",err))
}
  },[isCallActive,videoEnabled,audioEnabled])

  socket?.on('callUser',(data)=>{
    console.log("Received callUser data:", data);
    setReceivingCall(true)
    setCallerSignal(data.signal)
    console.log("callerSignal data",callerSignal)
    setCaller(data.from)
  })
  
  // call user

  const callUser = (user:User | null)=>{
     setCaller(user)
    setInCall(true)
    const peer = new Peer({
     initiator:true,
     trickle:false,
     stream:stream
    })

    peer.on("signal",(data)=>{
      socket?.emit("callUser",{
        signalData:data,
        from:me,
        userToCall:user?.id
      })
    })

  

    socket?.on("callAccepted",(data)=>{
      console.log("Call accepted with data:", data);
      setInCall(true)
      setCallAccepted(true)
      setCaller(data.from)
      try {
        // Attempt to signal the peer connection
        peer.signal(data.signal);
        console.log("Peer signal sent successfully");
      } catch (error) {
        console.error("Error while sending peer signal:", error);
      }
      peer.on("stream",(stream)=>{
        console.log("Remote stream received: B",stream);
        if(userVideo.current){
          userVideo.current.srcObject = stream
        }
      })

    })
   
      connectionRef.current = peer
  }

  
  // answer call
  const answerCall = () => {
    if (!stream) {
      console.log("Stream is undefined, trying to get media...");
      navigator.mediaDevices
        .getUserMedia({ video: videoEnabled, audio: audioEnabled })
        .then((newStream) => {
          setStream(newStream);
          if (myVideo.current) {
            myVideo.current.srcObject = newStream;
          }
          proceedWithAnswerCall(newStream);
        })
        .catch((err) => console.log("Error accessing media devices", err));
    } else {
      // Stream is already available, proceed with answering the call
      proceedWithAnswerCall(stream);
    }
  };
  
  const proceedWithAnswerCall = (newStream: MediaStream) => {
    setCallAccepted(true);
    setInCall(true);
    console.log("user video in answering call", userVideo);
    console.log("user stream", newStream);
  
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: newStream,
    });
  
    peer.on("signal", (data) => {
      socket?.emit("answerCall", { signal: data, to: caller, from: me });
    });
  
    peer.on("stream", (remoteStream) => {
      console.log("Remote stream received:", remoteStream);
      if (userVideo.current) {
        console.log("Setting user stream", remoteStream);
        userVideo.current.srcObject = remoteStream;
      }
    });
  
    peer.signal(callerSignal);
    connectionRef.current = peer;
  };
  


  // leave call 
  const leaveCall = () => {
    // console.log('call was leaved ')
    // console.log('caller in call leaving',caller)
    setInCall(false)
		setCallEnded(true)
    setIsCallActive(false)
    setReceivingCall(false)
    if(connectionRef.current){
      connectionRef.current.destroy()
    }

    // Notify the server
  socket?.emit("endCall", { to: caller?.id, from: me });
	}

  useEffect(()=>{
   socket?.on("callEnded",()=>{
    console.log("call ended ")
    leaveCall()
   })
  },[socket])

  // toggle audio
  const toggleAudio = ()=>{
    if(stream){
      stream.getAudioTracks().forEach((track)=>{
        track.enabled = !audioEnabled
      })
    }
    setAudioEnabled(!audioEnabled)
    socket?.emit("mediaToggle",{type:"audio",enabled:!audioEnabled,to:caller?.id})
  }
  
  // toggle video 
  const toggleVideo = ()=>{
    if(stream){
      stream.getVideoTracks().forEach((track)=>{
        track.enabled = !videoEnabled
      })
    }
    setVideoEnabled(!videoEnabled)
    socket?.emit("mediaToggle",{type:"video",enabled:!videoEnabled,to:caller?.id})
  }


  //  Notify media toggle to the user 

  useEffect(()=>{
    if(!socket) return
   
    const handleMediaToggle = (data:{type:string,enabled:boolean, to:string})=>{
      if(data.type ==='video'){
        if(userVideo.current && userVideo.current.srcObject){
          const videoTracks = (userVideo.current.srcObject as MediaStream).getVideoTracks()
          videoTracks.forEach((track)=>(track.enabled = data.enabled))
        }
      }

      if(data.type ==='audio'){
        if(userVideo.current && userVideo.current.srcObject){
          const audioTracks = (userVideo.current.srcObject as MediaStream).getAudioTracks()
            audioTracks.forEach((track)=>(track.enabled = data.enabled))
          
        }
      }
    }

    socket.on("mediaToggle", handleMediaToggle);

    return () => {
      socket.off("mediaToggle", handleMediaToggle);
    };
    
  },[socket,userVideo])

  return (
    <CallContext.Provider  value={{
        me,
        stream,
        receivingCall,
        caller,
        callAccepted,
        setCallAccepted,
        setIsCallActive,
        callEnded,
        myVideo,
        userVideo,
        callUser,
        answerCall,
        leaveCall,
        toggleAudio,
        toggleVideo,
        inCall,
        videoEnabled,
        audioEnabled,
      }}>{children}</CallContext.Provider>
  );
};





export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

