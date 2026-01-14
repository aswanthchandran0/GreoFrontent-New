// components/userComponents/CommentsModal.tsx
import { useState, useEffect, useRef } from 'react';
import { FaRegComment } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import { IComment } from '../../../Types/commentTypes';
import Comment from '../post/Comment';
import { getCommentsApi, postCommentApi } from '../../../services/user/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { DEFAULT_PROFILE_IMAGE } from '../../../assets/images';
import toast from 'react-hot-toast';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'post' | 'reel' | 'comment';
  entityOwner: {
    username: string;
    profileImage?: string;
  };
  initialCommentsCount: number;
  onCommentAdded?: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  entityId,
  entityType,
  entityOwner,
  initialCommentsCount,
  onCommentAdded
}) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [commentsCount, setCommentsCount] = useState<number>(initialCommentsCount);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  
  const loggedUser = useSelector((state: RootState) => state.UserReducer.user);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch comments
  const fetchComments = async (page = 1) => {
    if (!entityId) return;
    
    try {
      setLoadingComments(true);
      const response = await getCommentsApi(entityId, entityType);
      const commentsArray: IComment[] = Array.isArray(response.data)
        ? response.data
        : [response.data];
      
      if (page === 1) {
        setComments(commentsArray);
      } else {
        setComments(prev => [...prev, ...commentsArray]);
      }
      
      setHasMoreComments(commentsArray.length === 20);
      setCommentPage(page);
    } catch (err) {
      console.log('Error fetching comments:', err);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isOpen && entityId) {
      fetchComments(1);
    }
  }, [isOpen, entityId]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setComments([]);
      setComment("");
      setCommentPage(1);
      setHasMoreComments(true);
    }
  }, [isOpen]);

  // Handle infinite scroll
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || loadingComments || !hasMoreComments) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      fetchComments(commentPage + 1);
    }
  };

  // Post comment
  const handleCommentPost = async () => {
    if (!comment.trim() || !loggedUser) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const response = await postCommentApi(entityId, entityType, comment);
      
      // Add user details to comment
      const newComment = {
        ...response.data,
        profileImage: loggedUser.profileImage,
        username: loggedUser.username,
      };

      setComments(prev => [newComment, ...prev]);
      setComment('');
      setCommentsCount(prev => prev + 1);
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded();
      }
      
      toast.success('Comment posted');
    } catch (err) {
      console.log('Error posting comment:', err);
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentPost();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="absolute inset-0 md:inset-auto md:relative md:w-full md:max-w-md md:h-[70vh] md:mx-auto md:my-auto bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 overflow-hidden rounded-full flex-shrink-0">
              <img
                className="object-cover w-full h-full"
                src={entityOwner.profileImage || DEFAULT_PROFILE_IMAGE}
                alt={entityOwner.username}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                @{entityOwner.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {commentsCount} comment{commentsCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            aria-label="Close comments"
          >
            <IoClose className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Scrollable Comments Area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          {loadingComments && comments.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <ClipLoader size={40} color="#8b5cf6" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FaRegComment className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
                No comments yet
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
                Start the conversation by adding the first comment
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {comments.map((commentItem, index) => (
                <Comment key={`${commentItem.id}-${index}`} comment={commentItem} />
              ))}
              {loadingComments && (
                <div className="flex justify-center py-4">
                  <ClipLoader size={24} color="#8b5cf6" />
                </div>
              )}
              {!hasMoreComments && comments.length > 10 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  No more comments
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 overflow-hidden rounded-full flex-shrink-0">
                <img
                  src={loggedUser?.profileImage || DEFAULT_PROFILE_IMAGE}
                  alt="Your profile"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white placeholder-gray-500 text-sm"
                  disabled={loading}
                />
                {comment.trim() && (
                  <button
                    onClick={handleCommentPost}
                    disabled={loading || !comment.trim()}
                    className="px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {loading ? (
                      <ClipLoader size={16} color="white" />
                    ) : (
                      'Post'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;