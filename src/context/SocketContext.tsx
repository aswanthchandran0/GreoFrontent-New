import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocketInstance } from "../services/socketInstance";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { IMessage } from "../interface/messageInterface";
import { ISendMessage } from "../interface/sendMessageInterface";

interface ISocketContext{
    socket:Socket | null
    onlineUsers: { userId: string; socketId: string }[];
    sendMessage: (message:ISendMessage) => void; // Function to send messages
  receiveMessage: IMessage | null;
}

const SocketContext = createContext<ISocketContext | undefined>(undefined)
    
export const SocketProvider:React.FC<{children:React.ReactNode}> = ({children})=>{
  const localUser = useSelector((state:RootState)=> state.UserReducer.user)
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<{ userId: string; socketId: string }[]>([]);
    const [receiveMessage, setReceiveMessage] = useState<IMessage | null>(null);
    useEffect(() => {
      const socketInstance = getSocketInstance();
      setSocket(socketInstance);
    
      const handleConnect = () => {
        if (localUser?.id) {
          socketInstance.emit("new-user-add", localUser.id);
          console.log("Emitting new-user-add on connect");
        }
      };
    
      // Immediate emission if already connected
      if (socketInstance.connected && localUser?.id) {
        socketInstance.emit("new-user-add", localUser.id);
        console.log("Emitting new-user-add immediately");
      }
    
      socketInstance.on('connect', handleConnect);
    
      const handleUsersUpdate = (users: { userId: string; socketId: string }[]) => {
        console.log("Received updated users list:", users);
        setOnlineUsers(users);
      };
    
      socketInstance.on("get-users", handleUsersUpdate);
    
    
    
      const handleMessage = (data: any) => {
        console.log('Received message:', data);
        const message: IMessage = {
          chatId: data.chatId || "",
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        };
        setReceiveMessage(message);
      };
    
      socketInstance.on("receive-message", handleMessage);
    
      return () => {
        socketInstance.off("connect", handleConnect);
        socketInstance.off("get-users", handleUsersUpdate);
        socketInstance.off("receive-message", handleMessage);
        console.log("Cleaning up socket listeners");
      };
    }, [localUser?.id,socket]);  // Only depend on localUser.id
       // Function to send a message through the socket
      const sendMessage = (message: ISendMessage) => {
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
