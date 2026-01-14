// src/Types/userChats/chatType.ts
export interface IChat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastUpdated: string;
  unreadCount: number;
  opponentUser: { // This should be required
    id: string;
    name: string;
    username?: string;
    profileImage?: string;
  };
}

// Optional: If you want to include user details in the chat
export interface IChatWithUser extends IChat {
  opponentUser: { // Remove '?' and add 'online' property
    id: string;
    name: string;
    username?: string;
    profileImage?: string;
    online: boolean; // Add online status
  };
}

// OR Better approach: Create a separate interface for socket-specific chats:
export interface IChatSocket extends Omit<IChat, 'opponentUser'> {
  opponentUser: {
    id: string;
    name: string;
    username?: string;
    profileImage?: string;
    online: boolean;
  };
}

// For creating new chats
export interface ICreateChat {
  participants: string[];
}

// For chat list response
export interface IChatListResponse {
  chats: IChat[];
  total: number;
}