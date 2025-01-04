import PostCard from "./PostCard";
import { useEffect, useRef, useState } from "react";
import { getUserFeedApi, likePostApi} from "../../../services/user/api";
import { IPost } from "../../../Types/postTypes";
import { useOutletContext } from "react-router-dom";
import { LoaderSpinner } from "../../ui/LoadingSpinner";


interface OutletContext {
  newPosts: IPost | null;
}

const Post = () => {
  const [posts, setPosts] = useState<IPost[]>([]);
  const { newPosts } = useOutletContext<OutletContext>();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [unlikedPosts, setUnlikedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const skipRef = useRef(0);
  const [limit] = useState(5);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const containerRef = useRef(null); 
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
          (post) => !existingPostIds.has(post._id)
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

  // Handle scroll event to load more posts
  // const handleScroll = () => {
  //   if (containerRef.current) {
  //     const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
  //     if (scrollTop + clientHeight === scrollHeight && !loading && hasMorePosts) {
  //       fetchUserFeed(); // Load more posts when bottom is reached
  //     }
  //   }
  // };
  
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

    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              likeCount: isCurrentlyLiked
                ? post.likeCount - 1
                : post.likeCount + 1,
            }
          : post
      )
    );
  };

  // Sync likes/unlikes with backend
  useEffect(() => {
    const syncLikesWithBackend = async () => {
      await likePostApi(Array.from(likedPosts), Array.from(unlikedPosts));
    };

    window.addEventListener("beforeunload", syncLikesWithBackend);
    return () => {
      syncLikesWithBackend();
      window.removeEventListener("beforeunload", syncLikesWithBackend);
    };
  }, [likedPosts, unlikedPosts]);

  useEffect(() => {
    if (newPosts) {
      setPosts((prevPosts) => [newPosts, ...prevPosts]);
    }
  }, [newPosts]);

  
  return (
    <>
      <div ref={containerRef} className="relative flex flex-col space-y-3 overflow-y-scroll bg-background-light dark:bg-background-dark md:mt-3 scrollbar-hide">
        {posts.map((p, index) => (
          <PostCard
            key={p._id || `${p._id}-${index}`}
            post={p}
            isLiked={likedPosts.has(p._id)}
            onLikeToggle={() => handleLike(p._id)}
            id={index === posts.length - 1 ? "last-post" : undefined}
            setPosts={setPosts}
          />
        ))}
        <div className="relative ">
        {loading && <LoaderSpinner loading={loading}  />}
        </div>
      </div>
    </>
  );
};

export default Post;
