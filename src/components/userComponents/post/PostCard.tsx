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

const defaultProfileImage = 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729611509~exp=1729615109~hmac=f56084f44329d588f81849bc897a8533f197f38f12e1fd5d08aca16c67adffb4&w=740'
interface PostCardProps {
  post: IPost;
  isLiked: boolean;
  onLikeToggle: () => void;
}


const PostCard: React.FC<PostCardProps> = ({ post, isLiked, onLikeToggle }) => {
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const navigate = useNavigate()
  // handle comment box open or close
  const handleCommentBox = ()=>{
    setIsCommentBoxOpen(!isCommentBoxOpen)
   }

   // navigate to profile
   const handleProfileNavigation = ()=>{
     navigate(`profile/${post.user_name}`)
   }
    return(
        <>
      <div className="flex flex-col max-w-5xl shadow-md bg-background-light dark:bg-background-dark lg:w-[28rem]">
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
              <span onClick={handleProfileNavigation}  className="py-2 text-lg font-semibold cursor-pointer font-zilla dark:text-text-white text-text-charcoal">{post.name}</span>
            </div>

            
            <span className="font-golos text-text-lavenderGray">{post.user_name}</span>
            </div>

            <div className="max-w-xl">
                <span className="font-golos text-text-darkGray">{post.content}</span>
            </div>


              <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center space-x-3">
                <div className="flex flex-col items-center justify-center">
                {isLiked ? (
                <FaHeart className="text-2xl text-red-500 cursor-pointer" onClick={onLikeToggle} />
              ) : (
                <FaRegHeart className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"  onClick={onLikeToggle}/>
              )}
              <span className="font-golos dark:text-text-white text-text-charcoal">{post.likeCount}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
             <FaRegComment onClick={handleCommentBox}  className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
             <span  className="font-golos dark:text-text-white text-text-charcoal">{post.commentCount}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
              <IoIosShareAlt className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
              <span className="font-golos dark:text-text-white text-text-charcoal">0</span>
                </div>
            </div>

            <div className="flex flex-col">
            <IoBookmarkOutline className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
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
            <Comments post={post} isLiked={isLiked} onLikeToggle={onLikeToggle} onClose={handleCommentBox} />
          )
        }
        
        </div>   
        

        </>
    )
}

export default PostCard