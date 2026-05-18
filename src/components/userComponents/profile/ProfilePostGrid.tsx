// src/components/userComponents/profile/ProfilePostGrid.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IPost } from '../../../Types/postTypes';
import { LoaderSpinner } from '../../ui/LoadingSpinner';
import { FaRegImages, FaRegHeart, FaRegComment } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PostCommentsModal from '../post/PostCommentsModal';


interface ProfilePostGridProps {
  posts: IPost[];
  loading: boolean;
  emptyMessage: string;
}

const ProfilePostGrid: React.FC<ProfilePostGridProps> = ({
  posts,
  loading,
  emptyMessage,
}) => {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handlePostClick = (post: IPost) => {
    setSelectedPost(post);
    setIsCommentsOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentsOpen(false);
    setSelectedPost(null);
  };

  const handleLikeChange = (isLiked: boolean, likeCount: number) => {
    if (selectedPost) {
      // Update the post in the list if needed
      // You can implement this if you want to update the like count in the grid
    }
  };

  const handleCommentCountChange = (count: number) => {
    if (selectedPost) {
      // Update the comment count in the grid if needed
      // You can implement this to update the comment count in the post card
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderSpinner loading={true} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <FaRegImages className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No posts yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id || index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => handlePostClick(post)}
            className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <img
              src={post.mediaUrls?.[0]}
              alt="Post"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1 text-white">
                <FaRegHeart className="w-5 h-5" />
                <span className="font-semibold">{post.likeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-white">
                <FaRegComment className="w-5 h-5" />
                <span className="font-semibold">{post.commentCount || 0}</span>
              </div>
            </div>
            
            {/* Multiple Images Indicator */}
            {post.mediaUrls && post.mediaUrls.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                +{post.mediaUrls.length}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Comments Modal */}
      {selectedPost && (
        <PostCommentsModal
          post={selectedPost}
          isOpen={isCommentsOpen}
          onClose={handleCloseComments}
          onLikeChange={handleLikeChange}
          onCommentCountChange={handleCommentCountChange}
        />
      )}
    </>
  );
};

export default ProfilePostGrid;