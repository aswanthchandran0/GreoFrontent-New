import React, { useState } from "react"
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { IoBookmarkOutline } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import { IPost } from "../../../Types/postTypes";
import Comments from "./Comments";
import { useNavigate } from "react-router-dom";
import { timeformat } from "../../../utils/formating";
import { BsThreeDots } from "react-icons/bs";
import PostMenu from "./PostMenu";
import LikedUsers from "./LikedUsers";
import SharingOption from "./SharingOption";
import { deleteNotification, deleteSavedItemApi, likePostApi, saveItemApi, saveNotification } from "../../../services/user/api";
import toast from "react-hot-toast";
import { SavedItemArrayElement } from "../../../Types/savedItemTypes";
import { useSocket } from "../../../context/SocketContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";


const defaultProfileImage = 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729611509~exp=1729615109~hmac=f56084f44329d588f81849bc897a8533f197f38f12e1fd5d08aca16c67adffb4&w=740'
interface PostCardProps {
  post: IPost;
  isLiked: boolean;
  id?: string;
  setPosts: React.Dispatch<React.SetStateAction<IPost[]>>;
}


const PostCard: React.FC<PostCardProps> = ({ post, isLiked,id,setPosts}) => {
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [isPostMenu,setIsPostMenu] = useState<boolean>(false)
  const [isLikedUsersList,setIsLikedUsersList] = useState<boolean>(false)
  const [isSharing,setIsSharing] = useState<boolean>(false)
  const [localIsLiked, setLocalIsLiked] = useState<boolean>(isLiked);
  const [loading,setLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  const {socket} = useSocket()
  const myId = useSelector((state:RootState)=> state.UserReducer.user?.id)
  // handle comment box open or close
  const handleCommentBox = ()=>{
    setIsCommentBoxOpen(!isCommentBoxOpen)
   }

   // navigate to profile
   const handleProfileNavigation = ()=>{
     navigate(`profile/${post.user_name}`)
   }

   // handling the commentCount 
   const handlingCommentCount = (commentCount:number)=>{
      post.commentCount = commentCount
   }

   // handle Post Saving

  const handlePostSaving = async(item:SavedItemArrayElement)=>{
    try{
     const response =   await saveItemApi(item)
     if(response.data == null){
      toast("already saved")
     }else{
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === item.itemId
            ? { ...post, isSaved: true }
            : post
        )
      );
      toast.success('saved')
     }
    }catch(err){
      console.log('error',err)
      toast.error("something went wrong in saving post")
    }
  }


  // unSave post 

  // Add this function inside the Post component
const handleUnsavePost = async (itemId: string) => {
  try {
    const response = await deleteSavedItemApi(itemId, "post");
    if (response.status === 200) { // Assuming 200 means success
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === itemId
            ? { ...post, isSaved: false }
            : post
        )
      );
      toast.success("unsaved");
    }
  } catch (error) {
    console.error("Failed to unsave post:", error);
    toast.error("Failed to unsave post. Please try again.");
  }
};


// onlike toggle  
const onLikeToggle = async () => {
  try {
    setLoading(true)
    let response;
    if (localIsLiked) {
      // If the post is currently liked, call the API to unlike
      response = await likePostApi([], [post._id]);
      if (response.status === 200) {
        setLocalIsLiked(false);
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === post._id
              ? { ...p, isLiked: false, likeCount: p.likeCount - 1 }
              : p
          )
        );

              
        // removing the notification when user unlike the post
        const notificationResponse = await deleteNotification(post._id,post.userId,'post')
        if(notificationResponse.data ==true){
          const notificationData = {
            userId:post.userId,
            entityId:post._id,
            initiatorId:myId,
            type:'post'
          }
          socket?.emit("removeNotification",notificationData)
        }
      
      }
    } else {
      // If the post is currently unliked, call the API to like
      response = await likePostApi([post._id], []);
      if (response.status === 200) {
        setLocalIsLiked(true);
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === post._id
              ? { ...p, isLiked: true, likeCount: p.likeCount + 1 }
              : p
          )
        );
       

          // notifiying other  user post was liked 
        
          const notificationMessage = 'liked your post'
          const SaveNotificatonResponse = await saveNotification(post.userId,post._id,post?.mediaUrls[0],notificationMessage,"post")
             if(SaveNotificatonResponse){
              socket?.emit("sendNotification",SaveNotificatonResponse.data)
             }

       
      }
    }

    console.log('Response from like API:', response);
  } catch (error) {
    console.error('Error in like/unlike toggle:', error);
  }finally{
    setLoading(false)
  }
};

    return(
        <>
      <div id={id} className="flex flex-col max-w-5xl shadow-md bg-background-light dark:bg-background-dark lg:w-[28rem]">
        <div className="flex h-full overflow-hidden ">
            <img className="object-cover w-full h-full" src={post.mediaUrls[0]} alt="post" />
        </div>

        <div className="flex flex-col p-2 space-y-3 ">

            <div className="flex flex-col">
            {/* <span className="text-4xl font-semibold font-zilla dark:text-text-white text-text-charcoal">The Weeknd</span> */}
            

            <div className="flex flex-row items-center space-x-2">
              <div className="w-10 h-10 overflow-hidden rounded-full">
                <img className="object-cover w-full h-full cursor-pointer" src={post?.profileImage?post.profileImage: defaultProfileImage} alt="" />
              </div>
              <div className="flex flex-row items-center w-11/12 ">
              <span onClick={handleProfileNavigation}  className="py-2 text-lg font-semibold cursor-pointer font-zilla dark:text-text-white text-text-charcoal">{post.name}</span>
              <BsThreeDots onClick={()=>setIsPostMenu(true)} className="ml-auto cursor-pointer font-golos text-text-lavenderGray"/>
              </div>
            </div>

            <div className="flex flex-row">
            <span className="font-golos text-text-lavenderGray">{post.user_name}</span>
            <span className="ml-auto font-golos text-text-lavenderGray">{timeformat(post?.createdAt) }</span>
            </div>
            </div>

            <div className="max-w-xl">
                <span className="font-golos text-text-darkGray">{post.content}</span>
            </div>


              <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center space-x-3">
              <div className="flex flex-col items-center justify-center ">
              {localIsLiked ? (
      <FaHeart 
        className={`text-2xl cursor-pointer text-red-500 ${loading ? 'animate-ping' : ''}`} 
        onClick={!loading ? onLikeToggle : undefined} // Disable onClick if loading
      />
    ) : (
      <FaRegHeart 
        className={`text-2xl cursor-pointer dark:text-text-white text-text-charcoal ${loading ? 'animate-ping' : ''}`} 
        onClick={!loading ? onLikeToggle : undefined} // Disable onClick if loading
      />
    )}
    
  {!loading && (
    <span onClick={() => setIsLikedUsersList(!isLikedUsersList)} className="cursor-pointer font-golos dark:text-text-white text-text-charcoal">
      {post.likeCount || 0}
    </span>
  )}
</div>


                <div className="flex flex-col items-center justify-center">
             <FaRegComment onClick={handleCommentBox}  className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
             <span  className="font-golos dark:text-text-white text-text-charcoal">{post.commentCount ||0}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
              <IoIosShareAlt onClick={()=>setIsSharing(!isSharing)} className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
              <span className="font-golos dark:text-text-white text-text-charcoal">0</span>
                </div>
            </div>

            <div className="flex flex-col">
              {
              post.isSaved ?
              <IoBookmark  onClick={() => handleUnsavePost(post._id)} className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
              :

            <IoBookmarkOutline onClick={()=>handlePostSaving({itemId:post._id,type:'post'})} className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
              }
            </div>
            
           </div>
       <span onClick={handleCommentBox} className="text-text-lavenderGray font-golos hover:cursor-pointer">view all comments</span>
           
           {/* <div className="flex flex-row items-center justify-center ml-auto mr-6 space-x-2">
              <div className="overflow-hidden rounded-full w-7 h-7">
                <img className="object-cover w-full h-full cursor-pointer" src="logo.png" alt="" />
              </div>
              <span className="cursor-pointer font-golos dark:text-text-white text-text-charcoal">Abel Makkonen Tesfaye</span>
            </div> */}
           
        </div>

           
        {
          isCommentBoxOpen &&(
            <Comments post={post} isLiked={isLiked} onLikeToggle={onLikeToggle} onClose={handleCommentBox} onCommentCountChange={handlingCommentCount} />
          )
        }
        
        </div>   
        
 {
    isPostMenu &&  <PostMenu onClose={()=>setIsPostMenu(false)}  postId={post._id} postContent={post.content}/>

    }

{
  isLikedUsersList && <LikedUsers postId={post._id} onClose={()=> setIsLikedUsersList(false)}/>
}
{
  isSharing && <SharingOption postId={post._id} onClose={()=>setIsSharing(!isSharing)}/>
}
        </>
    )
}

export default PostCard