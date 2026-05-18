// src/components/layout/profile/UserWithFollow.tsx

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { User } from "../../../redux/slices/userSlice";
import { followUserApi, unfollowUserApi } from "../../../services/user/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { FaUser, FaCheck, FaUserPlus, FaMessage } from "react-icons/fa6";

interface UserWithFollowProps {
  user: User;
  onClose: () => void;
}

const UserWithFollow: React.FC<UserWithFollowProps> = ({ user, onClose }) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentUser = useSelector((state: RootState) => state.UserReducer.user);
  const currentUserId = currentUser?.id;
  const isOwnProfile = currentUserId === user.id;

  useEffect(() => {
    setIsFollowing(user.isFollowing || false);
  }, [user.isFollowing]);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLoading || !currentUserId || isOwnProfile) return;
    
    setIsLoading(true);
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    
    try {
      if (isFollowing) {
        await unfollowUserApi(currentUserId, user.id);
      } else {
        await followUserApi(currentUserId, user.id);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setIsFollowing(previousState);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = () => {
    onClose();
    navigate(`/profile/${user.username}`);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
    navigate(`/chat/${user.id}`);
  };

  return (
    <div
      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
      onClick={handleUserClick}
    >
      {/* Avatar and Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
          {user.isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
              <FaCheck className="w-2 h-2 text-white" />
            </div>
          )}
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.name || user.username}
            </p>
            {user.isVerified && (
              <FaCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            @{user.username}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 ml-2">
        {!isOwnProfile && (
          <>
            <button
              onClick={handleMessageClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Message"
            >
              <FaMessage className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            <button
              onClick={handleFollowToggle}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              } ${
                isFollowing
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-purple-500 text-white hover:bg-purple-600"
              }`}
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isFollowing ? (
                "Following"
              ) : (
                "Follow"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserWithFollow;