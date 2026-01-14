import { Outlet, useParams } from "react-router-dom";
import UserPosts from "../components/userComponents/profile/UserPosts";
import UserProfile from "../components/userComponents/profile/UserProfile";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import { getUserPostApi, profileDetailsFetchApi } from "../services/user/api";

import { IPost } from "../Types/postTypes";
import { User } from "../redux/slices/userSlice";
const ProfileScreen = () => {
  const {username} = useParams()
  const user = useSelector((state:RootState)=>state.UserReducer.user)
  const [profileUser,setProfileUser] = useState<User | null>(null)
  const [followersCount,setFollowersCount] = useState(0)
  const [followingCount,setFollowingCount] = useState(0)
  const [isFollowing,setIsFollowing] = useState(false)
  const [postCount,setPostCount] = useState(0)
  const [posts,setPosts] = useState<IPost[]>([])
  const [refreshPosts, setRefreshPosts] = useState<boolean>(false);

  const isCurrentUser = user?.username === username;

  useEffect(() => {
    const fetchProfileDetails = async () => {
      const response = await profileDetailsFetchApi(username?username:"");
      console.log("user in response in user page",response.data.user)
      if(response.data.user) setProfileUser(response?.data?.user);
      if(response.data.isFollowing) setIsFollowing(response?.data?.isFollowing);
      console.log('isfollowing in profile screen',response.data.isFollowing)
      setFollowersCount(response?.data?.followersCount);
      setFollowingCount(response?.data?.followingCount)
    }
    fetchProfileDetails();
  }, [username, refreshPosts])

  useEffect(()=>{
    const fetchPost = async()=>{
      const userId = isCurrentUser ? user?.id : profileUser?.id;
      const response = await getUserPostApi(userId ?? '')
      console.log("posts in profile ==============",response.data)
      setPosts(response.data)
      setPostCount(response.data.postCount)
    }
    fetchPost()
  },[profileUser, user, isCurrentUser])

  // Determine which user to display
  const displayUser = isCurrentUser ? user : profileUser;
  const displayUserPosts = posts;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full md:max-h-[90vh] max-h-[83vh] lg:px-16 items-center overflow-y-scroll scrollbar-hide">
      {/* profile session */}
      <div className="flex flex-1">
        {displayUser && (
          <UserProfile 
            profileUser={displayUser} 
            initialIsFollowing={isFollowing} 
            initialFollowersCount={followersCount} 
            followingCount={followingCount} 
            postCount={postCount}
            isCurrentUser={isCurrentUser} // Pass this flag
          />
        )}
      </div>

      {/* post session */}
      <div className="flex flex-1 h-full">
        {location.pathname.endsWith("/edit") && isCurrentUser ? (
          <Outlet/>
        ) : displayUser ? (
          <UserPosts 
            user={displayUser} 
            posts={displayUserPosts} 
            setRefreshPosts={setRefreshPosts} 
            refreshPosts={refreshPosts} 
          />
        ) : null}
      </div>
    </div>
  );
};

export default ProfileScreen;