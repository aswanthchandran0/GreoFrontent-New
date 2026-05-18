// src/components/explore/ExploreScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlay, 
  FaHeart, 
  FaComment, 
  FaImages, 
  FaVideo,
  FaSearch,
  FaTimes,
  FaFilm,
  FaRegImages,
  FaCompass,
  FaChevronDown
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { RootState } from '../redux/store';
import { getExploreFeedApi } from '../services/user/api';
import { LoaderSpinner } from '../components/ui/LoadingSpinner';
import ReelViewer from '../components/userComponents/reel/ReelViewer';
import PostCommentsModal from '../components/userComponents/post/PostCommentsModal';

// Types
interface ExploreItem {
  id: string;
  type: 'post' | 'reel';
  userId: string;
  username: string;
  profileImage?: string;
  content?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: Date;
  mediaUrls?: string[];
  thumbnail?: string;
  mediaUrl?: string;
}

const ExploreScreen: React.FC = () => {
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ExploreItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'reels'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const loggedInUser = useSelector((state: RootState) => state.UserReducer.user);

  // Fetch explore feed
  const fetchExploreFeed = useCallback(async (pageNum: number, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await getExploreFeedApi(pageNum, 30);
      const newItems = response.data || [];
      
      if (reset) {
        setItems(newItems);
        setHasMore(newItems.length === 30);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setHasMore(newItems.length === 30);
      }
    } catch (error) {
      console.error('Error fetching explore feed:', error);
      toast.error('Failed to load explore feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchExploreFeed(1, true);
  }, []);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage(prev => prev + 1);
          fetchExploreFeed(page + 1, false);
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadingMore, hasMore, page, fetchExploreFeed]);

  const handleItemClick = (item: ExploreItem, index: number) => {
    setSelectedItem(item);
    setCurrentIndex(index);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedItem(null);
    setCurrentIndex(0);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedItem) return;
    
    const filteredItems = getFilteredItems();
    const currentIdx = filteredItems.findIndex(item => item.id === selectedItem.id);
    
    if (direction === 'prev' && currentIdx > 0) {
      setSelectedItem(filteredItems[currentIdx - 1]);
      setCurrentIndex(currentIdx - 1);
    } else if (direction === 'next' && currentIdx < filteredItems.length - 1) {
      setSelectedItem(filteredItems[currentIdx + 1]);
      setCurrentIndex(currentIdx + 1);
    }
  };

  const handleLikeUpdate = (itemId: string, isLiked: boolean, likeCount: number) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isLiked, likeCount }
        : item
    ));
  };

  const handleSaveUpdate = (itemId: string, isSaved: boolean) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, isSaved }
        : item
    ));
  };

  const getFilteredItems = () => {
    let filtered = items;
    
    if (activeFilter === 'posts') {
      filtered = filtered.filter(item => item.type === 'post');
    } else if (activeFilter === 'reels') {
      filtered = filtered.filter(item => item.type === 'reel');
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.username.toLowerCase().includes(query) ||
        (item.content && item.content.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const filteredItems = getFilteredItems();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getThumbnailUrl = (item: ExploreItem): string => {
    if (item.type === 'post') {
      return item.mediaUrls?.[0] || '';
    }
    return item.thumbnail || item.mediaUrl || '';
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoaderSpinner loading={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <FaCompass className="w-7 h-7 text-gray-900 dark:text-white" />
              
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Explore
              </h1>
            </div>

            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                  {activeFilter === 'all' ? 'For You' : activeFilter === 'posts' ? 'Posts' : 'Reels'}
                </span>
                <FaChevronDown className={`w-3 h-3 text-gray-600 dark:text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20"
                  >
                    <button
                      onClick={() => {
                        setActiveFilter('all');
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                        activeFilter === 'all' 
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      For You
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter('posts');
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                        activeFilter === 'posts' 
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Posts
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter('reels');
                        setShowFilters(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                        activeFilter === 'reels' 
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Reels
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-[1400px] mx-auto px-0 sm:px-2 lg:px-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 dark:text-gray-400">
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FaCompass className="w-12 h-12 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No content found</h3>
            <p className="text-sm">Try adjusting your search or filter settings</p>
          </div>
        ) : (
          <>
            {/* Instagram-style grid */}
            <div className="grid grid-cols-3 gap-0 sm:gap-1 lg:gap-2">
              {filteredItems.map((item, index) => {
                const thumbnailUrl = getThumbnailUrl(item);
                const isVideo = item.type === 'reel';
                const isPost = item.type === 'post';
                
                return (
                  <motion.div
                    key={`${item.id}-${item.type}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.01, 0.5) }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group cursor-pointer overflow-hidden"
                    style={{ aspectRatio: '1 / 1' }}
                    onClick={() => handleItemClick(item, index)}
                  >
                    <div className="relative w-full h-full">
                      {/* Image/Thumbnail */}
                      {thumbnailUrl && (
                        <img
                          src={thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                      
                      {/* Video/Media Type Icon */}
                      {isVideo && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <FaPlay className="w-3 h-3 text-white ml-0.5" />
                          </div>
                        </div>
                      )}
                      
                      {/* Multiple Images Icon */}
                      {isPost && item.mediaUrls && item.mediaUrls.length > 1 && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <FaImages className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-8">
                          <div className="flex items-center gap-2">
                            <FaHeart className="w-6 h-6 text-white" />
                            <span className="text-white font-semibold text-lg">
                              {formatNumber(item.likeCount)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaComment className="w-6 h-6 text-white" />
                            <span className="text-white font-semibold text-lg">
                              {formatNumber(item.commentCount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="h-10" />
            
            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
            
            {/* End of Content */}
            {!hasMore && filteredItems.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">You've reached the end</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Item Viewer Modal */}
      <AnimatePresence>
        {isViewerOpen && selectedItem && (
          selectedItem.type === 'reel' ? (
            <ReelViewer
              reel={{
                id: selectedItem.id,
                userId: selectedItem.userId,
                username: selectedItem.username,
                profileImage: selectedItem.profileImage ?? "",
                thumbnail: selectedItem.thumbnail || '',
                mediaUrl: selectedItem.mediaUrl || '',
                content: selectedItem.content || '',
                likeCount: selectedItem.likeCount,
                commentCount: selectedItem.commentCount,
                isLiked: selectedItem.isLiked,
                isSaved: selectedItem.isSaved,
                createdAt: selectedItem.createdAt,
              }}
              isOpen={isViewerOpen}
              onClose={handleCloseViewer}
              onNavigate={handleNavigate}
              currentIndex={currentIndex}
              totalReels={filteredItems.filter(i => i.type === 'reel').length}
              onReelLike={(reelId, isLiked, likeCount) => handleLikeUpdate(reelId, isLiked, likeCount)}
              onReelSave={(reelId, isSaved) => handleSaveUpdate(reelId, isSaved)}
            />
          ) : (
            <PostCommentsModal
              post={{
                id: selectedItem.id,
                userId: selectedItem.userId,
                username: selectedItem.username,
                profileImage: selectedItem.profileImage,
                mediaUrls: selectedItem.mediaUrls || [],
                content: selectedItem.content || '',
                likeCount: selectedItem.likeCount,
                commentCount: selectedItem.commentCount,
                isLiked: selectedItem.isLiked,
                isSaved: selectedItem.isSaved,
                createdAt: selectedItem.createdAt,
              }}
              isOpen={isViewerOpen}
              onClose={handleCloseViewer}
              onLikeChange={(isLiked, likeCount) => handleLikeUpdate(selectedItem.id, isLiked, likeCount)}
              onCommentCountChange={() => {}}
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExploreScreen;