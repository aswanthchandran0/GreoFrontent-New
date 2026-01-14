import { io, Socket } from "socket.io-client";

// Define all events your socket will handle (optional but recommended)
interface ServerToClientEvents {
  notify: (data: { message: string }) => void;
  "user:message": (msg: string) => void;
}

interface ClientToServerEvents {
  "user:join": (userId: string) => void;
  "user:leave": (userId: string) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const connectSocket = (userId: string, token: string) => {
  if (!socket) {
    socket = io(`${window.location.protocol}//${window.location.hostname}:5000`, {
      auth: { token },
      query: { userId },
      transports: ["websocket"],
      withCredentials: true,
    });

    console.log("✅ Socket connected for user:", userId);

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket?.id);

        // ✅ Emit user:join right after connecting
       socket?.emit("user:join", userId);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });
  }

  return socket;
};

export const getSocket = (): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔴 Socket disconnected manually");
  }
};
