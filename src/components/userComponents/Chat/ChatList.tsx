import { useEffect, useState } from "react";
import { IChat } from "../../../Types/userChats/chatType";
import User from "./User";
import { getMessagesApi } from "../../../services/user/api";
import { useSocket } from "../../../context/SocketContext";
import { IMessage } from "../../../interface/messageInterface";

interface ChatListProps {
    data: IChat[]; // Chats data passed from parent
    currentUserId: string | null; // Current user ID
    onConversationClick: (chat: IChat) => void;
    latestSendedMessage:IMessage|null
  }
  
  const ChatList = ({ data, currentUserId ,onConversationClick,latestSendedMessage}: ChatListProps) => {
    const [lastMessages, setLastMessages] = useState<Map<string, IMessage>>(new Map());
  const {  receiveMessage } = useSocket();
  const [sortedChats, setSortedChats] = useState<IChat[]>([]);
  // Function to fetch the last message for each chat
  const fetchLastMessages = async () => {
    for (const chat of data) {
      try {
        const { data } = await getMessagesApi(chat.id); // Fetch all messages
        const lastMessage = data[data.length - 1]; // Get the last message
        setLastMessages((prev) => new Map(prev).set(chat.id, lastMessage));
      } catch (error) {
        console.log("Error fetching last message", error);
      }
    }
  };

  console.log("receiveMessage",receiveMessage)
  console.log('last message in chat list',lastMessages)
  
  // Fetch last messages when data changes
  useEffect(() => {
    fetchLastMessages();
  }, [data])

  

  // Add latestSendedMessage if it's not null
  useEffect(() => {
    if (latestSendedMessage) {
      setLastMessages((prevMessages) => {
        const updatedMessages = new Map(prevMessages);
        updatedMessages.set(latestSendedMessage?.chatId, latestSendedMessage);
        return updatedMessages;
      });
    }
  }, [latestSendedMessage]);

  // Listen for new messages and update the last message
  useEffect(() => {
    if (receiveMessage) {

      const updatedMessage = {
        ...receiveMessage,
        createdAt: new Date() // Add the current timestamp
      };
      
      setLastMessages((prevMessages) => {
        const updatedMessages = new Map(prevMessages);
        const chatId = receiveMessage.chatId;
        // Update the last message for the current chat
        updatedMessages.set(chatId, updatedMessage);
        return updatedMessages;
      });
    }
  }, [receiveMessage]);
  

   // Sort chats based on the last message timestamp (most recent first)

   useEffect(() => {
    const sorted = [...data].sort((a, b) => {
      const lastMessageA = lastMessages.get(a.id);
      const lastMessageB = lastMessages.get(b.id);

         // If there's no last message, fall back to creation date (if available)
    const timeA = lastMessageA ? new Date(lastMessageA.createdAt).getTime() : 0;
    const timeB = lastMessageB ? new Date(lastMessageB.createdAt).getTime() : 0;


      return timeB - timeA; // Most recent first
    });

    setSortedChats(sorted);
  }, [lastMessages, data]); 
  
  

  // Remove duplicates by converting the array to a Set, then back to an array
  // const uniqueUserIds = Array.from(new Set(allUserIds));

  // Find chats for each unique user and ensure only one chat per user is shown
  const uniqueChats = sortedChats.filter((chat, index, self) => {
    const [user1, user2] = chat.members;
    const userId = user1 === currentUserId ? user2 : user1;
    
    // Find the first occurrence of the user in the chats and keep that
    return (
      // hided
      // uniqueUserIds.includes(userId) &&
      index === self.findIndex((otherChat) => {
        const [otherUser1, otherUser2] = otherChat.members;
        const otherUserId = otherUser1 === currentUserId ? otherUser2 : otherUser1;
        return otherUserId === userId;
      })
    );
  });


  const handleUserClick = (chat: IChat) => {
    onConversationClick(chat); // Parent function to handle user click
  };
  
    return(
        <>
            <div className="flex flex-col overflow-y-scroll scrollbar-hide">
            {uniqueChats.map((chat) => (
          <div key={chat.id}>
            <User chat={chat} currentUserId={currentUserId} onClick={handleUserClick} lastMessage={lastMessages.get(chat.id )}  />
          </div>
        ))}
            </div>
        </>
    )
}

export default ChatList