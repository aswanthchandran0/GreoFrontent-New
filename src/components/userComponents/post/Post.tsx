import PostCard from "./PostCard"
import { useEffect, useState } from "react";
import { getUserFeedApi, likePostApi } from "../../../services/user/api";
import { IPost } from "../../../Types/postTypes";
const Post =()=>{
      const [post,setPost]= useState<IPost[]>([]);
      const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
      const [unlikedPosts, setUnlikedPosts] = useState<Set<string>>(new Set());
      //fetch user feed
      useEffect(()=>{
      const fetchUserFeed = async () => {
        const response = await getUserFeedApi();
        const fetchedPosts = response.data;
        setPost(fetchedPosts);
        
          // Initialize likedPosts set
      const likedSet = new Set<string>(fetchedPosts.filter((p: IPost) => p.isLiked).map((p: IPost) => p._id));
      setLikedPosts(likedSet);
      }
      fetchUserFeed()
      },[])

       // Toggle like status for a post
  const handleLike = (postId: string) => {
    const isCurrentlyLiked = likedPosts.has(postId);
    const updatedLikedPosts = new Set(likedPosts);
    const updatedUnlikedPosts = new Set(unlikedPosts);

    if (isCurrentlyLiked) {
      updatedLikedPosts.delete(postId);
      updatedUnlikedPosts.add(postId);
    } else {
      updatedLikedPosts.add(postId);
      updatedUnlikedPosts.delete(postId);
    }

    setLikedPosts(updatedLikedPosts);
    setUnlikedPosts(updatedUnlikedPosts);

    setPost((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, likeCount: isCurrentlyLiked ? post.likeCount - 1 : post.likeCount + 1 }
          : post
      )
    );
  };
  
   // Sync likes/unlikes with backend
   useEffect(() => {
    const syncLikesWithBackend = async () => {
      await likePostApi (Array.from(likedPosts), Array.from(unlikedPosts));
    };

    window.addEventListener("beforeunload", syncLikesWithBackend);
    return () => {
      syncLikesWithBackend();
      window.removeEventListener("beforeunload", syncLikesWithBackend);
    };
  }, [likedPosts, unlikedPosts]);


 
    return(
        <>
        <div className="flex flex-col space-y-3 overflow-y-scroll bg-background-light dark:bg-background-dark md:mt-3 scrollbar-hide">
        {post.map((p) => (
        <PostCard
          key={p._id}
          post={p}
          isLiked={likedPosts.has(p._id)}
          onLikeToggle={() => handleLike(p._id)}
        />
      ))}
        </div>
        </>
    )
}


export default Post