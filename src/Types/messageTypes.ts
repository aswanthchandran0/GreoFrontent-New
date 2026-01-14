// src/Types/messageTypes.ts
export type MessageType = 'text' | 'audio' | 'image' | 'video' | 'document' | 'post' | 'reel';

export interface SharedItem {
  itemId: string;
  itemType: 'post' | 'reel';
  thumbnail?: string;
  contentPreview?: string;
  mediaUrl?: string;
  title?: string;
}

export interface FileAttachment {
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name?: string;
  size?: number;
  duration?: number;
  thumbnail?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  publicId?: string;
  format?: string;
}

// Add ChatAttachment interface that extends FileAttachment with additional Cloudinary properties
export interface ChatAttachment extends FileAttachment {
  mimeType: string;
  publicId?: string;
  format?: string;
  createdAt?: string;
}

export interface IMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId?: string; // ✅ For message filtering
  senderName?: string;
  senderImage?: string;
  content: string;
  messageType: MessageType;
  attachments?: (string | FileAttachment)[];
  duration?: number;
  sharedItem?: SharedItem;
  isRead: boolean;
  readAt?: string; // ✅ When message was read
  seenBy?: string[]; // ✅ Who has seen this message
  isDelivered?: boolean; // ✅ Add this
  deliveredAt?: string; // ✅ Add this
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  tempId?: string; // For optimistic updates
}