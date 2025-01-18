import { Outlet, useNavigate } from "react-router-dom";
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
  const user = useSelector((state:RootState)=>state.UserReducer.user)
  const navigate = useNavigate(); // This is inside the router context
  const isDarkMode = useSelector((state: RootState) => state.preferences.darkMode);
   const {receivingCall} = useCall()
   
  useEffect(() => {
    setNavigateFunction(navigate); // Set the navigate function globally if necessary
  }, [navigate]);


  const handleNewPost = (newPost:IPost) => {
    const newPostWithUserDetails = {
      ...newPost,  // Spread the existing newPost data
      profileImage: user?.profileImage,  // Add the profile image from the user state
      name:user?.name,
      isLiked:false,
      likeCount:0,
      commentCount:0,
      user_name: user?.user_name,  // Add the username from the user state
    } as IPost
    setNewPosts(newPostWithUserDetails);
  };



  // dark mode 
  useEffect(() => {
    // Sync the dark mode state with the DOM
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]); 


  return (
    <>
      <div className="relative w-screen h-screen bg-background-light dark:bg-background-dark">

        {
          receivingCall && <IncomingCallModal/>
        //  <IncomingCallModal/>
        }
        <NavBar onNewPost={handleNewPost} />
        <Outlet context={{ newPosts }} />
      </div>
    </>
  );
};

export default MainLayout;
