// src/components/reel/ReelViewer.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaMusic,
  FaEllipsisH,
  FaSmile,
  FaPaperPlane,
  FaReply,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import moment from 'moment';

// Services
import { 
  toggleLikeApi, 
  toggleSaveApi, 
  postCommentApi,
  getCommentsApi,
  deleteCommentApi,
  likeCommentApi,
  editCommentApi,
  updateReelApi,
  deleteReelApi
} from '../../../services/user/api';

// Components
import UserAvatar from '../../ui/UserAvatar';

// Types
import { IReel } from '../../../Types/reelTypes';
import { IComment, IReply } from '../../../Types/commentTypes';
import { RootState } from '../../../redux/store';

// Utils
import toast from 'react-hot-toast';

interface ReelViewerProps {
  reel: IReel;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  currentIndex?: number;
  totalReels?: number;
  onReelUpdate?: (reelId: string, newContent: string) => void;
  onReelDelete?: (reelId: string) => void;
  onReelLike?: (reelId: string, isLiked: boolean, likeCount: number) => void;
  onReelSave?: (reelId: string, isSaved: boolean) => void;
}

const ReelViewer: React.FC<ReelViewerProps> = ({
  reel,
  isOpen,
  onClose,
  onNavigate,
  onReelUpdate,
  onReelDelete,
  onReelLike,
  onReelSave,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(reel.isLiked || false);
  const [isSaved, setIsSaved] = useState(reel.isSaved || false);
  const [likeCount, setLikeCount] = useState(reel.likeCount || 0);
  const [commentCount, setCommentCount] = useState(reel.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<IComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<IComment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingReplyData, setEditingReplyData] = useState<{ commentId: string; replyId: string } | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isLikingReel, setIsLikingReel] = useState(false);
  const [localReelIsLiked, setLocalReelIsLiked] = useState(reel.isLiked || false);
  const [localReelLikeCount, setLocalReelLikeCount] = useState(reel.likeCount || 0);
  const [isEditingReel, setIsEditingReel] = useState(false);
  const [editReelContent, setEditReelContent] = useState(reel.content || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = useSelector((state: RootState) => state.UserReducer.user);
  const navigate = useNavigate();
  const isOwner = user?.id === reel.userId;

  // Update local state when reel prop changes
  useEffect(() => {
    setLocalReelIsLiked(reel.isLiked || false);
    setLocalReelLikeCount(reel.likeCount || 0);
    setIsSaved(reel.isSaved || false);
    setCommentCount(reel.commentCount || 0);
    setEditReelContent(reel.content || '');
  }, [reel]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Video controls
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await getCommentsApi(reel.id, 'reel');
      const processedComments = response.data.map((comment: any) => ({
        ...comment,
        replyCount: comment.replies?.length || 0
      }));
      setComments(processedComments);
      setCommentCount(processedComments.length);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleLikeToggle = async () => {
    if (isLikingReel) return;
    
    setIsLikingReel(true);
    const previousLiked = localReelIsLiked;
    const previousLikeCount = localReelLikeCount;
    const newIsLiked = !previousLiked;
    const newLikeCount = newIsLiked ? previousLikeCount + 1 : previousLikeCount - 1;
    
    setLocalReelIsLiked(newIsLiked);
    setLocalReelLikeCount(newLikeCount);
    
    try {
      const response = await toggleLikeApi(reel.id, 'reel');
      const finalIsLiked = response.data.liked;
      const finalLikeCount = response.data.totalLikes;
      
      setLocalReelIsLiked(finalIsLiked);
      setLocalReelLikeCount(finalLikeCount);
      
      // Notify parent component
      if (onReelLike) {
        onReelLike(reel.id, finalIsLiked, finalLikeCount);
      }
      
      if (finalIsLiked) {
        toast.success('Liked!', { icon: '❤️', duration: 1500 });
      }
    } catch (error) {
      setLocalReelIsLiked(previousLiked);
      setLocalReelLikeCount(previousLikeCount);
      toast.error('Failed to like');
    } finally {
      setIsLikingReel(false);
    }
  };

  const handleSaveToggle = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    const previousSaved = isSaved;
    const newSavedState = !previousSaved;
    setIsSaved(newSavedState);
    
    try {
      const response = await toggleSaveApi(reel.id, 'reel', previousSaved);
      const newIsSaved = response.data.saved;
      
      if (newIsSaved !== newSavedState) {
        setIsSaved(newIsSaved);
      }
      
      // Notify parent component
      if (onReelSave) {
        onReelSave(reel.id, newIsSaved);
      }
      
      toast.success(newIsSaved ? 'Saved to collection' : 'Removed from saved');
    } catch (error) {
      setIsSaved(previousSaved);
      toast.error('Failed to update save status');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const link = `${window.location.origin}/reel/${reel.id}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleProfileClick = () => {
    navigate(`/profile/${reel.username}`);
    onClose();
  };

  const handleUpdateReel = async () => {
    if (!editReelContent.trim() || editReelContent === reel.content) {
      setIsEditingReel(false);
      return;
    }
    
    try {
      const response = await updateReelApi(reel.id, editReelContent);
      if (response.data.success) {
        toast.success('Reel updated successfully');
        setIsEditingReel(false);
        
        // Notify parent component
        if (onReelUpdate) {
          onReelUpdate(reel.id, editReelContent);
        }
      }
    } catch (error) {
      toast.error('Failed to update reel');
    }
  };

  const handleDeleteReel = async () => {
    if (!confirm('Are you sure you want to delete this reel?')) return;
    
    setIsDeleting(true);
    try {
      const response = await deleteReelApi(reel.id);
      if (response.data.success) {
        toast.success('Reel deleted successfully');
        
        // Notify parent component
        if (onReelDelete) {
          onReelDelete(reel.id);
        }
        
        onClose();
      }
    } catch (error) {
      toast.error('Failed to delete reel');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentInput.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await postCommentApi(
        reel.id,
        'reel',
        commentInput,
        replyingTo?.id || undefined
      );
      
      if (replyingTo) {
        const newReply: IReply = {
          id: response.data.id,
          userId: user?.id || '',
          username: user?.username || '',
          profileImage: user?.profileImage,
          content: commentInput,
          createdAt: new Date(),
          likesCount: 0,
          isLiked: false,
          isDeleted: false
        };
        
        setComments(prev => prev.map(comment => 
          comment.id === replyingTo.id
            ? { 
                ...comment, 
                replies: [...(comment.replies || []), newReply],
                replyCount: (comment.replyCount || 0) + 1
              }
            : comment
        ));
        toast.success('Reply posted!');
      } else {
        const newCommentData: IComment = {
          id: response.data.id,
          userId: user?.id || '',
          username: user?.username || '',
          profileImage: user?.profileImage,
          content: commentInput,
          createdAt: new Date(),
          likesCount: 0,
          isLiked: false,
          isDeleted: false,
          replies: [],
          replyCount: 0
        };
        setComments(prev => [newCommentData, ...prev]);
        setCommentCount(prev => prev + 1);
        toast.success('Comment posted!');
      }
      
      setCommentInput('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
      
      if (replyInputRef.current) {
        replyInputRef.current.focus();
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    try {
      const response = await likeCommentApi(commentId, reel.id, 'reel');
      const newIsLiked = response.data.liked;
      const newLikesCount = response.data.totalLikes;
      
      if (isReply && parentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies?.map(reply =>
                  reply.id === commentId
                    ? {
                        ...reply,
                        isLiked: newIsLiked,
                        likesCount: newLikesCount
                      }
                    : reply
                )
              }
            : comment
        ));
      } else {
        setComments(prev => prev.map(comment => 
          comment.id === commentId
            ? {
                ...comment,
                isLiked: newIsLiked,
                likesCount: newLikesCount
              }
            : comment
        ));
      }
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  const handleDeleteComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      await deleteCommentApi(commentId, reel.id, 'reel');
      
      if (isReply && parentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies?.filter(reply => reply.id !== commentId),
                replyCount: (comment.replyCount || 1) - 1
              }
            : comment
        ));
        toast.success('Reply deleted');
      } else {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        setCommentCount(prev => prev - 1);
        toast.success('Comment deleted');
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleEditComment = async (
    commentId: string, 
    newContent: string, 
    isReply: boolean = false, 
    parentId?: string
  ) => {
    try {
      await editCommentApi(commentId, reel.id, 'reel', newContent);
      
      if (isReply && parentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies?.map(reply =>
                  reply.id === commentId
                    ? { ...reply, content: newContent }
                    : reply
                )
              }
            : comment
        ));
        toast.success('Reply updated');
      } else {
        setComments(prev => prev.map(comment => 
          comment.id === commentId
            ? { ...comment, content: newContent }
            : comment
        ));
        toast.success('Comment updated');
      }
      
      setEditingCommentId(null);
      setEditingReplyData(null);
      setEditContent('');
    } catch (error) {
      toast.error('Failed to update comment');
      console.error('Error editing comment:', error);
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleEmojiSelect = (emoji: any) => {
    setCommentInput(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (date: Date): string => {
    return moment(date).fromNow();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-black rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={reel.profileImage}
                alt={reel.username}
                size="md"
              />
              <div>
                <h3 className="font-bold text-white">
                  {reel.username}
                </h3>
                <p className="text-xs text-gray-400">
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaEllipsisH className="w-5 h-5" />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => {
                            setIsEditingReel(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <FaEdit className="w-4 h-4" />
                          Edit Reel
                        </button>
                        <button
                          onClick={handleDeleteReel}
                          disabled={isDeleting}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <FaTrash className="w-4 h-4" />
                          {isDeleting ? 'Deleting...' : 'Delete Reel'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleShare}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <FaShare className="w-4 h-4" />
                        Copy Link
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Edit Reel Modal */}
          {isEditingReel && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Edit Reel Caption</h3>
                <textarea
                  value={editReelContent}
                  onChange={(e) => setEditReelContent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setIsEditingReel(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateReel}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Video Preview */}
            <div className="w-full md:w-3/5 bg-black flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={reel.mediaUrl}
                  className="w-full h-full object-contain"
                  loop
                  muted={isMuted}
                  autoPlay
                  onClick={handlePlayPause}
                />
                
                {/* Video Controls */}
                <div className="absolute bottom-4 right-4">
                  <button
                    onClick={handleMuteToggle}
                    className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    {isMuted ? (
                      <FaVolumeMute className="w-5 h-5 text-white" />
                    ) : (
                      <FaVolumeUp className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

                {/* Play/Pause Overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={handlePlayPause}
                      className="p-4 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <FaPlay className="w-8 h-8 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
              {/* User Info and Caption */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar
                    src={reel.profileImage}
                    alt={reel.username}
                    size="sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {reel.username}
                      </span>
                      <button
                        onClick={handleProfileClick}
                        className="text-xs text-blue-500 hover:text-blue-600"
                      >
                        View profile
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaMusic className="w-3 h-3" />
                      <span>Original audio</span>
                    </div>
                  </div>
                </div>
                
                {reel.content && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {reel.content}
                  </p>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center gap-6 pt-2">
                  <button
                    onClick={handleLikeToggle}
                    disabled={isLikingReel}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    {localReelIsLiked ? (
                      <FaHeart className="w-5 h-5 text-red-500" />
                    ) : (
                      <FaRegHeart className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">{formatNumber(localReelLikeCount)}</span>
                  </button>
                  
                  <button
                    onClick={handleSaveToggle}
                    disabled={isSaving}
                    className="flex items-center gap-2 text-gray-500 hover:text-yellow-500 transition-colors"
                  >
                    {isSaved ? (
                      <FaBookmark className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <FaRegBookmark className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">Save</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors"
                  >
                    <FaShare className="w-5 h-5" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingComments ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <FaComment className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No comments yet</p>
                    <p className="text-sm">Be the first to start the conversation!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="group">
                      {/* Main Comment */}
                      <div className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <UserAvatar
                          src={comment.profileImage}
                          alt={comment.username}
                          size="sm"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {comment.username}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {formatTime(comment.createdAt)}
                              </span>
                            </div>
                            
                            <div className="relative">
                              <button
                                onClick={() => setActiveMenu(activeMenu === comment.id ? null : comment.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <FaEllipsisH className="w-4 h-4" />
                              </button>
                              
                              {activeMenu === comment.id && (
                                <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                  <button
                                    onClick={() => {
                                      setReplyingTo(comment);
                                      setActiveMenu(null);
                                      setTimeout(() => replyInputRef.current?.focus(), 100);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                  >
                                    <FaReply className="w-3 h-3" />
                                    Reply
                                  </button>
                                  {comment.userId === user?.id && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(comment.id);
                                          setEditContent(comment.content);
                                          setEditingReplyData(null);
                                          setActiveMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                      >
                                        <FaEdit className="w-3 h-3" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                      >
                                        <FaTrash className="w-3 h-3" />
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {editingCommentId === comment.id && !editingReplyData ? (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') handleEditComment(comment.id, editContent);
                                  if (e.key === 'Escape') {
                                    setEditingCommentId(null);
                                    setEditContent('');
                                  }
                                }}
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleEditComment(comment.id, editContent)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditContent('');
                                  }}
                                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-1 text-gray-700 dark:text-gray-300 break-words">
                              {comment.content}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2">
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            >
                              {comment.isLiked ? (
                                <FaHeart className="w-3 h-3 text-red-500" />
                              ) : (
                                <FaRegHeart className="w-3 h-3" />
                              )}
                              <span>{formatNumber(comment.likesCount)}</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                setReplyingTo(comment);
                                setTimeout(() => replyInputRef.current?.focus(), 100);
                              }}
                              className="text-sm text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            >
                              Reply
                            </button>
                            
                            {comment.replyCount && comment.replyCount > 0 && (
                              <button
                                onClick={() => toggleReplies(comment.id)}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                              >
                                {showReplies.has(comment.id) ? (
                                  <FaChevronUp className="w-3 h-3" />
                                ) : (
                                  <FaChevronDown className="w-3 h-3" />
                                )}
                                {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Replies Section */}
                      <AnimatePresence>
                        {showReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-12 mt-2 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4"
                          >
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-2 group">
                                <UserAvatar
                                  src={reply.profileImage}
                                  alt={reply.username}
                                  size="xs"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {reply.username}
                                      </span>
                                      <span className="text-xs text-gray-500 ml-2">
                                        {formatTime(reply.createdAt)}
                                      </span>
                                    </div>
                                    
                                    {reply.userId === user?.id && (
                                      <div className="relative">
                                        <button
                                          onClick={() => setActiveMenu(activeMenu === reply.id ? null : reply.id)}
                                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                          <FaEllipsisH className="w-3 h-3" />
                                        </button>
                                        
                                        {activeMenu === reply.id && (
                                          <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                            <button
                                              onClick={() => {
                                                setEditingReplyData({
                                                  commentId: comment.id,
                                                  replyId: reply.id
                                                });
                                                setEditContent(reply.content);
                                                setActiveMenu(null);
                                              }}
                                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                            >
                                              <FaEdit className="w-3 h-3" />
                                              Edit
                                            </button>
                                            <button
                                              onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                            >
                                              <FaTrash className="w-3 h-3" />
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {editingReplyData?.replyId === reply.id && editingReplyData?.commentId === comment.id ? (
                                    <div className="mt-1">
                                      <input
                                        type="text"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        autoFocus
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            handleEditComment(reply.id, editContent, true, comment.id);
                                          }
                                          if (e.key === 'Escape') {
                                            setEditingReplyData(null);
                                            setEditContent('');
                                          }
                                        }}
                                      />
                                      <div className="flex gap-2 mt-2">
                                        <button
                                          onClick={() => handleEditComment(reply.id, editContent, true, comment.id)}
                                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingReplyData(null);
                                            setEditContent('');
                                          }}
                                          className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                      {reply.content}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-3 mt-1">
                                    <button
                                      onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
                                    >
                                      {reply.isLiked ? (
                                        <FaHeart className="w-2.5 h-2.5 text-red-500" />
                                      ) : (
                                        <FaRegHeart className="w-2.5 h-2.5" />
                                      )}
                                      <span>{formatNumber(reply.likesCount)}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Comment Input */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
                {replyingTo && (
                  <div className="flex items-center justify-between mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaReply className="w-3 h-3 text-blue-500" />
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        Replying to @{replyingTo.username}
                      </span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={replyingTo ? replyInputRef : inputRef}
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Add a comment..."}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      disabled={isLoading}
                    />
                    
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <FaSmile className="w-5 h-5" />
                    </button>
                    
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 bottom-full mb-2 z-10"
                        >
                          <EmojiPicker onEmojiClick={handleEmojiSelect} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentInput.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaPaperPlane className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReelViewer;