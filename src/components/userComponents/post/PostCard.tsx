// src/components/post/PostCard.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaRegComment, 
  FaBookmark, 
  FaRegBookmark,
  FaShare,
  FaEllipsisH,
  FaPlay,
  FaPause,
  FaVolumeMute,
  FaVolumeUp,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import { BiSolidLike } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import moment from 'moment';

// Components
import PostCommentsModal from './PostCommentsModal';
import PostMenu from './PostMenu';
import UserAvatar from '../../ui/UserAvatar';

// Services
import { 
  toggleLikeApi, 
  toggleSaveApi,
  saveItemApi,
  unsaveItemApi,
  getSavedItemApi
} from '../../../services/user/api';

// Types
import { IPost } from '../../../Types/postTypes';
import { RootState } from '../../../redux/store';
import SharingOption from './SharingOption';

interface PostCardProps {
  post: IPost;
  onDelete?: (postId: string) => void;
  onUpdate?: (postId: string, content: string) => void;
  onLikeChange?: (postId: string, isLiked: boolean, likeCount: number) => void;
  onSaveChange?: (postId: string, isSaved: boolean) => void;
  compact?: boolean;
  isLiked?: boolean;
  setPosts?: React.Dispatch<React.SetStateAction<IPost[]>>;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onDelete,
  onUpdate,
  onLikeChange,
  onSaveChange,
  compact = false,
  isLiked: propIsLiked,
  setPosts
}) => {
  const [isLiked, setIsLiked] = useState(propIsLiked !== undefined ? propIsLiked : (post.isLiked || false));
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string>('square');
  const [isHovered, setIsHovered] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
  const [isSharingOpen, setIsSharingOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const loggedInUser = useSelector((state: RootState) => state.UserReducer.user);
  const isOwner = loggedInUser?.id === post.userId;

  // Update states when post prop changes
  useEffect(() => {
    setIsLiked(post.isLiked || false);
    setIsSaved(post.isSaved || false);
    setLikeCount(post.likeCount || 0);
    setCommentCount(post.commentCount || 0);
  }, [post]);

  // Handle like
  const handleLike = async () => {
    try {
      const response = await toggleLikeApi(post.id, 'post');
      const newIsLiked = response.data.liked;
      const newLikeCount = response.data.totalLikes;
      
      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);
      
      if (onLikeChange) {
        onLikeChange(post.id, newIsLiked, newLikeCount);
      }
      
      if (setPosts) {
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === post.id ? { ...p, isLiked: newIsLiked, likeCount: newLikeCount } : p
          )
        );
      }
      
      if (newIsLiked) {
        toast.success('Liked!', { icon: '❤️', duration: 1500 });
      }
    } catch (error) {
      toast.error('Failed to update like');
      console.error('Like error:', error);
    }
  };

  // Handle save with optimistic update
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    // Optimistic update - change UI immediately
    const previousSavedState = isSaved;
    setIsSaved(!isSaved);
    
    // Update parent state optimistically
    if (onSaveChange) {
      onSaveChange(post.id, !isSaved);
    }
    
    if (setPosts) {
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === post.id ? { ...p, isSaved: !isSaved } : p
        )
      );
    }
    
    try {
      if (isSaved) {
        // Unsave the item
        await unsaveItemApi(post.id, 'POST');
        toast.success('Removed from saved', { 
          icon: '🗑️', 
          duration: 2000 
        });
      } else {
        // Save the item
        await saveItemApi(post.id, 'POST');
        toast.success('Saved to your collection', { 
          icon: '🔖', 
          duration: 2000 
        });
      }
    } catch (error) {
      // Revert on error
      setIsSaved(previousSavedState);
      
      if (onSaveChange) {
        onSaveChange(post.id, previousSavedState);
      }
      
      if (setPosts) {
        setPosts(prevPosts =>
          prevPosts.map(p =>
            p.id === post.id ? { ...p, isSaved: previousSavedState } : p
          )
        );
      }
      
      toast.error('Failed to update save status');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle media navigation
  const handleNextMedia = () => {
    if (post.mediaUrls && currentMediaIndex < post.mediaUrls.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const handlePrevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  // Handle video playback
  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle fullscreen
  const handleFullscreen = () => {
    if (!mediaContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      mediaContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle profile navigation
  const handleProfileClick = () => {
    navigate(`/profile/${post.username}`);
  };

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Format time
  const formatTime = (date: string | Date): string => {
    return moment(date).fromNow();
  };

  // Determine media type
  const isVideo = (url: string): boolean => {
    return url.includes('.mp4') || url.includes('.mov') || url.includes('.webm');
  };

  const currentMedia = post.mediaUrls?.[currentMediaIndex] || '';

  // Calculate aspect ratio on image load
  useEffect(() => {
    if (currentMedia && !isVideo(currentMedia)) {
      const img = new Image();
      img.src = currentMedia;
      img.onload = () => {
        const ratio = img.width / img.height;
        if (ratio > 1.2) setAspectRatio('landscape');
        else if (ratio < 0.8) setAspectRatio('portrait');
        else setAspectRatio('square');
      };
    }
  }, [currentMedia]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 ${
        compact ? 'max-w-sm' : 'w-full max-w-[470px] mx-auto'
      }`}
    >
      {/* Header - Fixed height */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
        <div 
          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
          onClick={handleProfileClick}
        >
          <UserAvatar
            src={post.profileImage}
            alt={post.username}
            size="sm"
            showStatus={false}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
              {post.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(post.createdAt)}
            </span>
          </div>
        </div>
        
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <BsThreeDots className="w-5 h-5" />
          </button>
          
        {isMenuOpen && (
  <PostMenu
    postId={post.id}
    postType="POST"
    isOwner={isOwner}
    onClose={() => setIsMenuOpen(false)}
    onDelete={onDelete}
    onUpdate={onUpdate}
    postContent={post.content || ''}
  />
)}
        </div>
      </div>

      {/* Media Container - Fixed aspect ratio */}
      <div 
        ref={mediaContainerRef}
        className={`relative w-full overflow-hidden bg-black ${
          aspectRatio === 'portrait' ? 'aspect-[9/16]' :
          aspectRatio === 'landscape' ? 'aspect-[16/9]' :
          'aspect-square'
        }`}
      >
        {/* Current Media */}
        {currentMedia && (
          <>
            {isVideo(currentMedia) ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={currentMedia}
                  className="w-full h-full object-contain"
                  loop
                  muted={isMuted}
                  onClick={handleVideoPlay}
                />
                
                {/* Video Controls Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-center justify-center transition-opacity duration-300 ${
                  isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="flex items-center gap-3 p-2 bg-black/50 backdrop-blur-sm rounded-full">
                    <button
                      onClick={handleVideoPlay}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      {isPlaying ? (
                        <FaPause className="w-4 h-4 text-white" />
                      ) : (
                        <FaPlay className="w-4 h-4 text-white" />
                      )}
                    </button>
                    
                    <button
                      onClick={handleVideoMute}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      {isMuted ? (
                        <FaVolumeMute className="w-4 h-4 text-white" />
                      ) : (
                        <FaVolumeUp className="w-4 h-4 text-white" />
                      )}
                    </button>
                    
                    <button
                      onClick={handleFullscreen}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    >
                      {isFullscreen ? (
                        <FaCompress className="w-4 h-4 text-white" />
                      ) : (
                        <FaExpand className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={currentMedia}
                alt={`Post by ${post.username}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-zoom-in"
                loading="lazy"
              />
            )}
          </>
        )}

        {/* Media Navigation Dots */}
        {post.mediaUrls && post.mediaUrls.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5">
            {post.mediaUrls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMediaIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentMediaIndex
                    ? 'bg-white w-3'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Media Navigation Arrows */}
        {post.mediaUrls && post.mediaUrls.length > 1 && isHovered && (
          <>
            {currentMediaIndex > 0 && (
              <button
                onClick={handlePrevMedia}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/75 rounded-full transition-colors"
              >
                <div className="w-4 h-4 border-l-2 border-t-2 border-white transform rotate-45 translate-x-0.5" />
              </button>
            )}
            
            {currentMediaIndex < post.mediaUrls.length - 1 && (
              <button
                onClick={handleNextMedia}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/75 rounded-full transition-colors"
              >
                <div className="w-4 h-4 border-r-2 border-t-2 border-white transform -rotate-45 -translate-x-0.5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Actions Bar - Compact */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={isSaving}
              className="group relative"
            >
              <motion.div
                whileTap={{ scale: 1.2 }}
                className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {isLiked ? (
                  <FaHeart className="w-5 h-5 text-red-500" />
                ) : (
                  <FaRegHeart className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-red-500 transition-colors" />
                )}
              </motion.div>
            </button>

            <button
              onClick={() => setIsCommentsOpen(true)}
              className="group"
            >
              <motion.div
                whileTap={{ scale: 1.2 }}
                className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <FaRegComment className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
              </motion.div>
            </button>

            <button 
              onClick={() => setIsSharingOpen(true)} 
              className="group"
            >
              <div className="p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                <FaShare className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-green-500 transition-colors" />
              </div>
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="group relative"
          >
            <motion.div
              whileTap={{ scale: 1.2 }}
              className="p-1.5 rounded-full hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              ) : isSaved ? (
                <FaBookmark className="w-5 h-5 text-yellow-500" />
              ) : (
                <FaRegBookmark className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-yellow-500 transition-colors" />
              )}
            </motion.div>
          </button>
        </div>

        {/* Likes and Comments Count */}
        <div className="flex items-center gap-3 mb-2">
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            {formatNumber(likeCount)} likes
          </span>
          <button
            onClick={() => setIsCommentsOpen(true)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {formatNumber(commentCount)} comments
          </button>
        </div>

        {/* Caption - Compact */}
        {post.content && (
          <div className="mb-2">
            <div 
              className={`text-sm text-gray-800 dark:text-gray-200 ${
                showCaption ? '' : 'line-clamp-2'
              }`}
            >
              <span className="font-semibold mr-1.5">{post.username}</span>
              {post.content}
            </div>
            {post.content.length > 100 && (
              <button
                onClick={() => setShowCaption(!showCaption)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mt-0.5"
              >
                {showCaption ? 'Show less' : '...more'}
              </button>
            )}
          </div>
        )}

        {/* View Comments Button */}
        <button
          onClick={() => setIsCommentsOpen(true)}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          View all {commentCount} comments
        </button>
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {isCommentsOpen && (
          <PostCommentsModal
            post={post}
            isOpen={isCommentsOpen}
            onClose={() => setIsCommentsOpen(false)}
            onLikeChange={(liked, count) => {
              setIsLiked(liked);
              setLikeCount(count);
            }}
            onCommentCountChange={setCommentCount}
          />
        )}
      </AnimatePresence>

      {/* Sharing Modal */}
      <AnimatePresence>
        {isSharingOpen && (
          <SharingOption
            postId={post.id}
            postType={"POST"}
            postPreview={{
              thumbnail: post.mediaUrls?.[0] || '',
              content: post.content || '',
              mediaUrl: post.mediaUrls?.[0] || ''
            }}
            onClose={() => setIsSharingOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;