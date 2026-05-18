// src/components/layout/MainLayout.tsx
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import { setNavigateFunction } from "../../utils/navigate";
import { useEffect, useState } from "react";
import { useCall } from "../../context/CallContext";
import IncomingCallModal from "./VideoCall/IncomingCallModal";
import { IPost } from "../../Types/postTypes";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const MainLayout = () => {
  const [newPosts, setNewPosts] = useState<IPost | null>(null);
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const navigate = useNavigate();
  const location = useLocation();
  const isDarkMode = useSelector((state: RootState) => state.preferences.darkMode);
  const { receivingCall } = useCall();

  // Check if current route is /roll
  const isRollPage = location.pathname === "/roll";

  useEffect(() => {
    setNavigateFunction(navigate);
  }, [navigate]);

  const handleNewPost = (newPost: IPost) => {
    const newPostWithUserDetails = {
      ...newPost,
      profileImage: user?.profileImage,
      name: user?.name,
      isLiked: false,
      likeCount: 0,
      commentCount: 0,
      user_name: user?.username,
    } as IPost;
    setNewPosts(newPostWithUserDetails);
  };

  // dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {receivingCall && <IncomingCallModal />}
      
      {/* Conditionally render NavBar */}
      {!isRollPage && <NavBar onNewPost={handleNewPost} />}
      
      <div className="pt-16">
        <Outlet context={{ newPosts }} />
      </div>
    </div>
  );
};

export default MainLayout;