import { FaRegHeart, FaHeart, FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { IoBookmark, IoBookmarkOutline, IoClose } from "react-icons/io5";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { BsThreeDots } from "react-icons/bs";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { IRoll } from '../profile/UserPosts';
import { IComment } from '../../../Types/commentTypes';
import { DEFAULT_PROFILE_IMAGE } from '../../../assets/images';
import { deleteSavedItemApi, getCommentsApi, postCommentApi, toggleLikeApi, saveItemApi } from '../../../services/user/api';
import { SavedItemArrayElement } from '../../../Types/savedItemTypes';
import { RootState } from '../../../redux/store';
import Comment from '../post/Comment';
import SharingOption from "../post/SharingOption";
import { ClipLoader } from "react-spinners";
import CommentsModal from "../comment/CommentsModal";

interface RollCardProps {
  roll: IRoll;
  isAudioOn: boolean;
  handleIsAudioOn: () => void;
  setRolls: React.Dispatch<React.SetStateAction<IRoll[]>>;
}

const RollCard: React.FC<RollCardProps> = ({ roll, isAudioOn, handleIsAudioOn, setRolls }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoInView, setIsVideoInview] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<IComment[]>([]);
  const [commentsCount, setCommentsCount] = useState<number>(roll.commentCount || 0);
  const [loading, setLoading] = useState<boolean>(false);
  const [localIsLiked, setLocalIsLiked] = useState<boolean>(roll.isLiked);
  const [likeCount, setLikeCount] = useState<number>(roll.likeCount || 0);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isRollMenuOpen, setIsRollMenuOpen] = useState<boolean>(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const loggedUser = useSelector((state: RootState) => state.UserReducer.user);
  const navigate = useNavigate();

  // Video intersection observer for autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVideoInview(entry.isIntersecting);
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play().catch(console.error);
          } else if (videoRef.current) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.8 } // Higher threshold for better visibility
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getCommentsApi(roll.id ?? "", "reel");
        const commentsArray: IComment[] = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setComments(commentsArray);
      } catch (err) {
        console.log('Error fetching comments:', err);
      }
    };
    fetchComments();
  }, [roll.id]);

  // Add new comment
  const handleAddComment = (newComment: IComment) => {
    setComments(prev => [newComment, ...prev]);
  };

  // Post comment
  const handleCommentPost = async () => {
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await postCommentApi(roll?.id ?? '', 'reel', comment);
      response.data.profileImage = loggedUser?.profileImage;
      response.data.username = loggedUser?.username;
      handleAddComment(response.data);
      setComment('');
      setCommentsCount(prev => prev + 1);
      toast.success('Comment posted');
    } catch (err) {
      console.log('Error posting comment:', err);
      toast.error('Failed to post comment');
    }
  };

  // Save roll
  const handleRollSaving = async (item: SavedItemArrayElement) => {
    try {
      const response = await saveItemApi(item);
      if (response.data == null) {
        toast("Already saved");
      } else {
        setRolls(prevRolls =>
          prevRolls.map(roll =>
            roll.id === item.itemId
              ? { ...roll, isSaved: true }
              : roll
          )
        );
        toast.success('Saved');
      }
    } catch (err) {
      console.log('Error saving roll:', err);
      toast.error("Something went wrong in saving reel");
    }
  };

  // Unsave roll
  const handleUnsaveRoll = async (itemId: string) => {
    try {
      const response = await deleteSavedItemApi(itemId, "roll");
      if (response.status === 200) {
        setRolls(prevRolls =>
          prevRolls.map(roll =>
            roll.id === itemId
              ? { ...roll, isSaved: false }
              : roll
          )
        );
        toast.success("Unsaved");
      }
    } catch (error) {
      console.error("Failed to unsave roll:", error);
      toast.error("Failed to unsave reel");
    }
  };

  // Like animation
  const triggerLikeAnimation = () => {
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 800);
  };

  // Like/unlike roll
  const onLikeToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await toggleLikeApi(roll.id ?? "", "reel");
      const { liked, totalLikes } = response.data;

      setLocalIsLiked(liked);
      setLikeCount(totalLikes);

      // Update rolls list
      setRolls(prevRolls =>
        prevRolls.map(r =>
          r.id === roll.id
            ? { ...r, isLiked: liked, likeCount: totalLikes }
            : r
        )
      );

      // Animation effect
      if (liked && !roll.isLiked) {
        triggerLikeAnimation();
      }

    } catch (err) {
      console.error("Failed to toggle like:", err);
      toast.error("Failed to update like status");
    } finally {
      setLoading(false);
    }
  };

  // Double tap to like
  const handleDoubleTap = () => {
    if (!localIsLiked) {
      onLikeToggle();
    }
  };

  // Navigate to profile
  const handleProfileNavigation = () => {
    navigate(`/profile/${roll.username}`);
  };

  return (
    <>
      <div className="relative w-full max-w-lg mx-auto h-full flex items-center justify-center">
        
        {/* Video Container - Centered */}
        <div className="relative w-full max-w-md aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={isVideoInView ? roll.mediaUrl : ""}
            autoPlay
            loop
            muted={!isAudioOn}
            playsInline
            controls={false}
            onClick={handleDoubleTap}
          />
          
          {/* Like Animation on Double Tap */}
          {showLikeAnimation && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <FaHeart className="w-32 h-32 text-red-500 opacity-80 animate-ping" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-white bg-black/40 rounded-full hover:bg-black/60 transition-all duration-200 backdrop-blur-sm"
              aria-label="Go back"
            >
              ←
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleIsAudioOn}
                className="p-2 text-white bg-black/40 rounded-full hover:bg-black/60 transition-all duration-200 backdrop-blur-sm"
                aria-label={isAudioOn ? "Mute sound" : "Unmute sound"}
              >
                {isAudioOn ? (
                  <HiSpeakerWave className="w-5 h-5" />
                ) : (
                  <HiSpeakerXMark className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsRollMenuOpen(true)}
                className="p-2 text-white bg-black/40 rounded-full hover:bg-black/60 transition-all duration-200 backdrop-blur-sm"
                aria-label="More options"
              >
                <BsThreeDots className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Overlay - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
            <div className="flex flex-col">
              {/* User Info & Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    onClick={handleProfileNavigation}
                    className="relative w-10 h-10 lg:w-12 lg:h-12 overflow-hidden border-2 border-white/40 rounded-full cursor-pointer hover:scale-105 transition-transform hover:border-white/80"
                  >
                    <img
                      className="object-cover w-full h-full"
                      src={roll.profileImage || DEFAULT_PROFILE_IMAGE}
                      alt={roll.username}
                    />
                  </div>
                  <div>
                    <h3 
                      onClick={handleProfileNavigation}
                      className="text-base lg:text-lg font-semibold text-white cursor-pointer hover:underline"
                    >
                      @{roll.username}
                    </h3>
                    {roll.name && (
                      <p className="text-sm text-gray-300">{roll.name}</p>
                    )}
                  </div>
                </div>

                {/* Roll Content */}
                {roll.content && (
                  <div className="mb-4">
                    <p className="text-white text-sm lg:text-base line-clamp-2">
                      {roll.content}
                    </p>
                    {roll.content.length > 100 && (
                      <button 
                        className="mt-1 text-sm text-gray-300 hover:text-white transition-colors"
                        onClick={() => {/* Expand functionality */}}
                      >
                        ...more
                      </button>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                  <div className="flex items-center gap-2">
                    <FaHeart className="w-4 h-4 text-red-400" />
                    <span className="font-medium">{likeCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaRegComment className="w-4 h-4" />
                    <span className="font-medium">{commentsCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Right Side */}
              <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center">
                  <button
                    onClick={onLikeToggle}
                    disabled={loading}
                    className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-200 backdrop-blur-sm group"
                    aria-label={localIsLiked ? "Unlike" : "Like"}
                  >
                    {localIsLiked ? (
                      <FaHeart className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                    ) : (
                      <FaRegHeart className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                  <span className="mt-1 text-xs text-white">{likeCount.toLocaleString()}</span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setShowComments(true)}
                    className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-200 backdrop-blur-sm group"
                    aria-label="Comments"
                  >
                    <FaRegComment className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                  </button>
                  <span className="mt-1 text-xs text-white">{commentsCount.toLocaleString()}</span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setIsSharing(true)}
                    className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-200 backdrop-blur-sm group"
                    aria-label="Share"
                  >
                    <IoIosShareAlt className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                  </button>
                  <span className="mt-1 text-xs text-white">Share</span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => roll.isSaved ? handleUnsaveRoll(roll.id) : handleRollSaving({ itemId: roll.id, itemType: "REEL" })}
                    className="p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-200 backdrop-blur-sm group"
                    aria-label={roll.isSaved ? "Unsave" : "Save"}
                  >
                    {roll.isSaved ? (
                      <IoBookmark className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    ) : (
                      <IoBookmarkOutline className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                  <span className="mt-1 text-xs text-white">{roll.isSaved ? 'Saved' : 'Save'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Double Tap Hint */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
            <div className="text-white/50 text-sm">Double tap to like</div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
  {showComments && (
  <CommentsModal
    isOpen={showComments}
    onClose={() => setShowComments(false)}
    entityId={roll.id}
    entityType="reel"
    entityOwner={{
      username: roll.username ??'',
      profileImage: roll.profileImage
    }}
    initialCommentsCount={commentsCount}
    onCommentAdded={() => {
      setCommentsCount(prev => prev + 1);
    }}
  />
)}

      {/* Sharing Modal */}
      {isSharing && (
        <SharingOption
          postId={roll.id}
          postType="REEL"
          postPreview={{
            thumbnail: roll.thumbnail,
            content: roll.content,
            mediaUrl: roll.mediaUrl
          }}
          onClose={() => setIsSharing(false)}
        />
      )}

      {/* Roll Menu Modal */}
      {isRollMenuOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80"
          onClick={() => setIsRollMenuOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="w-12 h-1 mx-auto mb-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="p-2 space-y-1">
              <button className="w-full px-4 py-3 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Report
              </button>
              <button className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Copy link
              </button>
              <button 
                onClick={() => {
                  setIsRollMenuOpen(false);
                  setIsSharing(true);
                }}
                className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Share to...
              </button>
              <button
                onClick={() => setIsRollMenuOpen(false)}
                className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border-t dark:border-gray-700 mt-2 pt-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RollCard;