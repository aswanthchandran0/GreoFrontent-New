import { BsEmojiSmile } from "react-icons/bs";
import { FaImage } from "react-icons/fa";
import { AiFillAudio } from "react-icons/ai";
import {  useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { User } from "../../../redux/slices/userSlice";
import { IChat } from "../../../Types/userChats/chatType";
import { addMessageApi, getMessagesApi } from "../../../services/user/api";
import { FaArrowLeft } from "react-icons/fa6";
import { IoVideocamOutline } from "react-icons/io5";
import dayjs from 'dayjs'
import { IMessage } from "../../../interface/messageInterface";
import { ISendMessage } from "../../../interface/sendMessageInterface";

type OutletContextType = {
    opponentUser: User | null;
  chat: IChat | null;
  localUserId: string;
  userData: User | null;
  setSendMessage: React.Dispatch<React.SetStateAction<ISendMessage>>; // Adjust `any` if you know the type of messages being sent
  receiveMessage: IMessage | null;
  isOnline: boolean;
  onNewMessage:(data:string)=>void
};

const Chat = () => {
  const opponentUserId = useParams().userId
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  // console.log(
  //   'messages in the message page',messages
  // )
  const navigate = useNavigate()
  const {
      opponentUser,
      chat,
    localUserId,
    userData,
    setSendMessage,
    receiveMessage,
    isOnline,
    onNewMessage,
  }: OutletContextType = useOutletContext();
  const scroll = useRef<HTMLDivElement | null>(null);

  //handle new message
  const handleNewMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };


  useEffect(() => {
    const fetchMessages = async () => {
      if (chat?.id) {
        setMessages([]); // Reset messages to avoid showing old ones
        try {
          const { data } = await getMessagesApi(chat.id);
          setMessages(data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };
  
    fetchMessages();
  }, [chat?.id]); // Dependency updated to re-fetch on chat change
  
  useEffect(() => {
  if (receiveMessage && receiveMessage.chatId === chat?.id) {
    setMessages((prevMessages) => [...prevMessages, receiveMessage]);
    console.log('receivedMessage in chat ',receiveMessage)
  }
}, [receiveMessage, chat?.id]); // Depend on `chat?.id` to handle changes

    
      // handle sent message

      const handleSendMessage = async () => {
        if (newMessage.trim()) {
          const message = {
            senderId: localUserId,
            text: newMessage,
            chatId: chat?.id
          }
    
          // send messages to socket
          const receiverId = chat?.members.find((id) => id !== localUserId)
          const chatId = chat?.id;
          if (chatId) {
            setSendMessage({ ...message, receiverId, chatId });
          } else {
            // Handle the case where chatId is undefined
            console.error('chatId is undefined');
          }
    
          // send message to database
          try {
            const { data } = await addMessageApi(message)
            // setMessages([...(messages || []), data])
            // setNewMessage('');
            setMessages((prevMessages) => [...prevMessages, data]);
           
            if(chat){
              onNewMessage(data)
            }
            console.log("sended message",data)
            setNewMessage("");
            setIsTyping(false);
          } catch (error) {
            console.log(error)
          }
        }
      }

      
      // always scroll to the last message
 useEffect(()=>{
  scroll.current?.scrollIntoView({behavior:"smooth"})
 },[messages])


   // time convertion
   const timeConversion = (timeString: string) => {
    return dayjs(timeString).format("h:mm A");
  };



  useEffect(() => {
    if (opponentUser || chat || isOnline) {
      // console.log("Context data updated:", { opponentUser, chat, isOnline });
      if (chat) {
        const fetchMessages = async () => {
          const { data } = await getMessagesApi(chat.id);
          setMessages(data);
        };
        fetchMessages();
      }
    }
  }, [opponentUser, chat, isOnline,opponentUserId]);

  console.log("--------------------message i got in there ---------------",messages)
  return (
    <div className="flex flex-col w-full h-full ">
      <div className="flex flex-row items-center w-full p-2 space-x-2 border border-text-charcoal">
        <FaArrowLeft onClick={()=> navigate('/chat')} className="flex lg:hidden"/>
        <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-full ">
          <img
            className="object-cover w-full h-full"
            src={opponentUser?.profileImage || DEFAULT_PROFILE_IMAGE}
            alt=""
          />
        </div>

        <div className="flex flex-col ">
          <span onClick={()=>navigate(`/profile/${opponentUser?.user_name}`)} className="mb-[-4px] font-golos cursor-pointer ">{opponentUser?.name}</span>
          <p className={`text-sm font-light font-outfit  ${isOnline? 'text-green-500':'text-text-Grayish'}`}>
          {isOnline ? "Active" : "Offline"}
          </p>
        </div>
        <div className="flex items-center w-full p-2 ">

        <IoVideocamOutline onClick={()=> navigate(`/call/${opponentUser?.id}`)} className="ml-auto text-2xl cursor-pointer lg:text-3xl" />
        </div>
      </div>

     {/* message area */}

     <div className="flex flex-col w-full h-screen overflow-y-auto lg:p-4 scrollbar-hide mb-14 ">
              {/* <div className="flex items-center justify-center w-full ">
                <div className="flex flex-row items-center justify-center gap-2 p-1 rounded-full cursor-pointer bg-secondary bg-opacity-40 w-50">
                  <FaLock className="text-xs text-primary" />
                  <p className="text-xs font-lato text-primary">
                    {" "}
                    Messages are end-to-end encripted
                  </p>
                </div>
              </div> */}

              {
                messages?.map((message) => (

                  <div ref={scroll} key={message.chatId}>
                    {message.senderId === localUserId ? (
                      <div className="flex justify-end mt-3 mr-3 ">
                        <div className="flex flex-col p-1 rounded bg-background-PurpleHeart min-w-20">
                          <p className="text-sm font-bold text-text-white font-lato ">{message.text}</p>
                          <p className="ml-auto text-xs text-text-white font-lato ">{timeConversion(message.createdAt.toString())}</p>
                        </div>
                      </div>
                    ) :
                      (

                        <div className="flex flex-row space-x-2 space-y-3 ">
                          <div className="w-8 h-8 overflow-hidden rounded-full">
                            <img
                              className="object-cover w-full h-full"
                              src={
                                userData && userData.profileImage !== ""
                                  ? userData.profileImage
                                  : DEFAULT_PROFILE_IMAGE
                              }
                              alt=""
                            />
                          </div>


                          <>
                            <div>
                              <div className="flex flex-col p-1 rounded bg-background-charcoal bg-opacity-40 min-w-20">
                                <p className="text-sm font-bold text-text-white font-lato ">
                                  {message.text}
                                </p>
                                <p className="text-xs text-right text-text-white font-lato ">
                                {timeConversion((message.createdAt || new Date()).toString())}
                                </p>
                              </div>
                            </div>
                          </>

                        </div>

                      )
                    }

                  </div>
                ))
              }
            </div>
{/* end message area */}




      <div className="bottom-0 flex flex-row items-center w-full h-12 max-w-4xl gap-3 p-2 px-3 mt-auto mb-5 border rounded-lg dark:border-none lg:mx-5 bg-background-light dark:bg-background-charcoal">
        <BsEmojiSmile className="w-6 h-6 cursor-pointer text-text_white" />
        <input
          value={newMessage}
          onChange={handleNewMessage}
          className="flex w-full h-full bg-transparent placeholder-background text-text_white focus:outline-none"
          type="text"
          placeholder="message..."
        />
        {isTyping ? (
          <>
            <IoSend
              onClick={() => handleSendMessage()}
              className="w-6 h-6 cursor-pointer text-text_white"
            />
          </>
        ) : (
          <>
            <FaImage className="w-6 h-6 cursor-pointer text-text_white" />
            <AiFillAudio className="w-6 h-6 cursor-pointer text-text_white" />
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
