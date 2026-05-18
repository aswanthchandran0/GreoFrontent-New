// src/screens/ProfileScreen.tsx

import { useParams } from "react-router-dom";
import UserPosts from "../components/userComponents/profile/UserPosts";
import UserProfile from "../components/userComponents/profile/UserProfile";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import { getUserPostApi, profileDetailsFetchApi } from "../services/user/api";
import { IPost } from "../Types/postTypes";
import { User } from "../redux/slices/userSlice";
import { motion } from "framer-motion";
import EditProfile from "../components/userComponents/profile/EditProfile";

const ProfileScreen = () => {
  const { username } = useParams();
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [refreshPosts, setRefreshPosts] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const isCurrentUser = user?.username === username;

  useEffect(() => {
    const fetchProfileDetails = async () => {
      setLoading(true);
      try {
        const response = await profileDetailsFetchApi(username ? username : "");
        console.log('Profile details response:', response.data);
        
        if (response.data.success) {
          const { user, isFollowing, followersCount, followingCount, postCount } = response.data.data;
          
          setProfileUser(user);
          setIsFollowing(isFollowing || false);
          setFollowersCount(followersCount || 0);
          setFollowingCount(followingCount || 0);
          setPostCount(postCount || 0);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileDetails();
  }, [username, refreshPosts]);

  useEffect(() => {
    const fetchPost = async () => {
      const userId = isCurrentUser ? user?.id : profileUser?.id;
      if (!userId) return;
      try {
        const response = await getUserPostApi(userId);
        setPosts(response.data);
        setPostCount(response.data.postCount || response.data.length);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPost();
  }, [profileUser, user, isCurrentUser, refreshPosts]);

  const displayUser = isCurrentUser ? user : profileUser;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Profile Section */}
        <div className="mb-12">
          {displayUser && (
            <UserProfile
              profileUser={displayUser}
              initialIsFollowing={isFollowing}
              initialFollowersCount={followersCount}
              followingCount={followingCount}
              postCount={postCount}
              isCurrentUser={isCurrentUser}
              onFollowChange={setIsFollowing}
              onFollowersCountChange={setFollowersCount}
              onEditClick={() => setShowEditModal(true)}
            />
          )}
        </div>

        {/* Posts Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          {displayUser ? (
            <UserPosts
              user={displayUser}
              posts={posts}
              setRefreshPosts={setRefreshPosts}
              refreshPosts={refreshPosts}
            />
          ) : null}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfile onClose={() => setShowEditModal(false)} />
      )}
    </motion.div>
  );
};

export default ProfileScreen;