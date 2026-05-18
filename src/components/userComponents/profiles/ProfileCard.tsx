// src/components/profile/ProfileCard.tsx

import { motion } from "framer-motion";
import { User, Calendar, Users, Sparkles, MessageCircle, UserPlus, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { User as UserType } from "../../../redux/slices/userSlice";
import { followUserApi, unfollowUserApi } from "../../../services/user/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface ProfileCardProps {
  user: UserType;
  onFollowChange?: (userId: string, isFollowing: boolean, followersCount?: number) => void; // Callback to update parent component
}

const ProfileCard = ({ user, onFollowChange }: ProfileCardProps) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(user.followersCount || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    console.log("user in the profile card", user);
  }, []);
  
  // Get current user from Redux
  const currentUser = useSelector((state: RootState) => state.UserReducer.user);
  const currentUserId = currentUser?.id;

  // Check if this is the current user's own profile
  const isOwnProfile = currentUserId === user.id;

  // Update local state when prop changes
  useEffect(() => {
    setIsFollowing(user.isFollowing || false);
    setFollowersCount(user.followersCount || 0);
  }, [user.isFollowing, user.followersCount]);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLoading || !currentUserId) return;
    
    setIsLoading(true);
    
    // Optimistic update - update UI immediately
    const previousFollowingState = isFollowing;
    const previousFollowersCount = followersCount;
    
    if (isFollowing) {
      // Unfollow - decrease count
      setIsFollowing(false);
      setFollowersCount(prev => Math.max(0, prev - 1));
    } else {
      // Follow - increase count
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
    
    try {
      if (isFollowing) {
        // Unfollow user
        await unfollowUserApi(currentUserId, user.id);
        
        // Notify parent component of the change
        if (onFollowChange) {
          onFollowChange(user.id, false, followersCount - 1);
        }
      } else {
        // Follow user
        await followUserApi(currentUserId, user.id);
        
        // Notify parent component of the change
        if (onFollowChange) {
          onFollowChange(user.id, true, followersCount + 1);
        }
      }
    } catch (error) {
      // Revert on error
      console.error("Error toggling follow:", error);
      setIsFollowing(previousFollowingState);
      setFollowersCount(previousFollowersCount);
      
      // Notify parent of revert
      if (onFollowChange) {
        onFollowChange(user.id, previousFollowingState, previousFollowersCount);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.id) {
      navigate(`/chat/${user.id}`);
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${user.username}`);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return "Recently joined";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMonths = (now.getFullYear() - dateObj.getFullYear()) * 12 + now.getMonth() - dateObj.getMonth();
    
    if (diffMonths < 1) return "Joined recently";
    if (diffMonths < 12) return `Joined ${diffMonths} months ago`;
    const years = Math.floor(diffMonths / 12);
    return `Joined ${years} ${years === 1 ? 'year' : 'years'} ago`;
  };

  return (
    <motion.div
      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-gray-100 dark:border-gray-700"
      onClick={handleViewProfile}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl" />
      
      {/* Card Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
        {/* Profile Header with Gradient */}
        <div className="relative h-28 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              <div className="relative w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1 shadow-lg">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                {/* Verified Badge */}
                {user.isVerified && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-16 pb-6 px-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            {user.name || user.username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{user.username}</p>
          
          {user.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* User Stats */}
          <div className="flex justify-center gap-4 mb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-xs">Followers</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {followersCount}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs">Following</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {user.followingCount || 0}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(user.createdAt)}</span>
            </div>
          </div>

          {/* Action Buttons - Only show if not own profile */}
          {!isOwnProfile && (
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleFollowToggle}
                disabled={isLoading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                } ${
                  isFollowing
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg"
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isFollowing ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleMessageClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>
          )}

          {/* If own profile, show edit profile button */}
          {isOwnProfile && (
            <div className="mt-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/profile/edit');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <User className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <motion.div
          className="absolute inset-0 bg-purple-500/5 dark:bg-purple-500/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
          initial={false}
          animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
        />
      </div>
    </motion.div>
  );
};

export default ProfileCard;