// src/Types/reelTypes.ts

export interface IReel {
  id: string;
  userId: string;
  username: string;
  profileImage: string;
  mediaUrl: string;
  thumbnail: string;
  content?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked?: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
  isBlocked?: boolean;
  location?: string;
  tags?: string[];
  duration?: number;
  isSaved?:boolean
  aspectRatio?: 'portrait' | 'landscape' | 'square';
}

// For backward compatibility, you can keep IRoll as an alias
export type IRoll = IReel;