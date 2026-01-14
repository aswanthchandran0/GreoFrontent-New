
import { IoClose } from "react-icons/io5";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { IoBookmarkOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import {  getCommentsApi, postCommentApi, rollCommentSentAPi, rollGetCommentsApi, toggleLikeApi } from "../../../services/user/api";
import { CommentsDto, IComment,  } from "../../../Types/commentTypes";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { HiSpeakerWave } from "react-icons/hi2";
import { HiSpeakerXMark } from "react-icons/hi2";
import { IRoll } from "../profile/UserPosts";
import Comment from "../post/Comment";
import RollMenu from "./RollMenu";
import { ExploreI } from "../../../Types/exploreTypes";
import toast from "react-hot-toast";
 

interface OpenedRollProps {
  // tactical in roll type
  roll: IRoll | ExploreI;
//   isLiked: boolean;
  // onLikeToggle: () => void;
  onClose: () => void;
}


// staring


const OpenedRoll: React.FC<OpenedRollProps> = ({roll,onClose}) =>  
  {
  console.log('roll in open post',roll)
   const [comment,setComment] = useState<string>('')
   const [comments, setComments] = useState<IComment[]>([]);
  const loggedUser = useSelector((state: RootState) => state.UserReducer.user);
   const [commentsCount,setCommentsCount] = useState(roll.commentCount || 0)
   const [isPlaying, setIsPlaying] = useState<boolean>(false);
   const [isAudioOn,setIsAudioOn] = useState<boolean>(true)
   const [isRollMenu, setIsRollMenu] = useState<boolean>(false);
     const [localIsLiked, setLocalIsLiked] = useState<boolean>(roll.isLiked || false);
     const [likeCount, setLikeCount] = useState<number>(roll.likeCount || 0);
const [loading, setLoading] = useState<boolean>(false);

  useEffect(()=>{
    try{
     const fetchComments = async()=>{
       const response = await getCommentsApi(roll.id ?? "","reel")
       const commentsArray: IComment[] = Array.isArray(response.data)
        ? response.data
        : [response.data];

      setComments(commentsArray);
     
     console.log('response from the comments',response.data[0])    
     }
     fetchComments()
    }catch(err){
      console.log('err',err)
    }
  },[])

  console.log('role in opend file',roll)

   
  const handleAddComment = (newComment: IComment) => {
  setComments(prevComments => [newComment, ...prevComments]);
};
   // comment sent 
   const handleCommentPost= async()=>{
    try{
     const response =  await postCommentApi(roll?.id ?? '','reel',comment)
    response.data.profileImage = loggedUser?.profileImage
        response.data.username = loggedUser?.username

        handleAddComment(response.data);

     setComment('')
     setCommentsCount((prev) => prev +1)
    }catch(err){
      console.log('error',err)
    }
   }


   const navigate = useNavigate()
   const loggedUserName = useSelector((state:RootState)=> state.UserReducer.user?.username)

   // profile navigation
    const handleProfileNavigation = ()=>{
    // TACTICAL: Handle fallback for userName based on possible variations in API data
      if("username" in roll && roll.username && roll.username !== loggedUserName){
        navigate(`/profile/${roll.username}`)
      }
    }

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

    
const onLikeToggle = async () => {
  if (loading) return;
  setLoading(true);

  try {
    const response = await toggleLikeApi(roll.id ?? "", "reel"); // "reel" type
    const { liked, totalLikes } = response.data;

    // Update local state
    setLocalIsLiked(liked);
    setLikeCount(totalLikes);

  }catch(err){
console.error("Failed to toggle like:", err);
    toast.error("Failed to update like status");
  } finally {
    setLoading(false);
  }
};

      
  

  
 return (
  <div
    onClick={onClose}
    className="fixed inset-0 z-20 flex items-center justify-center w-full h-full py-5 bg-opacity-50 bg-background-dark"
  >
    <div
      className="flex flex-row w-full h-full max-w-4xl bg-background-light dark:bg-background-dark "
      onClick={(e) => e.stopPropagation()}
    >
      {/* post side  */}
      <div className="relative flex items-center justify-center hidden w-2/5 h-full border-r cursor-pointer bg-background-dark md:flex border-text-charcoal ">
        <div  onClick={handlePlayPause}>
        <video
              id="rollVideo"
              src={'mediaUrl' in roll ? roll.mediaUrl : ''}
              className="object-contain w-full h-full rounded-md"
              autoPlay
              loop
              muted={!isAudioOn}
            />
        </div>
        {
            isAudioOn?
            <HiSpeakerWave onClick={()=>setIsAudioOn(!isAudioOn)} className="absolute text-xl right-3 bottom-3 text-text-white" />
            :
            <HiSpeakerXMark onClick={()=>setIsAudioOn(!isAudioOn)} className="absolute text-xl right-3 bottom-3 text-text-white" />

        }
      </div>
      {/* post side end */}

      {/* comment side  */}
      <div className="flex flex-col w-full md:w-3/5 ">
        {/* header */}
        <div className="flex flex-row items-center w-full gap-2 p-2 border-b border-text-charcoal">
          <div className="w-12 h-12 overflow-hidden rounded-full">
            <img  className="object-cover w-full h-full cursor-pointer" src={roll.profileImage || DEFAULT_PROFILE_IMAGE} alt="" />
          </div>
          <span onClick={handleProfileNavigation} className="font-bold cursor-pointer text-text-black font-golos dark:text-text-white">
          {('username' in roll ? roll.username : 'Unknown User')}
          </span>
          <div className="flex flex-row ml-auto space-x-3 text-xl font-semibold cursor-pointer text-text-black dark:text-text-white">
            {/* {loggedUser?.user_name === username && (
                          <BsThreeDots onClick={() => setIsRollMenu(true)} />
                        )} */}
          <IoClose
            onClick={onClose}
            className="ml-auto text-xl cursor-pointer text-text-black dark:text-text-white" />
        </div>
        </div>
        {/* comment box */}

        <div className="w-full h-full p-2 space-y-5 overflow-y-auto scrollbar-hide ">
           {
            comments?.map((comment,index)=>{
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
            {localIsLiked ? (
    <FaHeart
      className={`text-2xl cursor-pointer text-red-500 ${loading ? 'animate-ping' : ''}`}
      onClick={!loading ? onLikeToggle : undefined}
    />
  ) : (
    <FaRegHeart
      className={`text-2xl cursor-pointer dark:text-text-white text-text-charcoal ${loading ? 'animate-ping' : ''}`}
      onClick={!loading ? onLikeToggle : undefined}
    />
  )}
  {!loading && (
    <span className="font-golos dark:text-text-white text-text-charcoal">
      {likeCount}
    </span>
  )}

              </div>


              <div className="flex flex-col items-center justify-center">
                <FaRegComment className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />
                <p className="text-white ">{commentsCount}</p>
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
               className="p-2 outline-none w-96 bg-background-light dark:bg-background-dark text-text-black dark:text-text-white "
              type="text"
              placeholder="Add a comment..." />
            <p  onClick={handleCommentPost} className="text-blue-500 cursor-pointer font-golos">post</p>
          </div>
        </div>
      </div>
      {/* comment side end */}
    </div>
    {
      isRollMenu && <RollMenu onClose={()=>setIsRollMenu(false)} />
    }
  </div>
);

}
export default OpenedRoll;

