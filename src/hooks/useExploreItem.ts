import { useState, useEffect } from "react";
import { getCommentsApi, postCommentApi, rollGetCommentsApi } from "../services/user/api";
import { IComment } from "../Types/commentTypes";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";


export function useExploreItem(item: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<IComment[] | []>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState("");
const loggedUser = useSelector((state: RootState) => state.UserReducer.user);
 const [commentsCount, setCommentsCount] = useState<number>(item.commentCount || 0);
  console.log("comment getting in use epxllore item ",comment)
  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const id = item._id ?? item.id ?? "";
      console.log('id get in fetch comment',id)
      if (!id) return;

      const response =
        item.type === "reel"
          ? await getCommentsApi(id ?? "","reel")
          :  await getCommentsApi(id ?? "","post")

            const commentsArray: IComment[] = Array.isArray(response.data)
                  ? response.data
                  : [response.data];
console.log("comments array ",commentsArray)
      setComments(commentsArray);
    } catch (err) {
      console.error(err);
      setCommentError("Failed to load comments.");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [item]);

  const togglePlay = () => {
    const video = document.getElementById("rollVideo") as HTMLVideoElement;
    if (video) {
      isPlaying ? video.pause() : video.play();
      setIsPlaying(!isPlaying);
    }
  };


  
    const handleAddComment = (newComment: IComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  };
     // comment sent 
     const handleCommentPost= async()=>{
      try{
         const id = item._id ?? item.id ?? "";
       const response =  await postCommentApi(id ?? '','reel',comment)
         response.data.profileImage = loggedUser?.profileImage
          response.data.username = loggedUser?.username
  
          handleAddComment(response.data);
  
       setComment('')
       setCommentsCount((prev) => prev +1)
      }catch(err){
        console.log('error',err)
      }
     }
  

  return {
    isPlaying,
    isAudioOn,
    comment,
    comments,
    loadingComments,
    commentError,
    togglePlay,
    setComment,
    setIsAudioOn,
    handleCommentPost
  };
}
