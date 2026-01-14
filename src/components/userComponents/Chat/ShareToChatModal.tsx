// src/components/userComponents/Chat/ShareToChatModal.tsx
import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { FaTimes, FaCheck, FaPaperPlane } from 'react-icons/fa';
import { BsChat } from 'react-icons/bs';
import { SharedItem } from '../../../Types/messageTypes';

interface ShareToChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedItem: SharedItem;
  message?: string;
}

interface ChatParticipant {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  online: boolean;
  lastMessage?: string;
  unreadCount: number;
}

const ShareToChatModal: React.FC<ShareToChatModalProps> = ({
  isOpen,
  onClose,
  sharedItem,
  message: initialMessage = ''
}) => {
  const { socket } = useSocket();
  const me = useSelector((state: RootState) => state.UserReducer.user);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState(initialMessage);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!socket || !isOpen) return;

    // Get chat list
    socket.emit("chat:list:get");
    socket.on("chat:list:response", (chats: any[]) => {
      const participantsList = chats.map(chat => ({
        id: chat.participantId || chat.userId,
        name: chat.name || chat.username,
        username: chat.username,
        profileImage: chat.profileImage,
        online: chat.online || false,
        lastMessage: chat.lastMessage?.content,
        unreadCount: chat.unreadCount || 0
      }));
      setParticipants(participantsList);
    });

    return () => {
      socket.off("chat:list:response");
    };
  }, [socket, isOpen]);

  const handleShare = async () => {
    if (!socket || selectedUsers.length === 0) return;

    try {
      setIsSending(true);
      
      for (const receiverId of selectedUsers) {
        const payload = {
          receiverId,
          chatId: undefined, // Will be created if needed
          text: message || `Shared a ${sharedItem.itemType}`,
          messageType: sharedItem.itemType,
          sharedItem,
          tempId: `temp-share-${Date.now()}`
        };

        socket.emit("chat:send", payload);
      }

      // Show success
      alert(`Shared with ${selectedUsers.length} user(s)`);
      onClose();
      
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share");
    } finally {
      setIsSending(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <FaPaperPlane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Share to Chat
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select recipients to share this {sharedItem.itemType}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Shared Item Preview */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900/50 dark:to-gray-800/50 border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                {sharedItem.thumbnail ? (
                  <img src={sharedItem.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {sharedItem.itemType === 'reel' ? '🎬' : '📷'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sharedItem.itemType === 'reel' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                    {sharedItem.itemType === 'reel' ? 'Reel' : 'Post'}
                  </span>
                </div>
                {sharedItem.contentPreview && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {sharedItem.contentPreview}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
          />
        </div>

        {/* Message Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <textarea
            placeholder="Add a message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white resize-none"
            rows={3}
          />
        </div>

        {/* Users List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredParticipants.length === 0 ? (
            <div className="p-8 text-center">
              <BsChat className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No chats found</p>
            </div>
          ) : (
            filteredParticipants.map(participant => (
              <div
                key={participant.id}
                onClick={() => toggleUserSelection(participant.id)}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700/50"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500">
                    {participant.profileImage ? (
                      <img
                        src={participant.profileImage}
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {participant.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {participant.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {participant.name}
                    </h3>
                    {participant.unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-500 text-white rounded-full">
                        {participant.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{participant.username}
                  </p>
                  {participant.lastMessage && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                      {participant.lastMessage}
                    </p>
                  )}
                </div>
                
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedUsers.includes(participant.id)
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedUsers.includes(participant.id) && (
                    <FaCheck className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selected: {selectedUsers.length} user(s)
              </p>
            </div>
            <button
              onClick={handleShare}
              disabled={selectedUsers.length === 0 || isSending}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4" />
                  Share Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareToChatModal;