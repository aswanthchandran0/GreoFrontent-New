// src/components/reel/ReelCard.tsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { IReel } from '../../Types/reelTypes';


interface ReelCardProps {
  reel: IReel;
  onClick?: () => void;
  onLikeToggle?: (reelId: string) => Promise<void>;
  compact?: boolean;
}

const ReelCard: React.FC<ReelCardProps> = ({ 
  reel, 
  onClick,
  onLikeToggle,
  compact = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localIsLiked, setLocalIsLiked] = useState(reel.isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(reel.likeCount);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLikeToggle) {
      try {
        await onLikeToggle(reel.id);
        setLocalIsLiked(!localIsLiked);
        setLocalLikeCount(prev => localIsLiked ? prev - 1 : prev + 1);
      } catch (error) {
        console.error('Failed to toggle like:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative cursor-pointer ${compact ? 'max-w-xs' : 'w-full'}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Container */}
      <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={reel.mediaUrl}
          poster={reel.thumbnail}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          muted
          loop
          playsInline
          preload="metadata"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Play/Pause Overlay */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full">
              {isPlaying ? (
                <FaPause className="w-6 h-6 text-white" />
              ) : (
                <FaPlay className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        )}

        {/* Stats Bar (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Like Button */}
              <button
                onClick={handleLikeClick}
                className="flex items-center space-x-1"
              >
                {localIsLiked ? (
                  <FaHeart className="w-4 h-4 text-red-500" />
                ) : (
                  <FaRegHeart className="w-4 h-4 text-white" />
                )}
                <span className="text-white text-sm font-medium">
                  {localLikeCount}
                </span>
              </button>

              {/* Comment Button */}
              <div className="flex items-center space-x-1">
                <FaComment className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">
                  {reel.commentCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Play Icon (when not hovered) */}
        {!isHovered && (
          <div className="absolute top-3 right-3">
            <FaPlay className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      {/* Content (only show in compact mode) */}
      {compact && reel.content && (
        <div className="mt-2">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {reel.content}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ReelCard;