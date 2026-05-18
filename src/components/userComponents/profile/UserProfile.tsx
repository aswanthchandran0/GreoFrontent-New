// src/components/userComponents/profile/UserProfile.tsx

import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteNotification,
  followUserApi,
  saveNotification,
  unfollowUserApi,
} from "../../../services/user/api";
import { useEffect, useState } from "react";
import { User } from "../../../redux/slices/userSlice";
import FollowersFollowing from "./FollowersFollowing";
import Settings from "./Settings";
import { 
  IoMdSettings, 
  IoMdPersonAdd, 
  IoMdCheckmark,
  IoMdChatbubbles,
  IoMdCreate,
  IoMdCalendar
} from "react-icons/io";
import { FaRegCalendarAlt } from "react-icons/fa";
import { useSocket } from "../../../context/SocketContext";

export type showComponentType = "Followers" | "Following" | null;

interface UserProfileProps {
  profileUser: User | null;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
  followingCount: number;
  postCount: number;
  isCurrentUser: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  onFollowersCountChange?: (count: number) => void;
  onEditClick?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  profileUser,
  initialIsFollowing,
  initialFollowersCount,
  followingCount,
  postCount,
  isCurrentUser,
  onFollowChange,
  onFollowersCountChange,
  onEditClick,
}) => {
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const { username } = useParams();
  const navigate = useNavigate();

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [isFollowerFollowingComponent, setIsFollowerFollowingComponent] = useState(false);
  const [showComponent, setShowComponent] = useState<showComponentType>(null);
  const [isSettings, setIsSettings] = useState<boolean>(false);
  const { socket } = useSocket();
  const localUser = useSelector((state: RootState) => state.UserReducer.user);
  
  useEffect(() => {
    setFollowersCount(initialFollowersCount);
    setIsFollowing(initialIsFollowing);
  }, [initialFollowersCount, initialIsFollowing]);

  const handleFollow = async () => {
    if (!user?.id || !profileUser?.id) return;
    setIsFollowingLoading(true);

    try {
      if (isFollowing) {
        const response = await unfollowUserApi(user.id, profileUser.id);
        if (response.status === 200) {
          const newCount = followersCount - 1;
          setIsFollowing(false);
          setFollowersCount(newCount);
          onFollowChange?.(false);
          onFollowersCountChange?.(newCount);

          await deleteNotification(profileUser.id, profileUser.id, 'follow');
          socket?.emit("removeNotification", {
            userId: profileUser.id,
            entityId: profileUser.id,
            initiatorId: localUser?.id,
            type: 'follow'
          });
        }
      } else {
        const response = await followUserApi(user.id, profileUser.id);
        if (response.status === 200) {
          const newCount = followersCount + 1;
          setIsFollowing(true);
          setFollowersCount(newCount);
          onFollowChange?.(true);
          onFollowersCountChange?.(newCount);

          const notifyingMessage = "started following you";
          const SaveNotificatonResponse = await saveNotification(
            profileUser.id,
            profileUser.id,
            "",
            notifyingMessage,
            "follow"
          );

          if (SaveNotificatonResponse) {
            socket?.emit("sendNotification", SaveNotificatonResponse.data);
          }
        }
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleMessageClick = () => {
    if (profileUser?.id) {
      navigate(`/chat/${profileUser.id}`);
    }
  };

  const handleProfileEdit = () => {
    if (onEditClick) {
      onEditClick();
    }
  };

  const handleShowComponent = (data: showComponentType) => {
    setShowComponent(data);
    setIsFollowerFollowingComponent(true);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "Joined recently";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Cover Photo Area */}
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Info Section */}
      <div className="relative px-4 sm:px-6">
        {/* Avatar */}
        <div className="absolute -top-16 left-4 sm:left-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white dark:bg-gray-900 p-1 shadow-xl">
              <img
                className="w-full h-full rounded-full object-cover"
                src={
                  profileUser?.profileImage
                    ? profileUser.profileImage
                    : `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=${encodeURIComponent(profileUser?.name || "User")}`
                }
                alt={profileUser?.name || "User profile"}
              />
              {profileUser?.isVerified && (
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="pt-20 sm:pt-24 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* User Info */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {profileUser?.name || "User"}
                </h1>
                {profileUser?.isVerified && (
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                @{profileUser?.username}
              </p>
              {profileUser?.bio && (
                <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-md">
                  {profileUser.bio}
                </p>
              )}
              
              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <FaRegCalendarAlt className="w-4 h-4" />
                  <span>{formatDate(profileUser?.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 justify-center sm:justify-end">
              <div 
                onClick={() => handleShowComponent("Followers")}
                className="text-center cursor-pointer group"
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">
                  {followersCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors">
                  Followers
                </div>
              </div>
              <div 
                onClick={() => handleShowComponent("Following")}
                className="text-center cursor-pointer group"
              >
                <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors">
                  {followingCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors">
                  Following
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {postCount}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Posts
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {!isCurrentUser ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFollow}
                  disabled={isFollowingLoading}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                    isFollowing
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg"
                  } ${isFollowingLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isFollowingLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <IoMdCheckmark className="w-5 h-5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <IoMdPersonAdd className="w-5 h-5" />
                      <span>Follow</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMessageClick}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <IoMdChatbubbles className="w-5 h-5" />
                  <span>Message</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProfileEdit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all duration-300"
                >
                  <IoMdCreate className="w-5 h-5" />
                  <span>Edit Profile</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSettings(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <IoMdSettings className="w-5 h-5" />
                  <span>Settings</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isFollowerFollowingComponent && (
        <FollowersFollowing
          showComponent={showComponent}
          onClose={() => setIsFollowerFollowingComponent(false)}
          userId={profileUser?.id}
        />
      )}

      {isSettings && (
        <Settings 
          onClose={() => setIsSettings(false)} 
          user={profileUser}
          followersCount={followersCount}
          followingCount={followingCount}
          postCount={postCount}
        />
      )}
    </motion.div>
  );
};

export default UserProfile;