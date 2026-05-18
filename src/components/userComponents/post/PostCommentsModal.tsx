// src/components/post/PostCommentsModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaHeart, 
  FaRegHeart, 
  FaPaperPlane, 
  FaSmile,
  FaReply,
  FaEllipsisH,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaFlag
} from 'react-icons/fa';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import { BsThreeDotsVertical } from 'react-icons/bs';

import toast from 'react-hot-toast';
import moment from 'moment';

// Services
import { 
  getCommentsApi, 
  postCommentApi, 
  deleteCommentApi,
  likeCommentApi,
  editCommentApi,
  toggleLikeApi
} from '../../../services/user/api';

// Types
import { IPost } from '../../../Types/postTypes';
import { IComment, IReply } from '../../../Types/commentTypes';
import { RootState } from '../../../redux/store';
import UserAvatar from '../../ui/UserAvatar';
import EmojiPicker from 'emoji-picker-react';
import PostMenu from './PostMenu';

interface PostCommentsModalProps {
  post: IPost;
  isOpen: boolean;
  onClose: () => void;
  onLikeChange: (isLiked: boolean, likeCount: number) => void;
  onCommentCountChange: (count: number) => void;
  onPostDelete?: (postId: string) => void;
  onPostUpdate?: (postId: string, content: string) => void;
}

const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  post,
  isOpen,
  onClose,
  onLikeChange,
  onCommentCountChange,
  onPostDelete,
  onPostUpdate
}) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<IComment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [isLikingPost, setIsLikingPost] = useState(false);
  const [localPostIsLiked, setLocalPostIsLiked] = useState(post.isLiked || false);
  const [localPostLikeCount, setLocalPostLikeCount] = useState(post.likeCount || 0);
  
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const loggedInUser = useSelector((state: RootState) => state.UserReducer.user);
  const isOwner = loggedInUser?.id === post.userId;

  // Update local state when post prop changes
  useEffect(() => {
    setLocalPostIsLiked(post.isLiked || false);
    setLocalPostLikeCount(post.likeCount || 0);
  }, [post.isLiked, post.likeCount]);

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

  const fetchComments = async () => {
    try {
      const response = await getCommentsApi(post.id, 'post');
      
      const processedComments = response.data.map((comment: any) => ({
        ...comment,
        replyCount: comment.replies?.length || 0
      }));
      
      console.log('Processed comments:', processedComments);
      setComments(processedComments);
      onCommentCountChange(processedComments.length);
    } catch (error) {
      toast.error('Failed to load comments');
      console.error('Error fetching comments:', error);
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle like on the post itself
  const handlePostLike = async () => {
    if (isLikingPost) return;
    
    setIsLikingPost(true);
    // Optimistic update
    const previousLiked = localPostIsLiked;
    const previousLikeCount = localPostLikeCount;
    setLocalPostIsLiked(!previousLiked);
    setLocalPostLikeCount(previousLiked ? previousLikeCount - 1 : previousLikeCount + 1);
    
    try {
      const response = await toggleLikeApi(post.id, 'post');
      const newIsLiked = response.data.liked;
      const newLikeCount = response.data.totalLikes;
      
      setLocalPostIsLiked(newIsLiked);
      setLocalPostLikeCount(newLikeCount);
      onLikeChange(newIsLiked, newLikeCount);
      
      if (newIsLiked) {
        toast.success('Liked!', { icon: '❤️', duration: 1500 });
      }
    } catch (error) {
      // Revert on error
      setLocalPostIsLiked(previousLiked);
      setLocalPostLikeCount(previousLikeCount);
      toast.error('Failed to like post');
      console.error('Error liking post:', error);
    } finally {
      setIsLikingPost(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || loading) return;

    setLoading(true);
    try {
      const response = await postCommentApi(
        post.id,
        'post',
        newComment,
        replyingTo?.id || undefined
      );
      
      if (replyingTo) {
        const newReply: IReply = {
          id: response.data.id,
          userId: loggedInUser?.id || '',
          username: loggedInUser?.username || '',
          profileImage: loggedInUser?.profileImage,
          content: newComment,
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
          userId: loggedInUser?.id || '',
          username: loggedInUser?.username || '',
          profileImage: loggedInUser?.profileImage,
          content: newComment,
          createdAt: new Date(),
          likesCount: 0,
          isLiked: false,
          isDeleted: false,
          replies: [],
          replyCount: 0
        };
        
        setComments(prev => [newCommentData, ...prev]);
        onCommentCountChange(comments.length + 1);
        toast.success('Comment posted!');
      }
      
      setNewComment('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
      
      if (replyInputRef.current) {
        replyInputRef.current.focus();
      }
    } catch (error) {
      toast.error('Failed to post comment');
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    try {
      const response = await likeCommentApi(commentId, post.id, 'post');
      
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
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const handleDeleteComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteCommentApi(commentId, post.id, 'post');
      
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
        onCommentCountChange(comments.length - 1);
        toast.success('Comment deleted');
      }
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = async (commentId: string, newContent: string, isReply: boolean = false, parentId?: string) => {
    try {
      const response = await editCommentApi(commentId, post.id, 'post', newContent);
      
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
      } else {
        setComments(prev => prev.map(comment => 
          comment.id === commentId
            ? { ...comment, content: newContent }
            : comment
        ));
      }
      
      setEditingCommentId(null);
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
      console.error('Error updating comment:', error);
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
    setNewComment(prev => prev + emoji.emoji);
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
          className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={post.profileImage}
                alt={post.username}
                size="md"
              />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {post.username}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsPostMenuOpen(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaEllipsisH className="w-5 h-5" />
                </button>
                
                {isPostMenuOpen && (
                  <PostMenu
                    postId={post.id}
                    postType="POST"
                    isOwner={isOwner}
                    onClose={() => setIsPostMenuOpen(false)}
                    onDelete={onPostDelete}
                    onUpdate={onPostUpdate}
                    postContent={post.content || ''}
                  />
                )}
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Post Preview */}
            <div className="md:w-2/5 border-r border-gray-100 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-800">
              <div className="relative h-full">
                {post.mediaUrls && post.mediaUrls[0] && (
                  <img
                    src={post.mediaUrls[0]}
                    alt="Post"
                    className="w-full h-full object-contain"
                  />
                )}
                
                {/* Post Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                  <p className="text-white text-sm">
                    <span className="font-semibold">{post.username}</span>
                    {post.content && ` ${post.content.substring(0, 100)}`}
                    {post.content && post.content.length > 100 && '...'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={handlePostLike}
                      disabled={isLikingPost}
                      className="flex items-center gap-1 text-white/80 hover:text-red-500 transition-colors"
                    >
                      {localPostIsLiked ? (
                        <IoMdHeart className="w-5 h-5 text-red-500" />
                      ) : (
                        <IoMdHeartEmpty className="w-5 h-5" />
                      )}
                      <span className="text-sm">{formatNumber(localPostLikeCount)}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <FaRegHeart className="w-8 h-8" />
                    </div>
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
                                  {comment.userId === loggedInUser?.id && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(comment.id);
                                          setEditContent(comment.content);
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
                          
                          {editingCommentId === comment.id ? (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') handleEditComment(comment.id, editContent);
                                  if (e.key === 'Escape') setEditingCommentId(null);
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
                                  onClick={() => setEditingCommentId(null)}
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
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {reply.username}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatTime(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                    {reply.content}
                                  </p>
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
                                    
                                    {reply.userId === loggedInUser?.id && (
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => {
                                            setEditingCommentId(reply.id);
                                            setEditContent(reply.content);
                                          }}
                                          className="text-xs text-gray-500 hover:text-yellow-500"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                          className="text-xs text-gray-500 hover:text-red-500"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
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
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Add a comment..."}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      disabled={loading}
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
                    disabled={!newComment.trim() || loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                  >
                    {loading ? (
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

export default PostCommentsModal;