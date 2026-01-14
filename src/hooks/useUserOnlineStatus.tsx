// src/hooks/useUserOnlineStatus.ts
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

export interface UseUserOnlineStatusProps {
  userId: string;
  initialOnlineStatus?: boolean;
}

// ✅ CORRECT: Custom hooks are just functions, not React.FC
export const useUserOnlineStatus = ({ 
  userId, 
  initialOnlineStatus = false 
}: UseUserOnlineStatusProps) => {
  const [isOnline, setIsOnline] = useState(initialOnlineStatus);
  const { socket } = useSocket();

  useEffect(() => {
    // ✅ Update when initial status changes
    setIsOnline(initialOnlineStatus);
  }, [initialOnlineStatus]);

  useEffect(() => {
    if (!socket || !userId) return;

    console.log(`👀 Setting up online status listener for: ${userId}, initial: ${initialOnlineStatus}`);

    const handleUserStatus = (data: { userId: string; status: 'online' | 'offline' }) => {
      console.log(`📢 User status update: ${data.userId} is ${data.status}`);
      if (data.userId === userId) {
        setIsOnline(data.status === 'online');
      }
    };

    const handleFriendOnline = (data: { userId: string; timestamp: Date }) => {
      console.log(`🟢 Friend online: ${data.userId}`);
      if (data.userId === userId) {
        setIsOnline(true);
      }
    };

    const handleFriendOffline = (data: { userId: string; timestamp: Date }) => {
      console.log(`🔴 Friend offline: ${data.userId}`);
      if (data.userId === userId) {
        setIsOnline(false);
      }
    };

    // Listen to all online status events
    socket.on('user:status', handleUserStatus);
    socket.on('friend:online', handleFriendOnline);
    socket.on('friend:offline', handleFriendOffline);

    // Cleanup
    return () => {
      socket.off('user:status', handleUserStatus);
      socket.off('friend:online', handleFriendOnline);
      socket.off('friend:offline', handleFriendOffline);
    };
  }, [socket, userId, initialOnlineStatus]);

  return isOnline;
};