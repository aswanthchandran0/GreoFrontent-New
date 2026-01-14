// src/components/User.tsx
import { useNavigate } from "react-router-dom";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { IChat } from "../../../Types/userChats/chatType";
import { timeformat } from "../../../utils/formating";

interface UserProps {
  chat: IChat;
  currentUserId: string | null;
  lastMessage?: string;
  unreadCount: number;
}

const UserComponent = ({ chat, currentUserId, lastMessage, unreadCount }: UserProps) => {
  const navigate = useNavigate();

  // Handle user click
  const handleUserClick = () => {
    const opponentId = chat.participants.find((id) => id !== currentUserId);
    if (opponentId) {
      navigate(`/chat/${opponentId}`);
    }
  };

  // Truncate long messages
  const truncateMessage = (text: string, maxLength: number = 25) => {
    if (!text) return "No messages yet";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div 
      className="cursor-pointer hover:bg-background-lightGray dark:hover:bg-background-EerieBlack transition-colors duration-200" 
      onClick={handleUserClick}
    >
      <div className="flex flex-row items-center w-full gap-3 p-3">
        {/* Profile Image with Unread Indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 overflow-hidden rounded-full">
            <img 
              className="object-cover w-full h-full" 
              src={chat.opponentUser?.profileImage || DEFAULT_PROFILE_IMAGE}
              alt={chat.opponentUser?.name || "User Profile"} 
            />
          </div>
          
          {/* Online indicator (optional - you need to track online status) */}
          {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div> */}
          
          {/* Unread message count badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center px-1 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>

        {/* Chat Info */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* User name and time */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-md font-golos font-semibold text-gray-800 dark:text-gray-200 truncate">
              {chat.opponentUser?.name || chat.opponentUser?.username || "Unknown User"}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {chat.lastUpdated ? timeformat(chat.lastUpdated) : ""}
            </span>
          </div>
          
          {/* Last message and unread indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mr-2">
                {truncateMessage(lastMessage || "No messages yet")}
              </p>
              
              {/* Small dot for unread messages */}
              {unreadCount > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
              )}
            </div>
            
            {/* Message count badge for larger screens (optional) */}
            {unreadCount > 0 && (
              <div className="hidden sm:block">
                <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserComponent;