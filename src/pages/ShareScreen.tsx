import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IPost } from "../Types/postTypes";
import { getSingePostApi,  } from "../services/user/api";
import Comments from "../components/userComponents/post/Comments";
import { AiOutlineHome } from "react-icons/ai";
import toast from "react-hot-toast";

const ShareScreen = () => {
  const { postId } = useParams();
  const [post, setPost] = useState<IPost | null>(null);
  const [isPostOpen, setIsPostOpen] = useState(true);
  const [isLiked,setIsLiked] = useState(false)
  const navigate = useNavigate()
  // post fetching 
  useEffect(() => {
    if (!postId) return;
    const fetch = async () => {
      const response = await getSingePostApi(postId);
      setPost(response.data);
      setIsLiked(response.data.isLiked)
    };
    fetch();
  }, [postId]);

  const handlePostOpen = ()=>{
    setIsPostOpen(!isPostOpen)
   }

// handling like 
  // const handleLike = async ()=>{
  //   try{
  //     if(!isLiked){
  //       console.log('request was reaching inside isliked')
  //       await likePostApi([post?._id ??''],[])
  //       setIsLiked(!isLiked)
  //     }else{
  //       await likePostApi([],[post?._id??''])
  //       setIsLiked(!isLiked)
  //     }
  //   }catch(err){
  //     console.log(err)
  //     toast.error("something went wrong in liking")
  //   }
  
  // }

  console.log('post',post)
  return (
    <div className="flex h-full dark:bg-background-dark bg-background-light md:max-h-[90vh] max-h-[83vh] lg:px-16 justify-center scroll-smooth">
    {isPostOpen ? (
      post ? (
        <></>
        // <Comments
        //   post={post}
        //   isLiked={isLiked}
        //   onLikeToggle={handleLike}
        //   onClose={handlePostOpen}
        // />
      ) : (
        <p>Loading...</p> // Optional loading indicator
      )
    ) : (
      <div className="flex h-full dark:bg-background-dark bg-background-light md:max-h-[90vh] max-h-[83vh] lg:px-16 justify-center scroll-smooth">
      <div className="flex flex-col items-center justify-center gap-3">
      <AiOutlineHome className="text-7xl text-text-charcoal " />
      <div className="flex flex-row gap-2">
      <button onClick={handlePostOpen} className="p-1 px-2 rounded text-text-white bg-background-charcoal"> Show Post </button>
      <button onClick={()=>navigate('/')} className="p-1 px-2 rounded text-text-white bg-background-charcoal"> Back to Home </button>
      </div>
      </div>
      </div>
    )}
  </div>
  
  );
};

export default ShareScreen;
