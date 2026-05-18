// src/components/post/PostActions.tsx
import React from 'react';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaShare, 
  FaBookmark, 
  FaRegBookmark,
  FaPaperPlane
} from 'react-icons/fa';

interface PostActionsProps {
  isLiked: boolean;
  isSaved: boolean;
  likeCount: number;
  commentCount: number;
  onLike: () => void;
  onSave: () => void;
  onComment: () => void;
  onShare: () => void;
  compact?: boolean;
}

const PostActions: React.FC<PostActionsProps> = ({
  isLiked,
  isSaved,
  likeCount,
  commentCount,
  onLike,
  onSave,
  onComment,
  onShare,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onLike}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
        >
          {isLiked ? (
            <FaHeart className="w-4 h-4 text-red-500" />
          ) : (
            <FaRegHeart className="w-4 h-4" />
          )}
          <span className="text-sm">{likeCount}</span>
        </button>
        <button
          onClick={onComment}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
        >
          <FaComment className="w-4 h-4" />
          <span className="text-sm">{commentCount}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onLike}
            className="group"
          >
            {isLiked ? (
              <FaHeart className="w-6 h-6 text-red-500" />
            ) : (
              <FaRegHeart className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-red-500 transition-colors" />
            )}
          </button>
          <button
            onClick={onComment}
            className="group"
          >
            <FaComment className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
          </button>
          <button
            onClick={onShare}
            className="group"
          >
            <FaShare className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-green-500 transition-colors" />
          </button>
        </div>
        <button
          onClick={onSave}
          className="group"
        >
          {isSaved ? (
            <FaBookmark className="w-6 h-6 text-yellow-500" />
          ) : (
            <FaRegBookmark className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-yellow-500 transition-colors" />
          )}
        </button>
      </div>

      <div className="text-sm font-semibold text-gray-900 dark:text-white">
        {likeCount} likes
      </div>
    </div>
  );
};

export default PostActions;