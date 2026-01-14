// src/interfaces/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import { Socket } from "socket.io-client";

// Define context type
interface SocketContextType {
  socket: Socket | null;
}

// Create context
const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider: React.FC<{ userId: string; token: string; children: React.ReactNode }> = ({ userId, token, children }) => {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    const s = connectSocket(userId, token);
    setSocketInstance(s);

    return () => {
      disconnectSocket();
      setSocketInstance(null);
    };
  }, [userId, token]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket
export const useSocket = () => {
  return useContext(SocketContext);
};
