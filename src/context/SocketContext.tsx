import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocketInstance } from "../services/socketInstance";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface ISocketContext{
    socket:Socket | null
    onlineUsers: { userId: string; socketId: string }[];
    sendMessage: (message: any) => void; // Function to send messages
  receiveMessage: any | null;
}

const SocketContext = createContext<ISocketContext | undefined>(undefined)
    
export const SocketProvider:React.FC<{children:React.ReactNode}> = ({children})=>{
  const localUser = useSelector((state:RootState)=> state.UserReducer.user)
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<{ userId: string; socketId: string }[]>([]);
    const [receiveMessage, setReceiveMessage] = useState<any | null>(null);
    useEffect(() => {
        const socketInstance = getSocketInstance();
        setSocket(socketInstance);
        
        socketInstance.on('connect', () => {
          if (localUser?.id) {
            socketInstance.emit("new-user-add", localUser.id);
          }
        });
        
        socketInstance.on("get-users", (users) => {
          setOnlineUsers(users);
        })

        socketInstance.on("receive-message", (data) => {
          setReceiveMessage(data);
        });
        
        return () => {
           socketInstance.off("get-users");
      socketInstance.off("receive-message");
      if (socketInstance && socketInstance.connected) {
        socketInstance.disconnect();
      }
        };
      }, [localUser?.id]);
       // Function to send a message through the socket
      const sendMessage = (message: any) => {
        if (socket) {
          socket.emit("send-message", message);
        }
      };
      
    return <SocketContext.Provider value={{socket, onlineUsers, sendMessage, receiveMessage}}>{children}</SocketContext.Provider>
}

export const useSocket = ()=>{
    const context = useContext(SocketContext)

    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
      }
      return context;
}
