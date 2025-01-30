import React, { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import { IoIosArrowBack, IoIosShareAlt } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import {  IoBookmarkOutline, IoClose } from "react-icons/io5";
import { ExploreI, PostInter, RollInter } from "../../../Types/exploreTypes";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { BsThreeDots } from "react-icons/bs";
import { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";
import { FaRegComment } from "react-icons/fa";
import { commentSentAPi,  getCommentsApi, rollCommentSentAPi, rollGetCommentsApi,  saveNotification } from "../../../services/user/api";
import { CommentsDto, IComment } from "../../../Types/commentTypes";
import Comment from "../post/Comment";
import { useSocket } from "../../../context/SocketContext";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { timeformat } from "../../../utils/formating";

interface Props{
    index:number|null,
    data:ExploreI[],
    onClose:()=>void
}


const OpenedExplore:React.FC<Props> = ({index,data,onClose}) => {
    const [currentItem,setCurrentItem]= useState<PostInter|RollInter>(data[index || 0])
    const [localIndex,setLocalIndex] = useState(index || 0)
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
    const [comment, setComment] = useState<string>("");
    const [comments, setComments] = useState<CommentsDto | null>(null);
    const [loadingComments, setLoadingComments] = useState<boolean>(false);
    const [commentError, setCommentError] = useState<string>("");
    const loggedUser = useSelector((state:RootState)=>state.UserReducer.user)
      // const [localIsLiked, setLocalIsLiked] = useState<boolean>( currentItem?.isLiked || "isLikedByViewingUser" in currentItem &&  currentItem?.isLikedByViewingUser || false);
      //  const [loading,setLoading] = useState<boolean>(false)
    const {socket}= useSocket()
    
    // forwared and backward action for roll controll
  const backward = () => {
  if (localIndex > 0) {
    const newIndex = localIndex - 1;
    setLocalIndex(newIndex);
    setCurrentItem(data[newIndex]);
  }
};

const forward = () => {
  if (localIndex < data.length - 1) {
    const newIndex = localIndex + 1;
    setLocalIndex(newIndex);
    setCurrentItem(data[newIndex]);
  }
};



  // Play/Pause functionality for video
  const handlePlayPause = () => {
    const videoElement = document.getElementById("rollVideo") as HTMLVideoElement;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  

 // Fetch comments
 const fetchComments = async () => {
    try {
      setLoadingComments(true);
      setCommentError("");

      const id = currentItem._id ?? currentItem.id ?? "";
      if (!id) return;

      const response =
        currentItem.type === "roll"
          ? await rollGetCommentsApi(id)
          : await getCommentsApi(id);

      setComments(response.data[0] || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setCommentError("Failed to load comments. Please try again later.");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [currentItem]);



     // comment posting logic
     const handleCommentPost = async () => {
        try {
            if (comment.trim()) {
                const id = currentItem._id ?? currentItem.id ?? '';
                const response = currentItem.type === "roll"
                    ? await rollCommentSentAPi(id, comment) // for RollInter
                    : await commentSentAPi(id, comment); // for PostInter
                
                handleAddComment(response.data);
                setComment("");

                // Comment notification
                const notificationMessage = "commented on your post";
                const notificationResponse = await saveNotification(
                    currentItem.userId,
                    id,
                   "mediaUrls" in currentItem ? currentItem.mediaUrls[0] : currentItem.mediaUrl,
                    notificationMessage,
                    "comment"
                );
                console.log("response from the comment notification", notificationResponse.data);

                if (notificationResponse.data) {
                    socket?.emit("sendNotification", notificationResponse.data);
                }
            }
        } catch (err) {
            console.log("Error posting comment:", err);
        }
    };


      // Add comment to the local state
      const handleAddComment = (newComment: IComment) => {
        if (comments) {
            const updatedComments = { ...comments };
            updatedComments.comments.unshift(newComment);
            setComments(updatedComments);
        }
    };


     // handle Post Saving

  // const handlePostSaving = async(item:SavedItemArrayElement)=>{
  //   try{
  //    const response =   await saveItemApi(item)
  //    if(response.data == null){
  //     toast("already saved")
  //    }else{
  //     setPosts((prevPosts) =>
  //       prevPosts.map((post) =>
  //         post._id === item.itemId
  //           ? { ...post, isSaved: true }
  //           : post
  //       )
  //     );
  //     toast.success('saved')
  //    }
  //   }catch(err){
  //     console.log('error',err)
  //     toast.error("something went wrong in saving post")
  //   }
  // }


  // unSave post 

  // Add this function inside the Post component
// const handleUnsavePost = async (itemId: string) => {
//   try {
//     const response = await deleteSavedItemApi(itemId, "post");
//     if (response.status === 200) { // Assuming 200 means success
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post._id === itemId
//             ? { ...post, isSaved: false }
//             : post
//         )
//       );
//       toast.success("unsaved");
//     }
//   } catch (error) {
//     console.error("Failed to unsave post:", error);
//     toast.error("Failed to unsave post. Please try again.");
//   }
// };




  return (

    
    <div  onClick={onClose} className="absolute inset-0 z-50 flex justify-center w-full h-full bg-transparent md:items-center ">
        {/* <div className={"flex h-full dark:bg-background-dark bg-background-light md:max-h-[90vh] max-h-[83vh]   lg:px-16 justify-center" }> */}
      <div onClick={(e)=>e.stopPropagation()}  className="flex flex-row items-center justify-center w-full   md:max-h-[100vh] max-h-[93vh]   h-screen bg-opacity-50 md:justify-between md:p-5 ">
        
        <div onClick={backward} className="items-center justify-center hidden p-2 rounded-full cursor-pointer md:flex hover:bg-opacity-60 bg-background-light ">
      <IoIosArrowBack   className="text-xl text-text-black" />
        </div>
        <div className="flex flex-col w-full h-full max-w-4xl bg-background-light dark:bg-background-dark">
      
      {/* header  */}

      <div className="flex border-b md:hidden border-background-charcoal">
        <div className="flex flex-row w-full p-2 space-x-2 ">
            <BiArrowBack  onClick={onClose} className="text-2xl text-black cursor-pointer dark:text-text-white"/>
            <span className="text-text-white font-outfit">Explore</span>
        </div>
      </div>
       {/* end of the header */}
       
       {/* body */}
        <div className="flex flex-col h-full md:flex-row">

        <div className="flex flex-row items-center justify-center h-full border-r cursor-pointer md:flex-col md:w-2/5 md:flex bg-background-dark border-text-charcoal">
    <div>
      {currentItem?.type === "roll" ? (
        // If it's a video (roll)
        <div  onClick={handlePlayPause} className="relative w-full h-full">
          <video
            id="rollVideo"
            src={"mediaUrls" in currentItem ? currentItem.mediaUrls[0] : currentItem.mediaUrl}
            className="object-contain w-full h-full max-h-[90vh] "
            autoPlay
            loop
            muted={!isAudioOn}
          />
          {/* Audio Toggle Icon */}
          {isAudioOn ? (
            <HiSpeakerWave
              onClick={() => setIsAudioOn(!isAudioOn)}
              className="absolute text-xl cursor-pointer right-3 bottom-3 text-text-white"
            />
          ) : (
            <HiSpeakerXMark
              onClick={() => setIsAudioOn(!isAudioOn)}
              className="absolute text-xl cursor-pointer right-3 bottom-3 text-text-white"
            />
          )}
        </div>
      ) : (
        // If it's an image (post)
        <img
          src={"mediaUrls" in currentItem ? currentItem.mediaUrls[0] : currentItem.mediaUrl}
          alt="Explore Item"
          className="object-contain w-full h-full max-h-[90vh]"
        />
      )}
    </div>
  </div>

{/* mobile area connet of the post */}
     <div className="flex flex-col p-2 space-y-3 md:hidden ">
     
                 <div className="flex flex-col">
                 {/* <span className="text-4xl font-semibold font-zilla dark:text-text-white text-text-charcoal">The Weeknd</span> */}
                 
     
                 <div className="flex flex-row items-center space-x-2">
                   <div className="w-10 h-10 overflow-hidden rounded-full">
                     <img className="object-cover w-full h-full cursor-pointer" src={currentItem?.profileImage?currentItem.profileImage: DEFAULT_PROFILE_IMAGE} alt="" />
                   </div>
                   <div className="flex flex-row items-center w-11/12 ">
                   <span   className="py-2 text-lg font-semibold cursor-pointer font-zilla dark:text-text-white text-text-charcoal">{currentItem.name}</span>
                   <BsThreeDots  className="ml-auto cursor-pointer font-golos text-text-lavenderGray"/>
                   </div>
                 </div>
     
                 <div className="flex flex-row">
                 <span className="font-golos text-text-lavenderGray">{currentItem.user_name?currentItem.user_name:currentItem.userName || 'user name'}</span>
                 <span className="ml-auto font-golos text-text-lavenderGray">{timeformat(currentItem?.createdAt.toString()) }</span>
                 </div>
                 </div>
     
                 <div className="max-w-xl">
                     <span className="font-golos text-text-darkGray">{currentItem.content}</span>
                 </div>
     
     
                   <div className="flex flex-row items-center justify-between">
                   <div className="flex flex-row items-center space-x-3">
                   <div className="flex flex-col items-center justify-center ">
                   {/* {localIsLiked ? (
           <FaHeart 
             className={`text-2xl cursor-pointer text-red-500 ${loading ? 'animate-ping' : ''}`} 
             onClick={!loading ? onLikeToggle : undefined} // Disable onClick if loading
           />
         ) : (
           <FaRegHeart 
             className={`text-2xl cursor-pointer dark:text-text-white text-text-charcoal ${loading ? 'animate-ping' : ''}`} 
             onClick={!loading ? onLikeToggle : undefined} // Disable onClick if loading
           />
         )}  */}
         
       {/* {!loading && (
         <span onClick={() => setIsLikedUsersList(!isLikedUsersList)} className="cursor-pointer font-golos dark:text-text-white text-text-charcoal">
           {post.likeCount || 0}
         </span>
       )} */}
     </div>
     
     
                     <div className="flex flex-col items-center justify-center">
                  <FaRegComment   className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
                  <span  className="font-golos dark:text-text-white text-text-charcoal">{currentItem.commentCount ||0}</span>
                     </div>
     
                     <div className="flex flex-col items-center justify-center">
                   <IoIosShareAlt className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
                   <span className="font-golos dark:text-text-white text-text-charcoal">0</span>
                     </div>
                 </div>
     
                 <div className="flex flex-col">
                   {/* {
                   currentItem?.isSaved ?
                   <IoBookmark   className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
                   :
     
                 <IoBookmarkOutline className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
                   } */}
                 </div>
                 
                </div>
            <span  className="text-text-lavenderGray font-golos hover:cursor-pointer">view all comments</span>
                
                
             </div>
     
{/* mobile view post details end */}

                 {/* comment area */}
         <div className="flex-col hidden w-full h-full md:flex md:w-3/5 ">
            
             {/* header */}
                      
                      <div className="flex-row items-center w-full gap-2 p-2 border-b md:flex h-fit border-text-charcoal">
                        <div className="w-12 h-12 overflow-hidden rounded-full">
                          <img
                            className="object-cover w-full h-full cursor-pointer"
                            src={
                                currentItem.profileImage
                            }
                            alt=""
                          />
                        </div>
                        <span
                        //   onClick={handleProfileNavigation}
                          className="font-semibold cursor-pointer text-text-black dark:text-text-white"
                        >
                           {currentItem?.user_name?currentItem?.user_name:currentItem?.userName || 'unknow user'}
                        </span>
            
                        <div className="flex flex-row ml-auto space-x-3 text-xl font-semibold cursor-pointer text-text-black dark:text-text-white">
                          {loggedUser?.user_name === currentItem.name && (
                            <BsThreeDots  />
                          )}
                          <IoClose onClick={onClose} />
                        </div>
                      </div>
            {/* header ended */}
    


    
              {/* Comments Box */}
              <div className="flex-grow p-2 overflow-y-auto scrollbar-hide">
                {loadingComments ? (
                  <p className="text-text-darkGray">Loading comments...</p>
                ) : commentError ? (
                  <p className="text-red-500">{commentError}</p>
                ) : comments?.comments?.length ? (
                  comments.comments.map((comment, index) => <Comment key={index} comment={comment} />)
                ) : (
                  <p className="text-text-darkGray">No comments yet. Be the first to comment!</p>
                )}
              </div>

    {/* footer  */}
                     <div className="flex flex-col items-center justify-between w-full mt-auto border-t border-text-charcoal">
                       {/* post details */}
                       <div className="flex flex-row items-center justify-between w-full p-2">
                         <div className="flex flex-row items-center p-1 space-x-3">
                           <div className="flex flex-col items-center justify-center">
                             {/* {isLiked ? (
                               <FaHeart
                                 className="text-2xl text-red-500 cursor-pointer"
                                 onClick={onLikeToggle}
                               />
                             ) : (
                               <FaRegHeart
                                 className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"
                                 onClick={onLikeToggle}
                               />
                             )} */}
                             {/* <span className="font-golos dark:text-text-white text-text-charcoal">
                     {post.likeCount}
                   </span> */}
                           </div>
           
                           <div className="flex flex-col items-center justify-center">
                             <FaRegComment className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
                           </div>
           
                           <div className="flex flex-col items-center justify-center">
                             <IoIosShareAlt

                            //    onClick={() => setIsSharing(!isSharing)}
                               className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"
                             />
                           </div>
                         </div>
                         <div className="flex flex-col">
                           <IoBookmarkOutline className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
                         </div>
                       </div>
           
                       {/* text area */}
                       <div className="flex items-center justify-between w-full p-2 space-x-2 border-t border-text-charcoal">
                         <input
                           value={comment}
                           onChange={(e) => setComment(e.target.value)}
                           onKeyDown={(e) => e.key === "Enter" && handleCommentPost()}
                           className="p-2 outline-none w-96 dark:bg-background-dark text-text-black bg-background-light dark:text-text-white "
                           type="text"
                           placeholder="Add a comment..."
                         />
                         <p
                           onClick={handleCommentPost}
                           className="text-blue-500 cursor-pointer font-golos"
                         >
                           post
                         </p>
                       </div>
                     </div>
{/* footer end */}

         </div>

         {/* end of the comment area */}
        </div>
        {/* end of the body */}
        </div>
        <IoClose onClick={onClose} className="fixed hidden text-3xl cursor-pointer md:flex text-text-white top-4 right-6" />
        <div onClick={forward} className="items-center justify-center hidden p-2 rounded-full cursor-pointer md:flex hover:bg-opacity-60 bg-background-light ">
        <IoIosArrowForward  className="text-xl text-text-black" />
        </div>
      </div>
    </div>
  );
};

export default OpenedExplore;
