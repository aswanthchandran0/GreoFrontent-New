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
        
        socketInstance.on('connect', () => {
          if (localUser?.id) {
            socketInstance.emit("new-user-add", localUser.id);
          }
        });
        
        socketInstance.on("get-users", (users) => {
          setOnlineUsers(users);
        })

        socketInstance.on("receive-message", (data) => {
          console.log('-------------------------------------receved messages in receive-message socket instance--------------------------------',data)
          const message: IMessage = {
            chatId: data.chatId || "", // Provide a default empty string or handle it appropriately
            senderId: data.senderId,
            text: data.text,  // Assuming data.message contains the actual message text
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),// Default to current date-time if missing
          };
          setReceiveMessage(message);

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
