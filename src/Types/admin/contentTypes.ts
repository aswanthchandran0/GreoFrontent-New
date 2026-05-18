// Types
export interface AdminPost {
  id: string;
  content: string;
  mediaUrls: string[];
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    isSuspended: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  reports: {
    count: number;
    reasons: string[];
    reportedBy: string[];
  };
  isBlocked: boolean;
  createdAt: string;
  lastReportedAt?: string;
}

export interface AdminReel {
  id: string;
  caption: string;
  thumbnail: string;
  mediaUrl: string;
  duration: number;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    isSuspended: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  reports: {
    count: number;
    reasons: string[];
    reportedBy: string[];
  };
  isBlocked: boolean;
  createdAt: string;
  lastReportedAt?: string;
}

export interface AdminComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  targetType: 'POST' | 'REEL';
  targetId: string;
  targetPreview: string;
  stats: {
    likes: number;
  };
  reports: {
    count: number;
    reasons: string[];
  };
  createdAt: string;
}
