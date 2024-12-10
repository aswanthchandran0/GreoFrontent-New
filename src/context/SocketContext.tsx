import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import { getSocketInstance } from "../services/socketInstance";

interface ISocketContext{
    socket:Socket
}

const SocketContext = createContext<ISocketContext | undefined>(undefined)

export const SocketProvider:React.FC<{children:React.ReactNode}> = ({children})=>{
    const socket = getSocketInstance()

    return <SocketContext.Provider value={{socket}}>{children}</SocketContext.Provider>
}

export const useSocket = ()=>{
    const context = useContext(SocketContext)

    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
      }
      return context;
}