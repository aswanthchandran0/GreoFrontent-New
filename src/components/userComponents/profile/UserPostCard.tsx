import { FaRegHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { IPost } from "../../../Types/postTypes";
import { useState } from "react";
import Comments from "../post/Comments";
import { string } from "yup";

interface UserPostCardProps {
    post:IPost
    clearDeletePostCatch:(postId:string)=>void
    handleUpdatePostCatch:(postId:string,content:string)=>void
}
const UserPostCard:React.FC<UserPostCardProps> = ({post,clearDeletePostCatch,handleUpdatePostCatch}) =>{
    const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);

    
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

    return(
        <div onClick={handleCommentBox} className="relative p-1 cursor-pointer">
        <img  className="object-cover w-full h-full" src={post.mediaUrls[0]} alt="" />
        <div className="absolute inset-0 flex flex-row items-center justify-center w-full h-full space-x-2 transition-opacity duration-300 opacity-0 hover:opacity-50 hover:bg-black">
            <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
                <FaRegHeart className="text-2xl "/>
               <span className="text-text-white">{post.likeCount}</span>
            </div>
            <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
                <FaRegComment className="text-2xl "/>
               <span className="text-text-white">{post.commentCount}</span>
            </div>
        </div>

                 
{
          isCommentBoxOpen &&(
            <Comments post={post} isLiked={false} onLikeToggle={()=>false} onClose={handleCommentBox} clearDeletePostCatch={handleClearDeletePostCatch} handleUpdatePostCatch={handleUpdatePostCatch} onCommentCountChange={handlingCommentCount} />
          )
        }

        </div>
    )
}

export default UserPostCard