// src/components/post/PostMenu.tsx

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrash, 
  FaEdit, 
  FaCopy, 
  FaLink, 
  FaFlag, 
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import ReportModal from './ReportModal';
import { deletePostApi, updatePostApi } from '../../../services/user/api';

interface PostMenuProps {
  postId: string;
  postType?: 'POST' | 'REEL';
  isOwner: boolean;
  postContent: string;
  onClose: () => void;
  onDelete?: (postId: string) => void;
  onUpdate?: (postId: string, content: string) => void;
}

const PostMenu: React.FC<PostMenuProps> = ({
  postId,
  postType = 'POST',
  isOwner,
  postContent,
  onClose,
  onDelete,
  onUpdate
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editContent, setEditContent] = useState(postContent);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    if (showEditModal || showReportModal) return;
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
      handleClose();
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(postContent);
      toast.success('Content copied!');
      handleClose();
    } catch (err) {
      toast.error('Failed to copy content');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      await deletePostApi(postId);
      toast.success('Post deleted successfully');
      onDelete?.(postId);
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent === postContent) {
      setShowEditModal(false);
      return;
    }
    
    setIsUpdating(true);
    try {
      await updatePostApi(postId, editContent);
      toast.success('Post updated successfully');
      onUpdate?.(postId, editContent);
      setShowEditModal(false);
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update post');
      console.error('Error updating post:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setShowReportModal(false);
    handleClose();
  };

  const menuItems = [
    ...(isOwner ? [
      {
        icon: <FaEdit className="w-4 h-4" />,
        label: 'Edit Post',
        onClick: () => setShowEditModal(true),
        color: 'text-blue-600',
        disabled: false
      },
      {
        icon: <FaTrash className="w-4 h-4" />,
        label: 'Delete Post',
        onClick: handleDelete,
        color: 'text-red-600',
        disabled: isDeleting
      }
    ] : []),
    {
      icon: <FaCopy className="w-4 h-4" />,
      label: 'Copy Content',
      onClick: handleCopyContent,
      color: 'text-gray-700',
      disabled: false
    },
    {
      icon: <FaLink className="w-4 h-4" />,
      label: 'Copy Link',
      onClick: handleCopyLink,
      color: 'text-gray-700',
      disabled: false
    },
    ...(!isOwner ? [
      {
        icon: <FaFlag className="w-4 h-4" />,
        label: 'Report Post',
        onClick: handleReport,
        color: 'text-red-600',
        disabled: false
      }
    ] : [])
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && !showEditModal && !showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-200 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-center">
                  {postType === 'POST' ? 'Post' : 'Reel'} Options
                </h3>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={`flex items-center w-full gap-3 px-6 py-4 text-left transition-colors ${
                      item.disabled 
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className={item.color}>{item.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.label}
                      {item.disabled && item.label === 'Delete Post' && '...'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Cancel Button */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleClose}
                  className="w-full py-3 font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Edit Post
                </h3>
                <button
                  onClick={handleModalClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
                rows={4}
                placeholder="Edit your post content..."
                autoFocus
                disabled={isUpdating}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleModalClose}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || editContent === postContent || isUpdating}
                  className="flex-1 px-4 py-3 font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <ReportModal
            postId={postId}
            postType={postType}
            onClose={handleModalClose}
            onReportComplete={() => {
              // Don't close immediately - let the modal handle its own close
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PostMenu;