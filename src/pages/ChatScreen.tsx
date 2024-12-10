import { IoChatbubblesOutline } from "react-icons/io5"
import ChatList from "../components/userComponents/Chat/ChatList"
import { Outlet, useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"
import { useEffect, useRef, useState } from "react"
import { User } from "../redux/slices/userSlice"
import { IChat } from "../Types/userChats/chatType"
import { createChatApi, getChatsApi, getUserByIdApi } from "../services/user/api"
import { Message } from "yup"
import { useSocket } from "../context/SocketContext"

const ChatScreen = () =>{
   const {userId} = useParams()
   const {socket} = useSocket() // access the socket instance
   const localUser = useSelector((state:RootState)=> state.UserReducer.user)

   // other state variables...
   const [opponentUser,setOpponentUser] = useState<User| null>(null)
   const [chats,setChats] = useState<IChat[]>([])
   const [currentChat, setCurrentChat] = useState<IChat | null>(null)
   const [selectedUserData, setSelectedUserData] = useState<User | null>(null)
   const [onlineUsers, setOnlineUsers] = useState([])
   const [sendMessage,setSendMessage] = useState<any>(null)
   const [receiveMessage,setReceiveMessage] = useState<Message|null>(null)
   
   const navigate = useNavigate()
   
    // fetching opponent user
    useEffect(()=>{
      if(userId){
      const fetchOpponentUser = async()=>{
       const response = await  getUserByIdApi(userId || '')
       setOpponentUser(response.data)
      }
   
      fetchOpponentUser()
      }else{
         console.log('userId is undefined')
      }

    },[userId])

    // fetch chats
    useEffect(() => {
      const fetchChats = async () => {
        const { data } = await getChatsApi(localUser?.id || '')
        setChats(data)
  
      }
  
      fetchChats()
    }, [localUser?.id,userId])


    // handiling conversation
  const handleConversationClick = async (chat: IChat) => {
   setCurrentChat(chat)
   const userId = chat.members.find((id) => id !== localUser?.id)
   if (userId) {
     const { data } = await getUserByIdApi(userId)
     setSelectedUserData(data)
   }
   navigate(`/chat/${chat.id}`)
 }
    


  // Check if chat exists, create one if not
  const checkAndCreateChat = async () => {
    if (!currentChat && userId) {

      try {
        const response = await createChatApi({
          senderId: localUser?.id,
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
  }, [userId])
  
 // list for online users 
 useEffect(() => {
   socket.emit("new-user-add", localUser?.id)
   socket.on('get-users', (users) => { 
     setOnlineUsers(users)
    })

    return () => {
      socket.off("get-users"); // Cleanup listener
   };
   
 }, [socket,localUser?.id])


 // send message to the socket server
 useEffect(()=>{
   if(sendMessage!==null){
     socket.emit(`send-message`,sendMessage)
   }
 },[socket,sendMessage])

 // receive message from the socket server
 useEffect(()=>{
  socket.on("receive-message",(data)=>{
   setReceiveMessage(data)
  })

  return ()=>{
    socket.off("receive-message")
  }
 },[socket])

// is online
 const isUserOnline = (userId: string) => {
  return onlineUsers.some((user) => user.userId === userId);
};



    return(
       <div className="flex justify-center h-full dark:bg-background-dark bg-background-light dark:text-text-white md:max-h-[90vh] max-h-[83vh] lg:px-16   p-2">
     
     <div  className={`${userId?'lg:flex hidden':'flex'} flex-col w-full max-w-[397.20px] h-full  border border-text-charcoal `}>
         <ChatList data={chats} currentUserId={localUser?.id || null}  onConversationClick={handleConversationClick}/>
   </div>
         <div className={` ${userId?'flex':'lg:flex hidden'} items-center justify-center w-full lg:flex`}>
       
      
       {
         userId ?
<Outlet context={{
   opponentUser,
   chat:currentChat,
   localUserId:localUser?.id || '',
   userData:selectedUserData,
   setSendMessage,
   receiveMessage,
   isOnline: isUserOnline(opponentUser?.id || ""),
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