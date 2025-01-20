export interface ISendMessage {
    senderId: string;
    chatId: string;
    text: string;
    receiverId?: string; // Optional, only if needed
  }
  