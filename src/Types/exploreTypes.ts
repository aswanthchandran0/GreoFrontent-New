

// src/Types/exploreTypes.ts
export interface ExploreI {
  id: string;
  type: "reel" | "post";
  userId: string;
  username: string;
  profileImage?: string;
  thumbnail?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  content?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string | Date;
}
