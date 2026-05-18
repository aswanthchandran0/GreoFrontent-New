// src/components/reel/ReelGrid.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVideo, FaPlay, FaHeart, FaComment } from 'react-icons/fa';
import { IReel } from '../../../Types/reelTypes';
import ReelViewer from './ReelViewer';

interface ReelGridProps {
  reels: IReel[];
  loading?: boolean;
  emptyMessage?: string;
  onReelUpdate?: (updatedReel: IReel) => void; // Add callback for updates
  onReelDelete?: (reelId: string) => void; // Add callback for deletions
  onReelLike?: (reelId: string, isLiked: boolean, likeCount: number) => void; // Add callback for likes
  onReelSave?: (reelId: string, isSaved: boolean) => void; // Add callback for saves
}

const ReelGrid: React.FC<ReelGridProps> = ({
  reels,
  loading = false,
  emptyMessage = 'No reels yet',
  onReelUpdate,
  onReelDelete,
  onReelLike,
  onReelSave
}) => {
  const [selectedReelIndex, setSelectedReelIndex] = useState<number>(-1);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [hoveredReelId, setHoveredReelId] = useState<string | null>(null);
  const [localReels, setLocalReels] = useState<IReel[]>(reels);

  // Update local reels when prop changes
  React.useEffect(() => {
    setLocalReels(reels);
  }, [reels]);

  const handleReelClick = (index: number) => {
    setSelectedReelIndex(index);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedReelIndex(-1);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedReelIndex > 0) {
      setSelectedReelIndex(selectedReelIndex - 1);
    } else if (direction === 'next' && selectedReelIndex < localReels.length - 1) {
      setSelectedReelIndex(selectedReelIndex + 1);
    }
  };

  const handleReelUpdate = (reelId: string, newContent: string) => {
    // Update local state
    const updatedReels = localReels.map(reel =>
      reel.id === reelId
        ? { ...reel, content: newContent }
        : reel
    );
    setLocalReels(updatedReels);
    
    // Notify parent
    const updatedReel = localReels.find(r => r.id === reelId);
    if (updatedReel && onReelUpdate) {
      onReelUpdate({ ...updatedReel, content: newContent });
    }
  };

  const handleReelDelete = (reelId: string) => {
    // Update local state
    const updatedReels = localReels.filter(reel => reel.id !== reelId);
    setLocalReels(updatedReels);
    
    // Close viewer if needed
    if (selectedReelIndex >= 0 && localReels[selectedReelIndex]?.id === reelId) {
      setIsViewerOpen(false);
      setSelectedReelIndex(-1);
    }
    
    // Notify parent
    if (onReelDelete) {
      onReelDelete(reelId);
    }
  };

  const handleReelLike = (reelId: string, isLiked: boolean, likeCount: number) => {
    // Update local state
    const updatedReels = localReels.map(reel =>
      reel.id === reelId
        ? { ...reel, isLiked, likeCount }
        : reel
    );
    setLocalReels(updatedReels);
    
    // Notify parent
    if (onReelLike) {
      onReelLike(reelId, isLiked, likeCount);
    }
  };

  const handleReelSave = (reelId: string, isSaved: boolean) => {
    // Update local state
    const updatedReels = localReels.map(reel =>
      reel.id === reelId
        ? { ...reel, isSaved }
        : reel
    );
    setLocalReels(updatedReels);
    
    // Notify parent
    if (onReelSave) {
      onReelSave(reelId, isSaved);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="aspect-[9/16] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (localReels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <FaVideo className="w-12 h-12 opacity-50" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{emptyMessage}</h3>
        <p className="text-sm">Create short videos to share with your followers</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {localReels.map((reel, index) => (
          <motion.div
            key={reel.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredReelId(reel.id)}
            onMouseLeave={() => setHoveredReelId(null)}
            onClick={() => handleReelClick(index)}
          >
            {/* Reel Thumbnail */}
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black">
              {/* Thumbnail Image */}
              <img
                src={reel.thumbnail}
                alt={`Reel by ${reel.username}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              
              {/* Play Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FaPlay className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Stats Overlay (on hover) */}
              <div
                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                  hoveredReelId === reel.id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <FaHeart className="w-5 h-5" />
                    <span className="font-semibold">{reel.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaComment className="w-5 h-5" />
                    <span className="font-semibold">{reel.commentCount}</span>
                  </div>
                </div>
              </div>
              
              {/* Duration Badge */}
              {reel.duration && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white">
                  {Math.floor(reel.duration / 60)}:{(reel.duration % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reel Viewer Modal */}
      <AnimatePresence>
        {isViewerOpen && selectedReelIndex >= 0 && (
          <ReelViewer
            reel={localReels[selectedReelIndex]}
            isOpen={isViewerOpen}
            onClose={handleCloseViewer}
            onNavigate={handleNavigate}
            currentIndex={selectedReelIndex}
            totalReels={localReels.length}
            onReelUpdate={handleReelUpdate}
            onReelDelete={handleReelDelete}
            onReelLike={handleReelLike}
            onReelSave={handleReelSave}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ReelGrid;