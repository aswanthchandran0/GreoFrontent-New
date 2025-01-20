import { IoChatbubblesOutline } from "react-icons/io5"
import ChatList from "../components/userComponents/Chat/ChatList"
import { Outlet,  useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"
import { useEffect, useState } from "react"
import { User } from "../redux/slices/userSlice"
import { IChat } from "../Types/userChats/chatType"
import { createChatApi, getChatsApi, getUserByIdApi } from "../services/user/api"
import { useSocket } from "../context/SocketContext"
import { IMessage } from "../interface/messageInterface"

const ChatScreen = () =>{
  const { userId } = useParams();
  const { onlineUsers, sendMessage, receiveMessage } = useSocket(); // Access socket instance and online users from context
  const localUser = useSelector((state: RootState) => state.UserReducer.user);

  // State variables...
  const [opponentUser, setOpponentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<IChat[]>([]);
  const [currentChat, setCurrentChat] = useState<IChat | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);
  const [latestSendedMessage,setLatestSendedMessage] = useState<IMessage | null>(null)
  
  // Fetch opponent user data
  useEffect(() => {
    if (userId) {
      const fetchOpponentUser = async () => {
        const response = await getUserByIdApi(userId || "");
        setOpponentUser(response.data);
      };

      fetchOpponentUser();
    } else {
      console.log("userId is undefined");
    }
  }, [userId]);

  // Fetch chats data
  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await getChatsApi(localUser?.id || "");
      setChats(data);
    };

    fetchChats();
  }, [localUser?.id, userId]);

  // Handle conversation click
  const handleConversationClick = async (chat: IChat) => {
    console.log("handle conversation clicking")
    setCurrentChat(chat);
    const userId = chat.members.find((id) => id !== localUser?.id);
    if (userId) {
      const { data } = await getUserByIdApi(userId);
      setSelectedUserData(data);
      setOpponentUser(data);
    }
    // navigate(`/chat/${chat.id}`);
  };
  // Check if user is online
  const isUserOnline = (userId: string) => {
    return onlineUsers.some((user) => user.userId === userId);
  };

  // Check if chat exists, create one if not
  const checkAndCreateChat = async () => {
    if (!currentChat && userId) {
      try {
        const response = await createChatApi({
          senderId: localUser?.id ?? '',
          receiverId: userId,
        });
        setChats((prevChats) => [...prevChats, response.data]);
        setCurrentChat(response.data);
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    }
  };

  useEffect(() => {
    checkAndCreateChat();
  }, [userId]);


  const onNewMessage = (data:IMessage) => {
    setLatestSendedMessage(data)
  };
  



    return(
       <div className="flex justify-center h-full dark:bg-background-dark bg-background-light dark:text-text-white md:max-h-[90vh] max-h-[83vh] lg:px-16   p-2">
     
     <div  className={`${userId?'lg:flex hidden':'flex'} flex-col w-full max-w-[397.20px] h-full  border border-text-charcoal `}>
         <ChatList data={chats} currentUserId={localUser?.id || null}  onConversationClick={handleConversationClick} latestSendedMessage={latestSendedMessage}/>
   </div>
         <div className={` ${userId?'flex':'lg:flex hidden'} items-center justify-center w-full lg:flex`}>
       
      
       {
         userId ?
<Outlet context={{
   opponentUser,
   chat:currentChat,
   localUserId:localUser?.id || '',
   userData:selectedUserData,
   setSendMessage:sendMessage,
   receiveMessage,
   isOnline: isUserOnline(opponentUser?.id || ""),
   onNewMessage
 }}/>
:
         
         <div className="flex flex-col items-center justify-center ">
    
         <IoChatbubblesOutline className="w-20 h-20 text-primary" />
         <span className="text-3xl font-bold text-primary font-lato">Greo</span>
         <span className="font-bold text-primary font-lato text-md">Send and receive messages</span>
         
         </div>
         
       }
      
         </div>
       </div>
    )
 }

 export default ChatScreen