// src/pages/ChatScreen.tsx
import { IoChatbubblesOutline } from "react-icons/io5";
import ChatList from "../components/userComponents/Chat/ChatList";
import { useParams } from "react-router-dom";
import Chat from "../components/userComponents/Chat/Chat";

const ChatScreen = () => {
  const { userId } = useParams();

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Chat List Sidebar */}
      <div 
        className={`${
          userId 
            ? 'hidden lg:flex lg:w-96 xl:w-1/4' 
            : 'flex w-full lg:w-96 xl:w-1/4'
        } flex-col h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300`}
      >
        <ChatList />
      </div>

      {/* Chat Area or Welcome Screen */}
      <div 
        className={`${
          userId 
            ? 'flex w-full' 
            : 'hidden lg:flex lg:w-3/4 xl:w-full'
        } flex-col h-full overflow-hidden`}
      >
        {userId ? (
          <div className="flex-1 overflow-hidden">
            <Chat />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-8">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                  <IoChatbubblesOutline className="w-20 h-20 text-purple-500 dark:text-purple-400" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-xl"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Welcome to Chat
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
                Select a conversation from the sidebar or start a new chat
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 border border-purple-100 dark:border-purple-900/30">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Start Chatting</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Send messages, photos, videos, and documents
                </p>
              </div>
              
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-blue-900/30">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Share Moments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share posts and reels with your friends
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatScreen;