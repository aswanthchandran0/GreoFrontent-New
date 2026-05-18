// src/components/reel/ReelScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaShare, 
  FaBookmark, 
  FaRegBookmark,
  FaVolumeUp,
  FaVolumeMute,
  FaMusic,
  FaEllipsisH,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSmile,
  FaPaperPlane,
  FaReply,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import EmojiPicker from 'emoji-picker-react';
import moment from 'moment';

import { RootState } from '../redux/store';
import { 
  getAllReelsApi, 
  toggleLikeApi, 
  toggleSaveApi,
  postCommentApi,
  getCommentsApi,
  deleteCommentApi,
  likeCommentApi,
  editCommentApi,
  updateReelApi,
  deleteReelApi
} from '../services/user/api';
import { LoaderSpinner } from '../components/ui/LoadingSpinner';
import UserAvatar from '../components/ui/UserAvatar';

interface IReel {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  thumbnail: string;
  mediaUrl: string;
  content?: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: Date;
}

interface IComment {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  isLiked: boolean;
  replyCount: number;
  replies: IReply[];
}

interface IReply {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  content: string;
  createdAt: Date;
  likesCount: number;
  isLiked: boolean;
}

const ReelScreen: React.FC = () => {
  const [reels, setReels] = useState<IReel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState<IComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<IComment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isEditingReel, setIsEditingReel] = useState(false);
  const [editReelContent, setEditReelContent] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const loggedInUser = useSelector((state: RootState) => state.UserReducer.user);

  const currentReel = reels[currentIndex];
  const isOwner = loggedInUser?.id === currentReel?.userId;

  // Fetch reels
  const fetchReels = useCallback(async () => {
    if (!hasMore) return;
    
    try {
      const response = await getAllReelsApi(page, 5);
      const newReels = response.data.data || [];
      
      if (newReels.length === 0) {
        setHasMore(false);
      } else {
        setReels(prev => [...prev, ...newReels]);
        setPage(prev => prev + 1);
        setHasMore(newReels.length === 5);
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
      toast.error('Failed to load reels');
    } finally {
      setLoading(false);
    }
  }, [page, hasMore]);

  useEffect(() => {
    fetchReels();
  }, []);

  // Setup intersection observer for video playback
  useEffect(() => {
    if (reels.length === 0) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const index = parseInt(video.dataset.index || '0');
          
          if (entry.isIntersecting) {
            video.play().catch(err => console.log('Autoplay prevented:', err));
            videoRefs.current.forEach((otherVideo, i) => {
              if (otherVideo && i !== index) otherVideo.pause();
            });
            setCurrentIndex(index);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );
    
    videoRefs.current.forEach((video) => {
      if (video) observerRef.current?.observe(video);
    });
    
    return () => observerRef.current?.disconnect();
  }, [reels.length]);

  // Load more reels when approaching the end
  useEffect(() => {
    if (currentIndex >= reels.length - 2 && hasMore && !loading) {
      fetchReels();
    }
  }, [currentIndex, reels.length, hasMore, loading, fetchReels]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const itemHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, reels.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!containerRef.current || showCommentsModal) return;
    const scrollAmount = window.innerHeight;
    const currentScroll = containerRef.current.scrollTop;
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      containerRef.current.scrollTo({ top: currentScroll + scrollAmount, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      containerRef.current.scrollTo({ top: currentScroll - scrollAmount, behavior: 'smooth' });
    } else if (e.key === 'Escape') {
      if (showCommentsModal) {
        setShowCommentsModal(false);
      } else {
        navigate(-1);
      }
    }
  }, [navigate, showCommentsModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Fetch comments for current reel
  const fetchComments = async (reelId: string) => {
    setIsLoadingComments(true);
    try {
      const response = await getCommentsApi(reelId, 'reel');
      const processedComments = response.data.map((comment: any) => ({
        ...comment,
        replyCount: comment.replies?.length || 0
      }));
      setComments(processedComments);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setIsLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showCommentsModal && currentReel) {
      fetchComments(currentReel.id);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showCommentsModal, currentReel]);

  useEffect(() => {
    if (comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  // Handle like
  const handleLike = async (reelId: string, index: number) => {
    const reel = reels[index];
    const previousLiked = reel.isLiked;
    const previousLikeCount = reel.likeCount;
    
    setReels(prev => prev.map((r, i) => 
      i === index 
        ? { ...r, isLiked: !previousLiked, likeCount: previousLiked ? previousLikeCount - 1 : previousLikeCount + 1 }
        : r
    ));
    
    try {
      const response = await toggleLikeApi(reelId, 'reel');
      setReels(prev => prev.map((r, i) => 
        i === index ? { ...r, isLiked: response.data.liked, likeCount: response.data.totalLikes } : r
      ));
    } catch (error) {
      setReels(prev => prev.map((r, i) => 
        i === index ? { ...r, isLiked: previousLiked, likeCount: previousLikeCount } : r
      ));
      toast.error('Failed to like');
    }
  };

  // Handle save
  const handleSave = async (reelId: string, index: number) => {
    const reel = reels[index];
    const previousSaved = reel.isSaved;
    
    setReels(prev => prev.map((r, i) => i === index ? { ...r, isSaved: !previousSaved } : r));
    
    try {
      const response = await toggleSaveApi(reelId, 'reel', previousSaved);
      setReels(prev => prev.map((r, i) => i === index ? { ...r, isSaved: response.data.saved } : r));
      toast.success(response.data.saved ? 'Saved to collection' : 'Removed from saved');
    } catch (error) {
      setReels(prev => prev.map((r, i) => i === index ? { ...r, isSaved: previousSaved } : r));
      toast.error('Failed to save');
    }
  };

  // Handle share
  const handleShare = async (reel: IReel) => {
    try {
      const link = `${window.location.origin}/reel/${reel.id}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  // Handle update reel
  const handleUpdateReel = async () => {
    if (!editReelContent.trim() || editReelContent === currentReel?.content) {
      setIsEditingReel(false);
      return;
    }
    
    try {
      const response = await updateReelApi(currentReel.id, editReelContent);
      if (response.data.success) {
        setReels(prev => prev.map((r, i) => 
          i === currentIndex ? { ...r, content: editReelContent } : r
        ));
        toast.success('Reel updated successfully');
        setIsEditingReel(false);
      }
    } catch (error) {
      toast.error('Failed to update reel');
    }
  };

  // Handle delete reel
  const handleDeleteReel = async () => {
    if (!confirm('Are you sure you want to delete this reel?')) return;
    
    setIsDeleting(true);
    try {
      const response = await deleteReelApi(currentReel.id);
      if (response.data.success) {
        toast.success('Reel deleted successfully');
        setReels(prev => prev.filter((_, i) => i !== currentIndex));
        if (currentIndex >= reels.length - 1) {
          setCurrentIndex(Math.max(0, currentIndex - 1));
        }
        setShowMenu(false);
      }
    } catch (error) {
      toast.error('Failed to delete reel');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle submit comment
  const handleSubmitComment = async () => {
    if (!commentInput.trim() || !currentReel) return;

    try {
      const response = await postCommentApi(
        currentReel.id,
        'reel',
        commentInput,
        replyingTo?.id || undefined
      );
      
      if (replyingTo) {
        const newReply: IReply = {
          id: response.data.id,
          userId: loggedInUser?.id || '',
          username: loggedInUser?.username || '',
          profileImage: loggedInUser?.profileImage,
          content: commentInput,
          createdAt: new Date(),
          likesCount: 0,
          isLiked: false
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
        const newComment: IComment = {
          id: response.data.id,
          userId: loggedInUser?.id || '',
          username: loggedInUser?.username || '',
          profileImage: loggedInUser?.profileImage,
          content: commentInput,
          createdAt: new Date(),
          likesCount: 0,
          isLiked: false,
          replyCount: 0,
          replies: []
        };
        setComments(prev => [newComment, ...prev]);
        setReels(prev => prev.map((r, i) => 
          i === currentIndex ? { ...r, commentCount: r.commentCount + 1 } : r
        ));
        toast.success('Comment posted!');
      }
      
      setCommentInput('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  // Handle like comment
  const handleLikeComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!currentReel) return;
    
    try {
      const response = await likeCommentApi(commentId, currentReel.id, 'reel');
      const newIsLiked = response.data.liked;
      const newLikesCount = response.data.totalLikes;
      
      if (isReply && parentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies?.map(reply =>
                  reply.id === commentId
                    ? { ...reply, isLiked: newIsLiked, likesCount: newLikesCount }
                    : reply
                )
              }
            : comment
        ));
      } else {
        setComments(prev => prev.map(comment => 
          comment.id === commentId
            ? { ...comment, isLiked: newIsLiked, likesCount: newLikesCount }
            : comment
        ));
      }
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!confirm('Delete this comment?')) return;
    if (!currentReel) return;
    
    try {
      await deleteCommentApi(commentId, currentReel.id, 'reel');
      
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
        setReels(prev => prev.map((r, i) => 
          i === currentIndex ? { ...r, commentCount: Math.max(0, r.commentCount - 1) } : r
        ));
        toast.success('Comment deleted');
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId: string, newContent: string, isReply: boolean = false, parentId?: string) => {
    if (!currentReel) return;
    
    try {
      await editCommentApi(commentId, currentReel.id, 'reel', newContent);
      
      if (isReply && parentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentId
            ? {
                ...comment,
                replies: comment.replies?.map(reply =>
                  reply.id === commentId ? { ...reply, content: newContent } : reply
                )
              }
            : comment
        ));
      } else {
        setComments(prev => prev.map(comment => 
          comment.id === commentId ? { ...comment, content: newContent } : comment
        ));
      }
      
      setEditingCommentId(null);
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) newSet.delete(commentId);
      else newSet.add(commentId);
      return newSet;
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (date: Date): string => moment(date).fromNow();

  if (loading && reels.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <LoaderSpinner loading={true} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
            <FaArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Reels</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Reels Container */}
      <div ref={containerRef} onScroll={handleScroll} className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth" style={{ scrollSnapType: 'y mandatory' }}>
        {reels.map((reel, index) => (
          <div key={reel.id} className="relative h-screen w-full snap-start snap-always bg-black">
            <video
              ref={el => videoRefs.current[index] = el}
              data-index={index}
              src={reel.mediaUrl}
              className="absolute inset-0 w-full h-full object-contain"
              loop
              muted={!isAudioOn}
              playsInline
              autoPlay={index === 0}
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
            
            {/* Audio Toggle */}
            <button
              onClick={() => setIsAudioOn(!isAudioOn)}
              className="absolute bottom-24 right-4 z-10 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors pointer-events-auto"
            >
              {isAudioOn ? <FaVolumeUp className="w-5 h-5 text-white" /> : <FaVolumeMute className="w-5 h-5 text-white" />}
            </button>
            
            {/* Menu Button */}
            <button
              onClick={() => {
                setSelectedReelId(reel.id);
                setShowMenu(true);
              }}
              className="absolute bottom-24 right-16 z-10 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors pointer-events-auto"
            >
              <FaEllipsisH className="w-5 h-5 text-white" />
            </button>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-24 bg-gradient-to-t from-black via-black/60 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <UserAvatar src={reel.profileImage} alt={reel.username} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{reel.username}</span>
                    <button onClick={() => navigate(`/profile/${reel.username}`)} className="text-xs text-blue-400 hover:text-blue-300">
                      Follow
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <FaMusic className="w-3 h-3" />
                    <span>Original audio</span>
                  </div>
                </div>
              </div>
              {reel.content && <p className="text-white text-sm mb-3">{reel.content}</p>}
              <p className="text-gray-400 text-xs">{new Date(reel.createdAt).toLocaleDateString()}</p>
            </div>
            
            {/* Right Side Actions */}
            <div className="absolute bottom-32 right-4 flex flex-col items-center gap-6 z-10">
              <button onClick={() => handleLike(reel.id, index)} className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-black/50 rounded-full group-hover:bg-black/70 transition-colors">
                  {reel.isLiked ? <IoMdHeart className="w-7 h-7 text-red-500" /> : <IoMdHeartEmpty className="w-7 h-7 text-white" />}
                </div>
                <span className="text-white text-xs font-medium">{formatNumber(reel.likeCount)}</span>
              </button>
              
              <button onClick={() => setShowCommentsModal(true)} className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-black/50 rounded-full group-hover:bg-black/70 transition-colors">
                  <FaComment className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-xs font-medium">{formatNumber(reel.commentCount)}</span>
              </button>
              
              <button onClick={() => handleSave(reel.id, index)} className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-black/50 rounded-full group-hover:bg-black/70 transition-colors">
                  {reel.isSaved ? <FaBookmark className="w-7 h-7 text-yellow-500" /> : <FaRegBookmark className="w-7 h-7 text-white" />}
                </div>
                <span className="text-white text-xs font-medium">Save</span>
              </button>
              
              <button onClick={() => handleShare(reel)} className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-black/50 rounded-full group-hover:bg-black/70 transition-colors">
                  <FaShare className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-xs font-medium">Share</span>
              </button>
            </div>
          </div>
        ))}
        
        {loading && reels.length > 0 && (
          <div className="h-20 flex items-center justify-center bg-black">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Menu Modal */}
      <AnimatePresence>
        {showMenu && selectedReelId === currentReel?.id && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowMenu(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white">Options</h3>
              </div>
              <div className="py-2">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setEditReelContent(currentReel?.content || '');
                        setIsEditingReel(true);
                      }}
                      className="flex items-center w-full gap-3 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span className="font-medium">Edit Reel</span>
                    </button>
                    <button
                      onClick={handleDeleteReel}
                      disabled={isDeleting}
                      className="flex items-center w-full gap-3 px-6 py-4 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                      <span className="font-medium">{isDeleting ? 'Deleting...' : 'Delete Reel'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      toast.success('Reported');
                    }}
                    className="flex items-center w-full gap-3 px-6 py-4 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FaEllipsisH className="w-4 h-4" />
                    <span className="font-medium">Report</span>
                  </button>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => setShowMenu(false)} className="w-full py-3 font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Reel Modal */}
      <AnimatePresence>
        {isEditingReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold mb-4">Edit Reel Caption</h3>
              <textarea
                value={editReelContent}
                onChange={(e) => setEditReelContent(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setIsEditingReel(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                  Cancel
                </button>
                <button onClick={handleUpdateReel} className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comments Modal */}
      <AnimatePresence>
        {showCommentsModal && currentReel && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowCommentsModal(false)}>
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-2xl h-[80vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <UserAvatar src={currentReel.profileImage} alt={currentReel.username} size="sm" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{currentReel.username}</h3>
                    <p className="text-xs text-gray-500">Comments</p>
                  </div>
                </div>
                <button onClick={() => setShowCommentsModal(false)} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoadingComments ? (
                  <div className="flex items-center justify-center h-full">
                    <LoaderSpinner loading={true} />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FaComment className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No comments yet</p>
                    <p className="text-sm">Be the first to start the conversation!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="group">
                      <div className="flex gap-3">
                        <UserAvatar src={comment.profileImage} alt={comment.username} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-white">{comment.username}</span>
                              <span className="text-xs text-gray-500 ml-2">{formatTime(comment.createdAt)}</span>
                            </div>
                            <div className="relative">
                              <button onClick={() => setActiveMenu(activeMenu === comment.id ? null : comment.id)} className="p-1 text-gray-400 hover:text-gray-600">
                                <FaEllipsisH className="w-4 h-4" />
                              </button>
                              {activeMenu === comment.id && (
                                <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-10">
                                  <button onClick={() => { setReplyingTo(comment); setActiveMenu(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                    <FaReply className="w-3 h-3" /> Reply
                                  </button>
                                  {comment.userId === loggedInUser?.id && (
                                    <>
                                      <button onClick={() => { setEditingCommentId(comment.id); setEditContent(comment.content); setActiveMenu(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                        <FaEdit className="w-3 h-3" /> Edit
                                      </button>
                                      <button onClick={() => handleDeleteComment(comment.id)} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                        <FaTrash className="w-3 h-3" /> Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {editingCommentId === comment.id ? (
                            <div className="mt-2">
                              <input type="text" value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg" autoFocus onKeyPress={(e) => { if (e.key === 'Enter') handleEditComment(comment.id, editContent); if (e.key === 'Escape') setEditingCommentId(null); }} />
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => handleEditComment(comment.id, editContent)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">Save</button>
                                <button onClick={() => setEditingCommentId(null)} className="px-3 py-1 text-sm bg-gray-200 rounded-lg">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.content}</p>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2">
                            <button onClick={() => handleLikeComment(comment.id)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500">
                              {comment.isLiked ? <FaHeart className="w-3 h-3 text-red-500" /> : <FaRegHeart className="w-3 h-3" />}
                              <span>{formatNumber(comment.likesCount)}</span>
                            </button>
                            <button onClick={() => setReplyingTo(comment)} className="text-sm text-gray-500 hover:text-blue-500">Reply</button>
                            {comment.replyCount > 0 && (
                              <button onClick={() => toggleReplies(comment.id)} className="text-sm text-gray-500 flex items-center gap-1">
                                {showReplies.has(comment.id) ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                                {comment.replyCount} replies
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      <AnimatePresence>
                        {showReplies.has(comment.id) && comment.replies?.map((reply) => (
                          <div key={reply.id} className="ml-12 mt-3 border-l-2 border-gray-200 pl-4">
                            <div className="flex gap-2">
                              <UserAvatar src={reply.profileImage} alt={reply.username} size="xs" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{reply.username}</span>
                                  <span className="text-xs text-gray-500">{formatTime(reply.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{reply.content}</p>
                                <button onClick={() => handleLikeComment(reply.id, true, comment.id)} className="flex items-center gap-1 text-xs text-gray-500 mt-1 hover:text-red-500">
                                  {reply.isLiked ? <FaHeart className="w-2.5 h-2.5 text-red-500" /> : <FaRegHeart className="w-2.5 h-2.5" />}
                                  <span>{formatNumber(reply.likesCount)}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ))
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Comment Input */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
                {replyingTo && (
                  <div className="flex items-center justify-between mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaReply className="w-3 h-3 text-blue-500" />
                      <span className="text-sm text-blue-600">Replying to @{replyingTo.username}</span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-sm text-gray-500">Cancel</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input ref={replyingTo ? replyInputRef : inputRef} type="text" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()} placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Add a comment..."} className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <FaSmile className="w-5 h-5" />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute right-0 bottom-full mb-2 z-10">
                        <EmojiPicker onEmojiClick={(emoji) => { setCommentInput(prev => prev + emoji.emoji); setShowEmojiPicker(false); }} />
                      </div>
                    )}
                  </div>
                  <button onClick={handleSubmitComment} disabled={!commentInput.trim()} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:opacity-90 disabled:opacity-50">
                    <FaPaperPlane className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReelScreen;