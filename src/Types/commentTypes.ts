// src/Types/commentTypes.ts

export interface IReply {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  isLiked: boolean;
  isDeleted: boolean;
}

export interface IComment {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  isLiked: boolean;
  isDeleted: boolean;
  replies?: IReply[];
  replyCount?: number;
}