// src/components/post/PostCarouselModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight, 
  FaHeart, 
  FaRegHeart,
  FaComment,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaPaperPlane,
  FaEllipsisH
} from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import { useSwipeable } from 'react-swipeable';
import PostCard from './PostCard';

import toast from 'react-hot-toast';
import { IPost } from '../../../Types/postTypes';
import UserAvatar from '../../ui/UserAvatar';
import SharingOption from './SharingOption';

interface PostCarouselModalProps {
  posts: IPost[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

const PostCarouselModal: React.FC<PostCarouselModalProps> = ({
  posts,
  initialIndex,
  isOpen,
  onClose,
  onNavigate
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSharingOpen, setIsSharingOpen] = useState(false);

  const currentPost = posts[currentIndex];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onNavigate('prev');
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onNavigate('next');
    }
  }, [currentIndex, posts.length, onNavigate]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Unliked' : 'Liked!', { icon: isLiked ? '💔' : '❤️' });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Removed from saved' : 'Saved!');
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      toast.success('Comment posted!');
      setComment('');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${currentPost.id}`
      );
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-6xl h-full flex items-center justify-center"
        {...swipeHandlers}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-1 z-10 p-3 text-white hover:text-gray-300 transition-colors"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 text-white hover:text-gray-300 transition-colors"
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
        )}

        {currentIndex < posts.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 text-white hover:text-gray-300 transition-colors"
          >
            <FaChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Post Counter */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {posts.length}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row w-full h-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          {/* Media Section */}
          <div className="flex-1 relative min-h-[300px] md:min-h-0">
            {currentPost.mediaUrls && currentPost.mediaUrls[0] && (
              <div className="relative w-full h-full">
                {currentPost.mediaUrls[0].includes('.mp4') ||
                 currentPost.mediaUrls[0].includes('.mov') ? (
                  <video
                    src={currentPost.mediaUrls[0]}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={currentPost.mediaUrls[0]}
                    alt={`Post by ${currentPost.username}`}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            )}

            {/* Multiple Media Indicator */}
            {currentPost.mediaUrls && currentPost.mediaUrls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {currentPost.mediaUrls.map((_:any, index:number) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === 0
                        ? 'bg-white'
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={currentPost.profileImage}
                  alt={currentPost.username}
                  size="md"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {currentPost.username}
                  </h3>
                  {currentPost.location && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentPost.location}
                    </p>
                  )}
                </div>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <BsThreeDots className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Caption */}
              {currentPost.content && (
                <div className="flex gap-3">
                  <UserAvatar
                    src={currentPost.profileImage}
                    alt={currentPost.username}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {currentPost.username}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentPost.content}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      2 hours ago
                    </p>
                  </div>
                </div>
              )}

              {/* Sample Comments */}
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <FaComment className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Comments will appear here</p>
                <p className="text-sm mt-1">Click comment button to view</p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className="p-2 hover:text-red-500 transition-colors"
                  >
                    {isLiked ? (
                      <FaHeart className="w-6 h-6 text-red-500" />
                    ) : (
                      <FaRegHeart className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowComments(true)}
                    className="p-2 hover:text-blue-500 transition-colors"
                  >
                    <FaComment className="w-6 h-6" />
                  </button>
                 <button
  onClick={() => setIsSharingOpen(true)}
  className="p-2 hover:text-green-500 transition-colors"
>
  <FaShare className="w-6 h-6" />
</button>

                </div>
                <button
                  onClick={handleSave}
                  className="p-2 hover:text-yellow-500 transition-colors"
                >
                  {isSaved ? (
                    <FaBookmark className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <FaRegBookmark className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Likes Count */}
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {currentPost.likeCount || 0} likes
              </div>

              {/* Comment Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border border-transparent focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaPaperPlane className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
  {isSharingOpen && (
    <SharingOption
      postId={currentPost.id}
      postType={'POST'} // Change to 'REEL' if it's a reel
      postPreview={{
        thumbnail: currentPost.mediaUrls?.[0] || '',
        content: currentPost.content || '',
        mediaUrl: currentPost.mediaUrls?.[0] || ''
      }}
      onClose={() => setIsSharingOpen(false)}
    />
  )}
</AnimatePresence>
    </div>
  );
};

export default PostCarouselModal;