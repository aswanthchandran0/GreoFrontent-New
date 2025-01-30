import PostCard from "./PostCard";
import { useEffect, useRef, useState } from "react";
import { getUserFeedApi} from "../../../services/user/api";
import { IPost } from "../../../Types/postTypes";
import { useNavigate, useOutletContext } from "react-router-dom";
import { LoaderSpinner } from "../../ui/LoadingSpinner";
import Lottie from 'lottie-react';


interface OutletContext {
  newPosts: IPost | null;
}

const Post = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const { newPosts } = useOutletContext<OutletContext>();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const skipRef = useRef(0);
  const [limit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null); 
  const [connectAnimation, setConnectAnimation] = useState(null);
  const navigate = useNavigate()
 console.log("posts ",posts)
  //fetch user feed
  const fetchUserFeed = async () => {
    if (loading || !hasMorePosts) return; // Prevent multiple simultaneous requests
    setLoading(true);
    try {
      const response = await getUserFeedApi(skipRef.current, limit);
      const fetchedPosts = response.data;

      setPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map((post) => post._id));
        const uniquePosts = fetchedPosts.filter(
          (post:IPost) => !existingPostIds.has(post._id)
        );
        return [...prevPosts, ...uniquePosts];
      });

     // Merge new liked posts with existing liked posts
    setLikedPosts((prevLikedPosts) => {
      const newLikedSet = new Set<string>(
        fetchedPosts.filter((p: IPost) => p.isLiked).map((p: IPost) => p._id)
      );
      return new Set([...prevLikedPosts, ...newLikedSet]);
    });

      if (fetchedPosts.length < limit) {
        setHasMorePosts(false);
      }
      
      skipRef.current += limit; // Update the skip value for the next fetch
      console.log("skip ref",skipRef.current)
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFeed();
  }, []);

   console.log("post legnth",posts.length)
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const bottom = scrollHeight - scrollTop <= clientHeight + 100; // Add a small buffer (50px)
      console.log({ scrollTop, scrollHeight, clientHeight });
      const nearBottom = scrollHeight - scrollTop <= clientHeight + 100;
      if (nearBottom) {
        console.log("Near bottom detected");
      }
      
      if (bottom && !loading && hasMorePosts) {
        fetchUserFeed(); // Trigger data fetch when near the bottom
      }
    }
  };
  


 
  // Add scroll event listener
  useEffect(() => {
    const currentContainer = containerRef.current;
    console.log("Scrolling element:", containerRef.current);
    if (currentContainer) {
      currentContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener("scroll", handleScroll); // Clean up listener
      }
    };
  }, [loading, hasMorePosts]);




  useEffect(() => {
    if (newPosts) {
      setPosts((prevPosts) => [newPosts, ...prevPosts]);
    }
  }, [newPosts]);

  

  // fetching lottie files

  useEffect(() => {
    // Fetch the Lottie animations
 
    fetch('https://assets9.lottiefiles.com/packages/lf20_bp5lntrf.json')
      .then(response => response.json())
      .then(data => setConnectAnimation(data))
      .catch(error => console.error('Error loading connect animation:', error));
  }, []);

  
  return (
    <>
      <div ref={containerRef} className="relative flex flex-col space-y-3 overflow-y-scroll bg-background-light dark:bg-background-dark md:mt-3 scrollbar-hide">
       
      {posts.length > 0 ? (
    posts.map((p, index) => (
      <PostCard
        key={p._id || `${p._id}-${index}`}
        post={p}
        isLiked={likedPosts.has(p._id)}
        id={index === posts.length - 1 ? "last-post" : undefined}
        setPosts={setPosts}
      />
    ))
  ) : (
    
  
     <div className="py-16 bg-purple-50 dark:bg-background-dark sm:py-20 lg:py-24">
     <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
       <div className="grid items-center grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
         <div className="w-full max-w-sm mx-auto sm:max-w-md">
           {connectAnimation && <Lottie animationData={connectAnimation} loop={true} />}
         </div>
         <div>
           <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-purple-50 sm:text-4xl sm:mb-6">Connect and Grow Together</h2>
           <p className="mb-6 text-lg text-gray-600 sm:text-xl sm:mb-8">
             Join a vibrant community where every connection opens new doors. Share your stories, 
             discover inspiring content, and engage with like-minded individuals who help you grow.
           </p>
           <button onClick={()=>navigate("/profiles")} className="w-full px-6 py-3 text-lg font-semibold text-white transition-colors bg-purple-600 rounded-full sm:w-auto sm:px-8 hover:bg-purple-700">
             Start Connecting
           </button>
         </div>
       </div>
     </div>
   </div>
  )}
  
        <div className="relative ">
        {loading && <LoaderSpinner loading={loading}  />}
        </div>
      </div>
    </>
  );
};

export default Post;
