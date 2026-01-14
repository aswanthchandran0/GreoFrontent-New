// src/components/ChatList.tsx
import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../../../context/SocketContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import User from "./User";
import { IChat } from "../../../Types/userChats/chatType";
import { useNavigate } from "react-router-dom";

const ChatList = () => {
  const { socket } = useSocket();
  const currentUser = useSelector((state: RootState) => state.UserReducer.user);
  const navigate = useNavigate();
  const [chats, setChats] = useState<IChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to sort chats by most recent (lastUpdated)
  const sortChatsByRecent = useCallback((chatsList: IChat[]) => {
    return [...chatsList].sort((a, b) => {
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });
  }, []);

  // Function to fetch chat list
  const fetchChatList = useCallback(() => {
    if (!socket || !currentUser?.id) return;
    
    console.log("🔄 Requesting chat list...");
    socket.emit("chat:list:get");
  }, [socket, currentUser?.id]);

  // Function to mark chat as read
  const markChatAsRead = useCallback((chatId: string) => {
    if (!socket || !currentUser?.id) return;
    
    console.log(`📖 Marking chat ${chatId} as read`);
    socket.emit("chat:mark-read", { chatId });
  }, [socket, currentUser?.id]);

  // Function to handle chat list response
  const handleChatListResponse = useCallback((chatList: IChat[]) => {
    console.log("✅ Received chat list:", chatList);
    const sortedChats = sortChatsByRecent(chatList);
    setChats(sortedChats);
    setLoading(false);
    setError(null);
  }, [sortChatsByRecent]);

  // Function to handle chat list update
  const handleChatListUpdate = useCallback((updatedChatList: IChat[]) => {
    console.log("🔄 Chat list updated:", updatedChatList);
    const sortedChats = sortChatsByRecent(updatedChatList);
    setChats(sortedChats);
  }, [sortChatsByRecent]);

  // Function to handle chat list error
  const handleChatListError = useCallback((error: { message: string }) => {
    console.error("❌ Chat list error:", error);
    setError(error.message);
    setLoading(false);
  }, []);

  // Function to handle mark as read success
  const handleMarkAsReadSuccess = useCallback((result: { chatId: string; count: number }) => {
    console.log(`✅ Successfully marked ${result.count} messages as read in chat ${result.chatId}`);
    
    // Update local state to remove unread count
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === result.chatId 
          ? { ...chat, unreadCount: 0 }
          : chat
      )
    );
  }, []);

  // Initialize socket listeners and fetch chat list
  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    console.log("👤 Joining user:", currentUser.id);
    
    // ✅ FIRST: Join the user
    socket.emit('user:join', currentUser.id);
    
    // ✅ Set up all socket listeners
    socket.on("chat:list:response", handleChatListResponse);
    socket.on("chat:list:update", handleChatListUpdate);
    socket.on("chat:list:error", handleChatListError);
    socket.on("chat:mark-read:success", handleMarkAsReadSuccess);

    // ✅ THEN: Request chat list after user is joined
    const timeoutId = setTimeout(() => {
      fetchChatList();
    }, 100);

    // ✅ Listen for new messages to trigger chat list update
    socket.on("chat:receive", (message) => {
      console.log("💬 New message received:", message);
      // Refresh chat list when receiving new message
      fetchChatList();
    });

    // ✅ Listen for message send success to update chat list
    socket.on("chat:send:success", () => {
      console.log("✅ Message sent successfully, refreshing chat list...");
      // Refresh chat list when sending message
      fetchChatList();
    });

    // ✅ Listen for chat initialization to update chat list
    socket.on("chat:init:response", () => {
      console.log("✨ Chat initialized, refreshing chat list...");
      // Refresh chat list when new chat is created
      fetchChatList();
    });

    // Clean up listeners
    return () => {
      clearTimeout(timeoutId);
      socket.off("chat:list:response", handleChatListResponse);
      socket.off("chat:list:update", handleChatListUpdate);
      socket.off("chat:list:error", handleChatListError);
      socket.off("chat:mark-read:success", handleMarkAsReadSuccess);
      socket.off("chat:receive");
      socket.off("chat:send:success");
      socket.off("chat:init:response");
    };
  }, [socket, currentUser?.id, fetchChatList, handleChatListResponse, handleChatListUpdate, handleChatListError, handleMarkAsReadSuccess]);

  // Handle chat click - mark as read and navigate
  const handleChatClick = (chat: IChat) => {
    const opponentId = chat.participants.find(id => id !== currentUser?.id);
    
    // Mark as read if there are unread messages
    if (chat.unreadCount > 0) {
      markChatAsRead(chat.id);
    }
    
    // Navigate to chat
    if (opponentId) {
      navigate(`/chat/${opponentId}`);
    }
  };

  // Manually refresh chat list
  const handleRefresh = () => {
    setLoading(true);
    fetchChatList();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col overflow-y-scroll scrollbar-hide">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-8 h-8 mb-3 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading chats...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col overflow-y-scroll scrollbar-hide">
        <div className="p-6 text-center">
          <div className="mb-3 text-red-500">⚠️ Error loading chats</div>
          <p className="mb-4 text-sm text-gray-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm text-white bg-indigo-500 rounded-lg hover:bg-indigo-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (chats.length === 0) {
    return (
      <div className="flex flex-col overflow-y-scroll scrollbar-hide">
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 text-5xl text-gray-300">💬</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
            No conversations yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Start a conversation by messaging someone!
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 mt-4 text-sm text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-scroll scrollbar-hide">
      {/* Header with refresh button */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Messages
        </h2>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Refresh chat list"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1">
        {chats.map((chat) => (
          <div 
            key={chat.id} 
            className="border-b border-gray-100 dark:border-gray-700"
            onClick={() => handleChatClick(chat)}
          >
            <User 
              chat={chat} 
              currentUserId={currentUser?.id || null} 
              lastMessage={chat.lastMessage}
              unreadCount={chat.unreadCount}
            />
          </div>
        ))}
      </div>

      {/* Footer with total unread count */}
      <div className="sticky bottom-0 p-3 text-xs text-center text-gray-500 bg-white border-t dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <span>
            {chats.length} conversation{chats.length !== 1 ? 's' : ''}
          </span>
          {chats.some(chat => chat.unreadCount > 0) && (
            <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
              {chats.reduce((total, chat) => total + chat.unreadCount, 0)} unread
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;