import { FaRegHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { IPost } from "../../../Types/postTypes";
import { useState } from "react";
import Comments from "../post/Comments";
import toast from "react-hot-toast";
import { toggleLikeApi } from "../../../services/user/api";


interface UserPostCardProps {
    post:IPost
    clearDeletePostCatch?:(postId:string)=>void
    handleUpdatePostCatch?:(postId:string,content:string)=>void
}
const UserPostCard:React.FC<UserPostCardProps> = ({post, clearDeletePostCatch = () => {},handleUpdatePostCatch = () => {}}) =>{
    const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
    const [localIsLiked, setLocalIsLiked] = useState<boolean>(post.isLiked);
    const [likeCount,setLikeCount] = useState(post.likeCount)
    const [loading,setLoading] = useState<boolean>(false)
    
  // handle comment box open or close
  const handleCommentBox = ()=>{
    setIsCommentBoxOpen(!isCommentBoxOpen)
   }

   const handleClearDeletePostCatch = (postId:string)=>{
    clearDeletePostCatch(postId)
    setIsCommentBoxOpen(false)
   }

   // handling the commentCount 
   const handlingCommentCount = (commentCount:number)=>{
    post.commentCount = commentCount
 }


 

const onLikeToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await toggleLikeApi(post.id??"", "post");
      const { liked, totalLikes } = response.data;

      setLocalIsLiked(liked);
      setLikeCount(totalLikes)

     
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    } finally {
      setLoading(false);
    }
  };



    return(
        <div onClick={handleCommentBox} className="relative p-1 cursor-pointer">
        <img  className="object-cover w-full h-full" src={post.mediaUrls[0]} alt="" />
        <div className="absolute inset-0 flex flex-row items-center justify-center w-full h-full space-x-2 transition-opacity duration-300 opacity-0 hover:opacity-50 hover:bg-black">
            <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
                <FaRegHeart className="text-2xl "/>
               <span className="text-text-white">{localIsLiked}</span>
               <span className="text-text-white">{likeCount}</span>
            </div>
            <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
                <FaRegComment className="text-2xl "/>
               <span className="text-text-white">{post.commentCount}</span>
            </div>
        </div>

                 
{
          isCommentBoxOpen &&(
            <Comments post={post} isLiked={localIsLiked} onLikeToggle={onLikeToggle}onClose={handleCommentBox} clearDeletePostCatch={handleClearDeletePostCatch} handleUpdatePostCatch={handleUpdatePostCatch} onCommentCountChange={handlingCommentCount}  likeCount={likeCount}  />
          )
        }

        </div>
    )
}

export default UserPostCard