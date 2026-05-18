// src/components/user/SavedItemCard.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlay, 
  FaImages, 
  FaHeart, 
  FaComment, 
  FaBookmark, 
  FaRegBookmark,
  FaTrash,
  FaShare,
  FaEllipsisH,
  FaVideo
} from 'react-icons/fa';
import { MdVideoLibrary } from 'react-icons/md';
import toast from 'react-hot-toast';

import { IPost } from '../../../Types/postTypes';
import { IReel } from '../../../Types/reelTypes';
import ReelViewer from '../reel/ReelViewer';
import PostCommentsModal from '../post/PostCommentsModal';

// Backend response data interfaces
export interface BackendPostData {
  id: string;
  content: string;
  mediaUrls: string[];
  createdAt: string | Date;
  likeCount: number;
  commentCount: number;
  user?: {
    id: string;
    username: string;
    profileImage?: string;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface BackendReelData {
  id: string;
  mediaUrl: string;
  thumbnail?: string;
  content?: string;
  createdAt: string | Date;
  likeCount: number;
  commentCount: number;
  user?: {
    id: string;
    username: string;
    profileImage?: string;
  };
  isLiked?: boolean;
  isSaved?: boolean;
  duration?: number;
}

// Main saved item interface from backend
export interface BackendSavedItem {
  id: string;
  type: 'POST' | 'REEL';
  data: BackendPostData | BackendReelData;
  savedAt: string | Date;
}

// Updated props for your component
export interface SavedItemCardProps {
  item: BackendSavedItem;
  onUnsave?: (itemId: string) => void;
  onLikeUpdate?: (itemId: string, isLiked: boolean, likeCount: number) => void;
  onSaveUpdate?: (itemId: string, isSaved: boolean) => void;
}

const SavedItemCard: React.FC<SavedItemCardProps> = ({ 
  item, 
  onUnsave,
  onLikeUpdate,
  onSaveUpdate 
}) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [localItem, setLocalItem] = useState(item);

  // Convert backend data to IReel format
  const convertToReel = (): IReel => {
    const reelData = localItem.data as BackendReelData;
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
      isSaved: true, // Always true in saved items
      duration: reelData.duration,
      createdAt: new Date(reelData.createdAt)
    };
  };

  // Convert backend data to IPost format
  const convertToPost = (): IPost => {
    const postData = localItem.data as BackendPostData;
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
      isSaved: true, // Always true in saved items
      createdAt: new Date(postData.createdAt)
    };
  };

  const handleCardClick = () => {
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
  };

  const handleUnsave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnsave) {
      onUnsave(localItem.id);
      toast.success('Removed from saved');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = localItem.type === 'POST' 
      ? `${window.location.origin}/post/${localItem.data.id}`
      : `${window.location.origin}/reel/${localItem.data.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleReelUpdate = (reelId: string, newContent: string) => {
    if (localItem.type === 'REEL') {
      const updatedData = { ...localItem.data, content: newContent };
      setLocalItem({ ...localItem, data: updatedData });
    }
  };

  const handleReelDelete = (reelId: string) => {
    if (onUnsave) {
      onUnsave(localItem.id);
    }
    setIsViewerOpen(false);
  };

  const handleReelLike = (reelId: string, isLiked: boolean, likeCount: number) => {
    if (localItem.type === 'REEL') {
      const updatedData = { ...localItem.data, isLiked, likeCount };
      setLocalItem({ ...localItem, data: updatedData });
      if (onLikeUpdate) {
        onLikeUpdate(localItem.id, isLiked, likeCount);
      }
    }
  };

  const handleReelSave = (reelId: string, isSaved: boolean) => {
    // In saved items, we handle unsave separately
    if (!isSaved && onUnsave) {
      onUnsave(localItem.id);
      setIsViewerOpen(false);
    }
  };

  const handlePostLike = (isLiked: boolean, likeCount: number) => {
    if (localItem.type === 'POST') {
      const updatedData = { ...localItem.data, isLiked, likeCount };
      setLocalItem({ ...localItem, data: updatedData });
      if (onLikeUpdate) {
        onLikeUpdate(localItem.id, isLiked, likeCount);
      }
    }
  };

  const handlePostCommentCount = (count: number) => {
    if (localItem.type === 'POST') {
      const updatedData = { ...localItem.data, commentCount: count };
      setLocalItem({ ...localItem, data: updatedData });
    }
  };

  // Helper function to determine if media is video
  const isVideoMedia = (url: string) => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm');
  };

  // Get thumbnail URL for the item
  const getThumbnailUrl = () => {
    if (localItem.type === 'POST') {
      const postData = localItem.data as BackendPostData;
      return postData.mediaUrls[0] || '';
    } else {
      const reelData = localItem.data as BackendReelData;
      return reelData.thumbnail || reelData.mediaUrl || '';
    }
  };

  // Get media count for posts
  const getMediaCount = () => {
    if (localItem.type === 'POST') {
      const postData = localItem.data as BackendPostData;
      return postData.mediaUrls.length;
    }
    return 1;
  };

  // Get stats for the item
  const getStats = () => {
    return {
      likes: localItem.data.likeCount || 0,
      comments: localItem.data.commentCount || 0,
      isVideo: localItem.type === 'REEL' || (localItem.type === 'POST' && isVideoMedia(getThumbnailUrl()))
    };
  };

  const stats = getStats();
  const thumbnailUrl = getThumbnailUrl();
  const mediaCount = getMediaCount();
  const isVideo = stats.isVideo;

  useEffect(()=>{
 console.log("-----------------------------------Local Item-----------------------------------------",localItem)
  },[])


  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative group cursor-pointer"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Card Container */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Thumbnail */}
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={localItem.type === 'POST' ? 'Saved Post' : 'Saved Reel'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          )}

          {/* Type Badge */}
          <div className="absolute top-2 left-2 z-10">
            <div className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 ${
              localItem.type === 'POST' 
                ? 'bg-blue-600 text-white' 
                : 'bg-purple-600 text-white'
            }`}>
              {localItem.type === 'POST' ? (
                <FaImages className="w-3 h-3" />
              ) : (
                <FaVideo className="w-3 h-3" />
              )}
              <span>{localItem.type === 'POST' ? 'POST' : 'REEL'}</span>
            </div>
          </div>

          {/* Media Count Badge */}
          {mediaCount > 1 && (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md">
              <FaImages className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-medium">
                {mediaCount}
              </span>
            </div>
          )}

          {/* Video Play Icon */}
          {isVideo && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FaPlay className="w-6 h-6 text-white ml-1" />
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Stats Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <FaHeart className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">
                    {stats.likes}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FaComment className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">
                    {stats.comments}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUnsave}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <FaBookmark className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <FaShare className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          {/* {localItem.data.content && (
            <div className="absolute bottom-12 left-3 right-3">
              <p className="text-white text-sm line-clamp-2 font-medium drop-shadow-lg">
                {localItem.data.content}
              </p>
            </div>
          )} */}
        </div>

        {/* User Info (below card) */}
        <div className="mt-2 px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {localItem.data.user?.profileImage && (
                <img
                  src={localItem.data.user.profileImage}
                  alt={localItem.data.user.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {localItem.data.user?.username || 'Unknown'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(localItem.savedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Reel Viewer Modal */}
      {isViewerOpen && localItem.type === 'REEL' && (
        <ReelViewer
          reel={convertToReel()}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          onReelUpdate={handleReelUpdate}
          onReelDelete={handleReelDelete}
          onReelLike={handleReelLike}
          onReelSave={handleReelSave}
        />
      )}

      {/* Post Comments Modal */}
      {isViewerOpen && localItem.type === 'POST' && (
        <PostCommentsModal
          post={convertToPost()}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          onLikeChange={handlePostLike}
          onCommentCountChange={handlePostCommentCount}
        />
      )}
    </>
  );
};

export default SavedItemCard;