// src/components/user/UserPosts.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { IoMdAdd } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import SavedItemCard, { BackendSavedItem } from './SavedItemCard';
import ModernUploadModal from '../../upload/ModernUploadModal';
import ProfilePostGrid from './ProfilePostGrid';

// Services
import { getSavedItemApi, getUserRollApi } from '../../../services/user/api';

// Types
import { IPost } from '../../../Types/postTypes';
import { IReel } from '../../../Types/reelTypes';

// UI
import { LoaderSpinner } from '../../ui/LoadingSpinner';
import { RootState } from '../../../redux/store';
import ReelGrid from '../reel/ReelGrid';
import { FaBookmark, FaPlayCircle, FaRegImages, FaImage, FaVideo } from 'react-icons/fa';

interface UserPostsProps {
  user: {
    id: string;
    username: string;
    profileImage: string;
  } | null;
  posts: IPost[];
  setRefreshPosts: (value: boolean) => void;
  refreshPosts: boolean;
}

const UserPosts: React.FC<UserPostsProps> = ({ user, posts, setRefreshPosts, refreshPosts }) => {
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [reels, setReels] = useState<IReel[]>([]);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [savedItems, setSavedItems] = useState<BackendSavedItem[]>([]);
  const [loading, setLoading] = useState({
    posts: false,
    reels: false,
    saved: false
  });
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  // Use a ref to store the pending upload type
  const pendingUploadType = useRef<'image' | 'video'>('image');
  
  const { username } = useParams();
  const loggedInUser = useSelector((state: RootState) => state.UserReducer.user);

  // Add user details to posts
  useEffect(() => {
    if (user && posts) {
      const postDetails = posts.map((post) => ({
        ...post,
        profileImage: user.profileImage,
        username: user.username,
      }));
      setUserPosts(postDetails);
    } else {
      setUserPosts(posts);
    }
  }, [posts, user]);

  // Fetch user reels when tab changes
  useEffect(() => {
    if (activeTab === 1 && user?.id && reels.length === 0) {
      fetchUserReels();
    }
  }, [activeTab, user?.id]);

  // Fetch saved items
  useEffect(() => {
    if (activeTab === 2) {
      fetchSavedItems();
    }
  }, [activeTab]);

  const fetchUserReels = async () => {
    try {
      setLoading(prev => ({ ...prev, reels: true }));
      const response = await getUserRollApi(user?.id ?? '');
      setReels(response.data);
    } catch (err) {
      toast.error('Failed to fetch reels');
      console.error('Error fetching reels:', err);
    } finally {
      setLoading(prev => ({ ...prev, reels: false }));
    }
  };

  const fetchSavedItems = async () => {
    try {
      setLoading(prev => ({ ...prev, saved: true }));
      const response = await getSavedItemApi();
      setSavedItems(response.data.data);
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoading(prev => ({ ...prev, saved: false }));
    }
  };

  const handleUploadComplete = async (uploadResult: {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    publicId: string;
    metadata: any;
  }) => {
    try {
      if (uploadResult.type === 'image') {
        setRefreshPosts(!refreshPosts);
        toast.success('Post uploaded successfully!');
      } else {
        // Refresh reels
        await fetchUserReels();
        toast.success('Reel uploaded successfully!');
      }
    } catch (error) {
      toast.error('Failed to save media');
      console.error('Error saving media:', error);
    }
  };

  const handleUploadClick = (type: 'image' | 'video') => {
    console.log('🎬 handleUploadClick called with type:', type);
    // Store in ref first
    pendingUploadType.current = type;
    // Update state
    setUploadType(type);
    // Open modal
    setIsUploadModalOpen(true);
    setShowUploadOptions(false);
  };

  const handleCloseModal = () => {
    console.log('🔴 Closing modal');
    setIsUploadModalOpen(false);
    // Reset after modal closes
    setTimeout(() => {
      setUploadType('image');
      pendingUploadType.current = 'image';
    }, 100);
  };

  const isCurrentUser = username === loggedInUser?.username;

  // Upload Options Modal
  const UploadOptionsModal = () => (
    <AnimatePresence>
      {showUploadOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">
                Create New Content
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                Choose what you want to share
              </p>
            </div>

            {/* Options */}
            <div className="p-4 space-y-3">
              <button
                onClick={() => handleUploadClick('image')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaImage className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold">Create Post</h4>
                  <p className="text-xs text-white/80">Share photos with your followers</p>
                </div>
                <div className="text-white/60 group-hover:translate-x-1 transition-transform">→</div>
              </button>

              <button
                onClick={() => handleUploadClick('video')}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaVideo className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold">Create Reel</h4>
                  <p className="text-xs text-white/80">Share short videos (5-60 seconds)</p>
                </div>
                <div className="text-white/60 group-hover:translate-x-1 transition-transform">→</div>
              </button>
            </div>

            {/* Cancel Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowUploadOptions(false)}
                className="w-full py-3 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-6xl mx-auto px-4"
    >
      {/* Header with Tabs */}
      <div className="mb-8">
        {/* Single Upload Button */}
        {isCurrentUser && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowUploadOptions(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
              <IoMdAdd className="w-5 h-5" />
              <span className="font-semibold">Create New</span>
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-center space-x-12">
            {['Posts', 'Reels', 'Saved'].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(index as 0 | 1 | 2)}
                className={`relative py-4 px-1 font-medium text-sm transition-colors ${
                  activeTab === index
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <FaRegImages className="w-4 h-4" />}
                  {index === 1 && <FaPlayCircle className="w-4 h-4" />}
                  {index === 2 && <FaBookmark className="w-4 h-4" />}
                  <span>{tab}</span>
                </div>
                {activeTab === index && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 dark:bg-white"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading.posts && activeTab === 0 ? (
        <div className="flex items-center justify-center py-20">
          <LoaderSpinner loading={true} />
        </div>
      ) : (
        <div className="mt-6">
          {/* Posts Tab */}
          {activeTab === 0 && (
            <ProfilePostGrid
              posts={userPosts}
              loading={loading.posts}
              emptyMessage={isCurrentUser 
                ? "Share your first post with the world!" 
                : `${username} hasn't posted anything yet`
              }
            />
          )}

          {/* Reels Tab */}
          {activeTab === 1 && (
            <ReelGrid
              reels={reels}
              loading={loading.reels}
              emptyMessage={isCurrentUser
                ? "Create your first reel!"
                : `${username} hasn't created any reels yet`
              }
            />
          )}

          {/* Saved Tab */}
         {activeTab === 2 && (
  <div className="mt-6">
    {/* Saved Items Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Saved Items
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {/* Filter all */}}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          All
        </button>
        <button
          onClick={() => {/* Filter posts */}}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Posts
        </button>
        <button
          onClick={() => {/* Filter reels */}}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Reels
        </button>
      </div>
    </div>

    {/* Saved Items Grid */}
    {loading.saved ? (
      <div className="flex items-center justify-center py-20">
        <LoaderSpinner loading={true} />
      </div>
    ) : savedItems.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
        <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <FaBookmark className="w-12 h-12 opacity-50" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No saved items yet</h3>
        <p className="text-sm">Save posts and reels you want to revisit later</p>
        {isCurrentUser && (
          <button 
            onClick={() => setShowUploadOptions(true)}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Create Content
          </button>
        )}
      </div>
    ) : (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
      >
        {savedItems.map((item) => (
          <SavedItemCard
            key={item.id}
            item={item}
            onUnsave={(itemId) => {
              setSavedItems(prev => prev.filter(i => i.id !== itemId));
            }}
            onLikeUpdate={(itemId, isLiked, likeCount) => {
              setSavedItems(prev => prev.map(i => 
                i.id === itemId 
                  ? { 
                      ...i, 
                      data: { ...i.data, isLiked, likeCount }
                    } 
                  : i
              ));
            }}
          />
        ))}
      </motion.div>
    )}
  </div>
)}
        </div>
      )}

      {/* Upload Options Modal */}
      <UploadOptionsModal />

      {/* Modern Upload Modal */}
      <ModernUploadModal
        key={uploadType} // Add key to force re-render when uploadType changes
        isOpen={isUploadModalOpen}
        onClose={handleCloseModal}
        onUploadComplete={handleUploadComplete}
        uploadType={uploadType}
        title={uploadType === 'image' ? 'Create Post' : 'Create Reel'}
        userId={loggedInUser?.id || loggedInUser?.id}
      />
    </motion.div>
  );
};

export default UserPosts;