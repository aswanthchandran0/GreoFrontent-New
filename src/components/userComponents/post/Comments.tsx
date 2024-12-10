import { IPost } from "../../../Types/postTypes";
import { IoClose } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { IoBookmarkOutline } from "react-icons/io5";
import Comment from "./Comment";
import { useEffect, useState } from "react";
import { commentSentAPi, getCommentsApi } from "../../../services/user/api";
import { CommentsDto, sendComment } from "../../../Types/commentTypes";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
 

const defaultProfileImage = 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729611509~exp=1729615109~hmac=f56084f44329d588f81849bc897a8533f197f38f12e1fd5d08aca16c67adffb4&w=740'
interface CommetsProps {
  post: IPost;
  isLiked: boolean;
  onLikeToggle: () => void;
  onClose: () => void;
}
const Comments: React.FC<CommetsProps> = ({
  post,
  isLiked,
  onLikeToggle,
  onClose,
}) => 
  
{
   const [comment,setComment] = useState<string>('')
   const [comments,setComments] = useState<CommentsDto | null>(null)
   console.log('comments',comments)

  useEffect(()=>{
    try{
     const fetchComments = async()=>{
       const response = await getCommentsApi(post._id)
       setComments(response.data[0])
     console.log('response from the comments',response.data[0])    
     }
     fetchComments()
    }catch(err){
      console.log('err',err)
    }
  },[])


    const handleAddComment = (newComment)=>{
      if(comments){
        const updatedComments = {...comments}
        updatedComments.comments.unshift(newComment)
        setComments(updatedComments)
      }
    }
   // comment sent 
   const handleCommentPost= async()=>{
    try{
     const response =  await commentSentAPi(post._id,comment)
     handleAddComment(response.data)
     setComment('')
    }catch(err){
      console.log('error',err)
    }
   }


   const navigate = useNavigate()
   const loggedUserName = useSelector((state:RootState)=> state.UserReducer.user?.user_name)

   // profile navigation
    const handleProfileNavigation = ()=>{
      if(post.user_name !== loggedUserName){
        navigate(`/profile/${post.user_name}`)
      }
    }
  
 return (
  <div
    onClick={onClose}
    className="fixed inset-0 z-20 flex items-center justify-center w-full h-full py-5 bg-opacity-50 bg-background-dark"
  >
    <div
      className="flex flex-row w-full h-full max-w-4xl bg-background-dark "
      onClick={(e) => e.stopPropagation()}
    >
      {/* post side  */}
      <div className="flex items-center justify-center hidden w-2/5 h-full border-r cursor-pointer md:flex border-text-charcoal ">
        <div>
          <img src={post.mediaUrls[0]} alt="" />
        </div>
      </div>
      {/* post side end */}

      {/* comment side  */}
      <div className="flex flex-col w-full md:w-3/5 ">
        {/* header */}
        <div className="flex flex-row items-center w-full gap-2 p-2 border-b border-text-charcoal">
          <div className="w-12 h-12 overflow-hidden rounded-full">
            <img
              className="object-cover w-full h-full cursor-pointer"
              src={post?.profileImage?post.profileImage: defaultProfileImage}
              alt="" />
          </div>
          <span onClick={handleProfileNavigation} className="cursor-pointer text-text-white">
            {post.user_name}
          </span>
          <IoClose
            onClick={onClose}
            className="ml-auto text-xl cursor-pointer text-text-white" />
        </div>

        {/* comment box */}

        <div className="w-full h-full p-2 space-y-5 overflow-y-auto scrollbar-hide ">
           {
            comments?.comments.map((comment,index)=>{
              return(
              <Comment key={index} comment={comment} />
              )
            })
           }
        </div>
        {/* end comment box*/}

        {/* footer side */}
        <div className="flex flex-col items-center justify-between w-full mt-auto border-t border-text-charcoal">
          {/* post details */}
          <div className="flex flex-row items-center justify-between w-full p-2">

            <div className="flex flex-row items-center p-1 space-x-3">

              <div className="flex flex-col items-center justify-center">
                {isLiked ? (
                  <FaHeart
                    className="text-2xl text-red-500 cursor-pointer"
                    onClick={onLikeToggle} />
                ) : (
                  <FaRegHeart
                    className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"
                    onClick={onLikeToggle} />
                )}
                {/* <span className="font-golos dark:text-text-white text-text-charcoal">
          {post.likeCount}
        </span> */}
              </div>


              <div className="flex flex-col items-center justify-center">
                <FaRegComment className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
              </div>

              <div className="flex flex-col items-center justify-center">
                <IoIosShareAlt className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
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
              onChange={(e)=> setComment(e.target.value)}
              onKeyDown={(e)=> e.key === 'Enter' && handleCommentPost()}
               className="p-2 outline-none w-96 bg-background-dark text-text-white "
              type="text"
              placeholder="Add a comment..." />
            <p  onClick={handleCommentPost} className="text-blue-500 cursor-pointer font-golos">post</p>
          </div>
        </div>
      </div>
      {/* comment side end */}
    </div>
  </div>
);

}
export default Comments;
