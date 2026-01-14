import React, { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { BiLinkAlt } from "react-icons/bi";
import { FaWhatsapp } from "react-icons/fa";
import { FaUsers } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { IoCheckmarkCircle, IoCheckmarkCircleOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useSocket } from "../../../context/SocketContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface Props {
  postId: string;
  postType?: 'POST' | 'REEL';
  postPreview?: {
    thumbnail?: string;
    content?: string;
    mediaUrl?: string;
  };
  onClose: () => void;
}

interface ChatUser {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  lastMessage?: string;
  lastUpdated: Date;
  unreadCount: number;
  online?: boolean;
}

const SharingOption: React.FC<Props> = ({ postId, onClose, postType = 'POST', postPreview }) => {
  const baseUrl = `http://localhost:5173/p/${postId}`;
  const { socket } = useSocket();
  const currentUser = useSelector((state: RootState) => state.UserReducer.user);
  
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [shareMessage, setShareMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [activeSection, setActiveSection] = useState<'users' | 'links'>('users');

  // Function to handle copying the link
  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(baseUrl)
      .then(() => {
        toast.success("Link copied to clipboard.");
      })
      .catch(() => {
        toast.error("Failed to copy the link. Please try again.");
      });
  };

  // Function to handle WhatsApp sharing
  const handleWhatsAppShare = () => {
    const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(
      `Check this out: ${baseUrl}`
    )}`;
    window.open(whatsappShareLink, "_blank");
  };

  // Function to fetch chat list via socket
  const fetchChatList = () => {
    if (!socket || !currentUser?.id) return;
    
    console.log("📤 Requesting chat list for sharing...");
    socket.emit("chat:list:get");
  };

  // Handle chat list response
  const handleChatListResponse = (chatList: any[]) => {
    console.log("✅ Received chat list for sharing:", chatList);
    
    // Extract opponent users from chats
    const opponentUsers = chatList
      .map(chat => {
        const opponent = chat.participants?.find((id: string) => id !== currentUser?.id);
        if (opponent && chat.opponentUser) {
          return {
            id: opponent,
            name: chat.opponentUser.name || 'Unknown User',
            username: chat.opponentUser.username || 'unknown',
            profileImage: chat.opponentUser.profileImage,
            lastMessage: chat.lastMessage,
            lastUpdated: chat.lastUpdated || new Date(),
            unreadCount: chat.unreadCount || 0,
            online: false // You might want to get this from onlineUsers map
          };
        }
        return null;
      })
      .filter(Boolean) as ChatUser[];
    
    setChats(opponentUsers);
    setLoading(false);
  };

  // Handle chat list error
  const handleChatListError = (error: { message: string }) => {
    console.error("❌ Chat list error:", error);
    toast.error("Failed to load chat users");
    setLoading(false);
  };

  // Initialize socket listeners
  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    // Set up socket listeners
    socket.on("chat:list:response", handleChatListResponse);
    socket.on("chat:list:error", handleChatListError);

    // Fetch chat list
    fetchChatList();

    // Clean up listeners
    return () => {
      socket.off("chat:list:response", handleChatListResponse);
      socket.off("chat:list:error", handleChatListError);
    };
  }, [socket, currentUser?.id]);

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === chats.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(chats.map(user => user.id));
    }
  };

  // Handle share via socket
  const handleShareToUsers = () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    try {
      setIsSharing(true);
      
      // Use socket to share the post/reel
      socket?.emit("chat:share", {
        itemId: postId,
        itemType: postType.toLowerCase() as 'post' | 'reel',
        receiverIds: selectedUsers,
        message: shareMessage || `Check out this ${postType.toLowerCase()}!`,
        tempId: `share-${Date.now()}`
      });

      toast.success(`Sharing with ${selectedUsers.length} user(s)...`);
      onClose();
    } catch (error) {
      toast.error('Failed to share');
      console.error(error);
    } finally {
      setIsSharing(false);
    }
  };

  // Render user list
  const renderUserList = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-8 h-8 mb-3 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading chat users...</p>
        </div>
      );
    }

    if (chats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <FaUserCircle className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
            No conversations yet
          </h3>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Start chatting with people to share posts with them
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Select All Button */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Friends
          </span>
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            {selectedUsers.length === chats.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* User List */}
        <div className="max-h-64 overflow-y-auto">
          {chats.map(user => (
            <div
              key={user.id}
              onClick={() => toggleUserSelection(user.id)}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedUsers.includes(user.id)
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {/* Profile Image */}
              <div className="relative">
                <div className="w-10 h-10 overflow-hidden rounded-full">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-200 dark:bg-gray-700">
                      <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {user.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 ml-3 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800 dark:text-white truncate">
                    {user.name}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(user.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  @{user.username}
                </p>
                {user.lastMessage && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                    {user.lastMessage}
                  </p>
                )}
              </div>

              {/* Selection Checkbox */}
              <div className="ml-3">
                {selectedUsers.includes(user.id) ? (
                  <IoCheckmarkCircle className="w-6 h-6 text-indigo-500" />
                ) : (
                  <IoCheckmarkCircleOutline className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Count & Share Button */}
        {selectedUsers.length > 0 && (
          <div className="sticky bottom-0 p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              {/* Message Input */}
              <div>
                <textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Add a message (optional)"
                  className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
                  rows={2}
                  maxLength={200}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedUsers.length} user(s) selected
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {shareMessage.length}/200
                  </span>
                </div>
              </div>
              
              {/* Share Button */}
              <button
                onClick={handleShareToUsers}
                disabled={isSharing}
                className="w-full py-3 font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {isSharing ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sharing...
                  </>
                ) : (
                  `Share with ${selectedUsers.length} friend${selectedUsers.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render link sharing options
  const renderLinkSharing = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="grid grid-cols-2 gap-6">
        <div onClick={handleCopyLink} className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-16 h-16 p-2 rounded-full cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg">
            <BiLinkAlt className="text-3xl text-white" />
          </div>
          <span className="text-sm font-medium cursor-pointer text-gray-800 dark:text-white">Copy link</span>
        </div>

        <div onClick={handleWhatsAppShare} className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center w-16 h-16 p-2 rounded-full cursor-pointer bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg">
            <FaWhatsapp className="text-3xl text-white" />
          </div>
          <span className="text-sm font-medium cursor-pointer text-gray-800 dark:text-white">WhatsApp</span>
        </div>
      </div>
      
      <div className="w-full p-4 mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Share link</p>
        <div className="flex items-center">
          <input
            type="text"
            value={baseUrl}
            readOnly
            className="flex-1 p-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-l-lg focus:outline-none dark:text-white"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-r-lg hover:bg-indigo-600 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center w-full h-full pt-12 bg-black/50 pb-14">
      <div className="flex flex-col items-center justify-center w-full h-screen">
        <div onClick={(e) => e.stopPropagation()} className="flex flex-col w-full h-full max-w-md max-h-[85vh] rounded-xl bg-white dark:bg-gray-900 shadow-2xl">
          
          {/* Header */}
          <div className="relative flex flex-row items-center justify-between w-full p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <FaUsers className="text-xl text-indigo-500" />
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Share Post</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Share with friends or copy link
                </p>
              </div>
            </div>
            <IoCloseOutline 
              onClick={onClose} 
              className="text-2xl cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveSection('users')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeSection === 'users'
                  ? 'text-indigo-500 border-b-2 border-indigo-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <FaUsers />
                Chat Users
              </span>
            </button>
            <button
              onClick={() => setActiveSection('links')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeSection === 'links'
                  ? 'text-indigo-500 border-b-2 border-indigo-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <BiLinkAlt />
                Links
              </span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeSection === 'users' ? renderUserList() : renderLinkSharing()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharingOption;