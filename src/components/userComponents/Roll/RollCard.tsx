import ReadMoreAndLess from 'react-read-more-read-less';
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
// import { IoBookmarkOutline } from "react-icons/io5";
// import { IoBookmark } from "react-icons/io5";
import { IRoll } from '../profile/UserPosts';
import { useEffect, useRef, useState } from 'react';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { DEFAULT_PROFILE_IMAGE } from '../../../assets/images';
import { useNavigate } from 'react-router-dom';
import { CommentsDto } from '../../../Types/commentTypes';
import { deleteSavedItemApi, rollCommentSentAPi, rollGetCommentsApi, saveItemApi } from '../../../services/user/api';
import Comment from '../post/Comment';
import { IoBookmark, IoBookmarkOutline, IoClose } from 'react-icons/io5';
import { SavedItemArrayElement } from '../../../Types/savedItemTypes';
import toast from 'react-hot-toast';

interface RollCardProps{
   roll:IRoll,
   isAudioOn:boolean
   handleIsAudioOn:()=>void
   onLikeToggle: ()=>void
   setRolls: React.Dispatch<React.SetStateAction<IRoll[]>>;
}
const RollCard:React.FC<RollCardProps> = ({roll,isAudioOn,handleIsAudioOn,onLikeToggle,setRolls})=>{
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoInView,setIsVideoInview]=  useState(false)
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<CommentsDto | null>(null);
  const [commentsCount, setCommentsCount] = useState<number>(roll.commentCount || 0);
  const navigate = useNavigate()
  
  useEffect(()=>{
    const observer = new IntersectionObserver((entries)=>{
       entries.forEach((entry)=>{
        if(entry.isIntersecting){
          setIsVideoInview(true)
        }else{
          setIsVideoInview(false)
        }
       },)
       
       
    },
  {threshold:0.5}
  )

  if(videoRef.current){
    observer.observe(videoRef.current)
    
  }
    return ()=>{
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    }
  },[])


  // comment handling 


  useEffect(() => {
    if (showComments) {
      const fetchComments = async () => {
        try {
          const response = await rollGetCommentsApi(roll._id);
          setComments(response.data[0]);
          setCommentsCount(response.data[0]?.comments?.length || 0);
        } catch (err) {
          console.error("Error fetching comments:", err);
        }
      };
      fetchComments();
    }
  }, [showComments, roll]);

  const handleAddComment = (newComment: any) => {
    if (comments) {
      const updatedComments = { ...comments };
      updatedComments.comments.unshift(newComment);
      setComments(updatedComments);
      setCommentsCount((prevCount) => prevCount + 1);
    }
  };
  
  const handleCommentPost = async () => {
    try {
      const response = await rollCommentSentAPi(roll._id, comment);
      handleAddComment(response.data);
      setComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };


  // handle roll Saving



    const handleRollSaving = async(item:SavedItemArrayElement)=>{
      try{
       const response =   await saveItemApi(item)
       if(response.data == null){
        toast("already saved")
       }else{
        setRolls((prevRolls) =>
          prevRolls.map((roll) =>
            roll._id === item.itemId
              ? { ...roll, isSaved: true }
              : roll
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
  const handleUnsaveRoll = async (itemId: string) => {
    try {
      const response = await deleteSavedItemApi(itemId, "roll");
      if (response.status === 200) { // Assuming 200 means success
        setRolls((prevRolls) =>
          prevRolls.map((roll) =>
            roll._id === itemId
              ? { ...roll, isSaved: false }
              : roll
          )
        );
        toast.success("unsaved");
      }
    } catch (error) {
      console.error("Failed to unsave post:", error);
      toast.error("Failed to unsave post. Please try again.");
    }
  };

  
    return(
        <>
        <div className='flex flex-row'>

        
<div className="relative w-[351.84px] h-[625.50px] ">
 <video
 className="object-cover w-full h-full rounded"
 ref={videoRef}
 src={isVideoInView ? roll.mediaUrl : ""}
 autoPlay
 loop
 muted={!isAudioOn}
 ></video>

 <div className="absolute bottom-0 left-0 p-4 ">
   <div className="flex flex-col">
<div className="flex flex-row items-center gap-2">
    <div className="w-10 h-10 overflow-hidden rounded-full cursor-pointer">
        <img className="w-full h-full" src={roll.profileImage || DEFAULT_PROFILE_IMAGE} alt="" />
    </div>
   <span onClick={()=>navigate(`/profile/${roll.userName}`)} className="cursor-pointer text-text-white font-golos">{roll.userName}</span>
   {/* <button className="p-1 text-sm font-bold border rounded text-text-white font-gaolos ">Follow</button> */}
</div>

<div className='flex cursor-pointer min-w-80 text-text-white font-outfit'>
<ReadMoreAndLess

charLimit={40}
moreText='...more'
lessText='show less'
readMoreClassName='text-text-white font-golos text-sm '
readLessClassName='text-text-white font-golos text-sm'
      >
{roll.content}
           
      </ReadMoreAndLess> 
    
</div>

<div className='absolute right-0 flex flex-col p-4 py-5 mt-auto space-y-3 bottom-12 sm:hidden'>
  <div className='flex flex-col items-center justify-center font-bold cursor-pointer text-text-white font-golos'>
    {
      roll.isLikedByViewingUser ?
      <FaHeart  onClick={onLikeToggle} className='text-2xl text-red-500'/>
      :
      <FaRegHeart  onClick={onLikeToggle} className='text-2xl '/>

    }
   <span>{roll.likeCount}</span>
  </div>

  <div  onClick={() => setShowComments(!showComments)} className='flex flex-col items-center justify-center font-bold cursor-pointer text-text-white font-golos'>
   <FaRegComment  className='text-2xl '/>
   <span>{commentsCount}</span>
  </div>

  <div className='flex flex-col items-center justify-center font-bold cursor-pointer text-text-white font-golos'>
   <IoIosShareAlt className='text-2xl '/>
  </div>

  <div className='flex flex-col items-center justify-center font-bold cursor-pointer text-text-white font-golos'>
      {
                  roll.isSaved ?
                  <IoBookmark  onClick={() => handleUnsaveRoll(roll._id)} className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"/>
                  :
  <IoBookmarkOutline onClick={()=>handleRollSaving({itemId:roll._id,type:"roll"})} className='text-2xl ' />
      }
  </div>

  <div className='flex flex-col items-center justify-center font-bold cursor-pointer text-text-white font-golos'>
  {
              isAudioOn?
              <HiSpeakerWave onClick={handleIsAudioOn}  className='text-2xl cursor-pointer' />
              :
              <HiSpeakerXMark onClick={handleIsAudioOn}  className='text-2xl cursor-pointer' />
  
          }
  </div>
</div>
   </div>
 </div>
</div>

<div className='flex-col hidden p-4 py-5 mt-auto space-y-3 sm:flex'>
  <div className='flex flex-col items-center justify-center cursor-pointer dark:text-text-white'>
  {
      roll.isLikedByViewingUser ?
      <FaHeart  onClick={onLikeToggle} className='text-2xl text-red-500'/>
      :
      <FaRegHeart  onClick={onLikeToggle} className='text-2xl '/>

    }
   <span>{roll.likeCount}</span>
  </div>

  <div  onClick={() => setShowComments(!showComments)} className='dark:text-text-white'>
   <FaRegComment className='text-2xl cursor-pointer'/>
   <span>{commentsCount}</span>
  </div>

  <div className='dark:text-text-white'>
   <IoIosShareAlt className='text-2xl cursor-pointer'/>
  </div>

  <div className='dark:text-text-white'>

  {
                  roll.isSaved ?
                  <IoBookmark  onClick={() => handleUnsaveRoll(roll._id)} className='text-2xl cursor-pointer'/>
                  :
              <IoBookmarkOutline onClick={()=>handleRollSaving({itemId:roll._id,type:"roll"})} className='text-2xl cursor-pointer' />
      }
            </div>

  <div className='dark:text-text-white'>
   {
              isAudioOn?
              <HiSpeakerWave onClick={handleIsAudioOn}  className='text-2xl cursor-pointer' />
              :
              <HiSpeakerXMark onClick={handleIsAudioOn}  className='text-2xl cursor-pointer' />
  
          }
           </div>
</div>

  {/* Comment Section */}

   {/* <div className="flex flex-row items-center w-full gap-2 p-2 border-b border-text-charcoal">
            <div className="w-12 h-12 overflow-hidden rounded-full">
              <img  className="object-cover w-full h-full cursor-pointer" src={roll.profileImage || DEFAULT_PROFILE_IMAGE} alt="" />
            </div>
            <span onClick={()=>navigate(`profile/${roll.userName}`)} className="cursor-pointer text-text-white">
              {roll.userName}
            </span>
            <IoClose
              onClick={() => setShowComments(!showComments)}
              className="ml-auto text-xl cursor-pointer text-text-white" />
          </div> */}

  {showComments && (
        // <div className="p-4 mt-2 rounded-md bg-background-dark">
        //   <div className="space-y-2 overflow-y-auto max-h-60">
        //     {comments?.comments.map((comment, index) => (
        //       <Comment key={index} comment={comment} />
        //     ))}
        //   </div>
        //   <div className="flex items-center mt-2 space-x-2">
        //     <input
        //       value={comment}
        //       onChange={(e) => setComment(e.target.value)}
        //       onKeyDown={(e) => e.key === "Enter" && handleCommentPost()}
        //       className="flex-grow p-2 outline-none bg-background-dark text-text-white"
        //       placeholder="Add a comment..."
        //     />
        //     <button onClick={handleCommentPost} className="text-blue-500 font-golos">
        //       Post
        //     </button>
        //   </div>
        // </div>


        <div className="flex flex-col w-full md:w-3/5 ">
        {/* header */}
        <div className="flex flex-row items-center w-full gap-2 p-2 border-b border-text-charcoal">
          <div className="w-12 h-12 overflow-hidden rounded-full">
            <img  className="object-cover w-full h-full cursor-pointer" src={roll.profileImage || DEFAULT_PROFILE_IMAGE} alt="" />
          </div>
          <span onClick={()=>navigate(`profile/${roll.userName}`)} className="cursor-pointer text-text-white">
            {roll.userName}
          </span>
          <IoClose
            onClick={() => setShowComments(!showComments)}
            className="ml-auto text-xl cursor-pointer text-text-white" />
        </div>

        {/* comment box */}

        <div className="w-full p-2 space-y-5 overflow-y-auto h-96 scrollbar-hide ">
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
            
              </div>


            
            </div>
            <div className="flex flex-col">
              <IoBookmarkOutline onClick={()=>handleRollSaving({itemId:roll._id,type:"roll"})} className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
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
      )}
</div>
        </>
    )
}

export default RollCard