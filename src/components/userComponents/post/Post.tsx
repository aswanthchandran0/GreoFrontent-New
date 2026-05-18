// src/components/userComponents/post/Post.tsx
import PostCard from "./PostCard";
import { useEffect, useRef, useState } from "react";
import { getUserFeedApi } from "../../../services/user/api";
import { IPost } from "../../../Types/postTypes";
import { useNavigate, useOutletContext } from "react-router-dom";
import { LoaderSpinner } from "../../ui/LoadingSpinner";
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';
import { FaCompass, FaPlusSquare, FaHeart, FaUserPlus, FaHome } from "react-icons/fa";
import { IoSparkles, IoPeople } from "react-icons/io5";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface OutletContext {
  newPosts: IPost | null;
}

const Post = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const { newPosts } = useOutletContext<OutletContext>();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const skipRef = useRef(0);
  const [limit] = useState(5);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [connectAnimation, setConnectAnimation] = useState(null);
  const navigate = useNavigate();
  
  const user = useSelector((state: RootState) => state.UserReducer.user);

  // Fetch user feed
  const fetchUserFeed = async () => {
    if (loading || !hasMorePosts) return;
    setLoading(skipRef.current === 0);
    setLoadingMore(skipRef.current > 0);
    
    try {
      const response = await getUserFeedApi(skipRef.current, limit);
      const fetchedPosts = response.data;

      setPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map((post) => post.id || post._id));
        const uniquePosts = fetchedPosts.filter(
          (post: IPost) => !existingPostIds.has(post.id || post._id)
        );
        return skipRef.current === 0 ? uniquePosts : [...prevPosts, ...uniquePosts];
      });

      if (fetchedPosts.length < limit) {
        setHasMorePosts(false);
      }
      
      skipRef.current += limit;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchUserFeed();
  }, []);

  // Infinite scroll handler
  const handleScroll = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + 500;
    
    if (isNearBottom && !loadingMore && hasMorePosts && !loading) {
      fetchUserFeed();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore, hasMorePosts, loading]);

  useEffect(() => {
    if (newPosts) {
      setPosts((prevPosts) => [newPosts, ...prevPosts]);
    }
  }, [newPosts]);

  // Fetch Lottie animation
  useEffect(() => {
    fetch('https://assets9.lottiefiles.com/packages/lf20_bp5lntrf.json')
      .then(response => response.json())
      .then(data => setConnectAnimation(data))
      .catch(error => console.error('Error loading connect animation:', error));
  }, []);

  // Handle like change
  const handleLikeChange = (postId: string, isLiked: boolean, likeCount: number) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isLiked, likeCount } : post
      )
    );
  };

  // Handle save change
  const handleSaveChange = (postId: string, isSaved: boolean) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isBookmarked: isSaved } : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Main Container - Instagram standard width (470px on desktop) */}
      <div className="max-w-[470px] lg:max-w-[630px] mx-auto">
        {/* Stories Bar - Instagram style */}
        <div className="sticky top-16 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-3">
            <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
              {/* User's Story */}
              {/* <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative w-14 h-14">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaHome className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 right-0 w-5 h-5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                    <FaPlusSquare className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <span className="text-xs mt-1.5 text-gray-600 dark:text-gray-400 truncate max-w-[56px]">
                  Your story
                </span>
              </div> */}

              {/* Other Stories */}
{/*               
                <div  className="flex flex-col items-center flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden"> */}
                      {/* User story image would go here */}
                    {/* </div>
                  </div>
                  <span className="text-xs mt-1.5 text-gray-600 dark:text-gray-400 truncate max-w-[56px]">
                    user_1
                  </span>
                </div> */}
             
            </div>
          </div>
        </div>

        {/* Posts Container */}
        <div className="pb-20 md:pb-8">
          {/* Loading Skeletons */}
          {loading && posts.length === 0 ? (
            <div className="space-y-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 animate-pulse">
                  {/* Header skeleton */}
                  <div className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-1"></div>
                        <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                  {/* Media skeleton - Instagram standard 1:1 */}
                  <div className="aspect-square bg-gray-300 dark:bg-gray-700"></div>
                  {/* Actions skeleton */}
                  <div className="p-3">
                    <div className="flex space-x-3 mb-3">
                      <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-5 w-5 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id || `${post.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="w-full"
                >
                  <div className="max-w-full overflow-hidden">
                    <PostCard
                      post={post}
                      isLiked={post.isLiked}
                      onLikeChange={(postId, isLiked, likeCount) => {
                        handleLikeChange(postId, isLiked, likeCount);
                      }}
                      onSaveChange={handleSaveChange}
                      setPosts={setPosts}
                      compact={false}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 pt-8">
              <div className="max-w-md mx-auto text-center">
                {/* Animated Illustration */}
                <div className="w-48 h-48 mx-auto mb-6">
                  {connectAnimation ? (
                    <Lottie 
                      animationData={connectAnimation} 
                      loop={true} 
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="relative">
                        <IoSparkles className="w-20 h-20 text-purple-400" />
                        <IoPeople className="w-14 h-14 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Message */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Your feed is empty
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                  Follow people to see their posts here. Start connecting with others to build your community!
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/explore")}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FaCompass className="w-4 h-4" />
                    <span className="text-sm">Explore Content</span>
                  </button>
                  <button
                    onClick={() => navigate("/profiles")}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FaUserPlus className="w-4 h-4" />
                    <span className="text-sm">Find People</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex justify-center py-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Loading more posts...
                </span>
              </div>
            </div>
          )}

          {/* No More Posts Indicator */}
          {!hasMorePosts && posts.length > 0 && (
            <div className="text-center py-8 px-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-full mb-3">
                <FaHeart className="w-5 h-5 text-pink-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                You're all caught up! 🎉
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">
                You've seen all new posts. Check back later for more updates.
              </p>
              <button
                onClick={() => navigate("/explore")}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
              >
                <span>Discover more content</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Post FAB (Floating Action Button) - Mobile Only */}
      <button
        onClick={() => navigate("/create")}
        className="md:hidden fixed bottom-20 right-4 z-40 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
        aria-label="Create new post"
      >
        <FaPlusSquare className="w-5 h-5" />
      </button>

      {/* Create Post Button - Desktop Sidebar */}
      <div className="hidden lg:block fixed left-1/2 translate-x-[350px] top-24 z-30">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 w-64">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaHome className="w-5 h-5 text-purple-600 dark:text-purple-400 m-auto mt-2.5" />
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                {user?.username || "User"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your profile
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/create")}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mb-3 text-sm"
          >
            <FaPlusSquare className="w-4 h-4" />
            <span>Create Post</span>
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>Share your moments with the world</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;