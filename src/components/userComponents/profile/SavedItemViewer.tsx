// src/components/user/SavedItemViewer.tsx
import React from 'react';
import { BackendSavedItem } from './SavedItemCard';
import ReelViewer from '../reel/ReelViewer';
import PostCommentsModal from '../post/PostCommentsModal';

interface SavedItemViewerProps {
  item: BackendSavedItem;
  isOpen: boolean;
  onClose: () => void;
  onUnsave?: () => void;
  onLikeUpdate?: (itemId: string, isLiked: boolean, likeCount: number) => void;
}

const SavedItemViewer: React.FC<SavedItemViewerProps> = ({
  item,
  isOpen,
  onClose,
  onUnsave,
  onLikeUpdate
}) => {
  // Convert to IReel format
  const convertToReel = () => {
    const reelData = item.data as any;
    return {
      id: reelData.id,
      userId: reelData.user?.id || '',
      username: reelData.user?.username || 'Unknown',
      profileImage: reelData.user?.profileImage,
      thumbnail: reelData.thumbnail || reelData.mediaUrl,
      mediaUrl: reelData.mediaUrl,
      content: reelData.content || '',
      likeCount: reelData.likeCount || 0,
      commentCount: reelData.commentCount || 0,
      isLiked: reelData.isLiked || false,
      isSaved: true,
      duration: reelData.duration,
      createdAt: new Date(reelData.createdAt)
    };
  };

  // Convert to IPost format
  const convertToPost = () => {
    const postData = item.data as any;
    return {
      id: postData.id,
      userId: postData.user?.id || '',
      username: postData.user?.username || 'Unknown',
      profileImage: postData.user?.profileImage,
      mediaUrls: postData.mediaUrls,
      content: postData.content || '',
      likeCount: postData.likeCount || 0,
      commentCount: postData.commentCount || 0,
      isLiked: postData.isLiked || false,
      isSaved: true,
      createdAt: new Date(postData.createdAt)
    };
  };

  const handleReelLike = (reelId: string, isLiked: boolean, likeCount: number) => {
    if (onLikeUpdate) {
      onLikeUpdate(item.id, isLiked, likeCount);
    }
  };

  const handleReelSave = (reelId: string, isSaved: boolean) => {
    if (!isSaved && onUnsave) {
      onUnsave();
    }
  };

  const handlePostLike = (isLiked: boolean, likeCount: number) => {
    if (onLikeUpdate) {
      onLikeUpdate(item.id, isLiked, likeCount);
    }
  };

  if (item.type === 'REEL') {
    return (
      <ReelViewer
        reel={convertToReel()}
        isOpen={isOpen}
        onClose={onClose}
        onReelLike={handleReelLike}
        onReelSave={handleReelSave}
      />
    );
  }

  return (
    <PostCommentsModal
      post={convertToPost()}
      isOpen={isOpen}
      onClose={onClose}
      onLikeChange={handlePostLike}
      onCommentCountChange={() => {}}
    />
  );
};

export default SavedItemViewer;