// src/Types/commentTypes.ts

export interface IComment {
  id: string;
  targetId: string;
  targetType: 'post' | 'reel';
  userId: string;
  username: string;
  profileImage?: string;
  content: string;
  createdAt: string; // use string for frontend to avoid Date parsing issues
}

// If you want a wrapper for multiple comments for a post:
export interface CommentsDto {
  postId: string; // targetId
  comments: IComment[];
}
