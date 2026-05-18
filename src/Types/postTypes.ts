// src/Types/postTypes.ts
export interface IPost {
    id: string;
    userId: string;
    username: string;
    profileImage?: string;
    name?: string;
    
    // Media content
    mediaUrls: string[];
    content: string;
    
    // Engagement metrics
    likes: number;
    likeCount: number; // Keep for backward compatibility
    comments: number;
    commentCount: number; // Keep for backward compatibility
    shares?: number;
    bookmarks?: number;
    
    // User interaction status
    isLiked: boolean;
    isSaved: boolean;
    isBookmarked: boolean; // Alias for isSaved for backward compatibility
    
    // Post metadata
    createdAt: string | Date;
    updatedAt: string | Date;
    isBlocked: boolean;
    
    // Additional fields
    location?: string;
    tags?: string[];
    aspectRatio?: 'square' | 'portrait' | 'landscape';
     mediaType?: 'image' | 'video' | 'carousel';
    
    // Legacy support (if needed)
    _id?: string; // For MongoDB compatibility
    postId?: string; // Alias for id
}

export type ReportReasonType =
  | "dislike"
  | "bullying"
  | "self_harm"
  | "violence"
  | "nudity"
  | "fraud"
  | "false_info";