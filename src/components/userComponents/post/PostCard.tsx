import React, { useEffect, useState } from "react"
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { IoBookmarkOutline } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import { IPost } from "../../../Types/postTypes";
import Comments from "./Comments";
import { useNavigate } from "react-router-dom";
import { timeformat } from "../../../utils/formating";
import { BsThreeDots } from "react-icons/bs";
import PostMenu from "./PostMenu";
import LikedUsers from "./LikedUsers";
import SharingOption from "./SharingOption";
import { deleteNotification, deleteSavedItemApi, saveItemApi, saveNotification, toggleLikeApi } from "../../../services/user/api";
import toast from "react-hot-toast";
import { SavedItemArrayElement } from "../../../Types/savedItemTypes";
// import { useSocket } from "../../../context/SocketContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

const defaultProfileImage = 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729611509~exp=1729615109~hmac=f56084f44329d588f81849bc897a8533f197f38f12e1fd5d08aca16c67adffb4&w=740'

interface PostCardProps {
  post: IPost;
  isLiked: boolean;
  id?: string;
  setPosts: React.Dispatch<React.SetStateAction<IPost[]>>;
}

const PostCard: React.FC<PostCardProps> = ({ post, isLiked, id, setPosts }) => {
  const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
  const [isPostMenu, setIsPostMenu] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [localIsLiked, setLocalIsLiked] = useState<boolean>(isLiked);
  const [likedUsersListOpen, setLikedUsersListOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  // const {socket} = useSocket()
  const myId = useSelector((state: RootState) => state.UserReducer.user?.id);

  // handle comment box open or close
  const handleCommentBox = () => {
    setIsCommentBoxOpen(!isCommentBoxOpen);
  };

  // navigate to profile
  const handleProfileNavigation = () => {
    navigate(`profile/${post.username}`);
  };

  // handling the commentCount 
  const handlingCommentCount = (commentCount: number) => {
    post.commentCount = commentCount;
  };

  // handle Post Saving
  const handlePostSaving = async (item: SavedItemArrayElement) => {
    try {
      const response = await saveItemApi(item);
      if (response.data == null) {
        toast("already saved");
      } else {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === item.itemId
              ? { ...post, isSaved: true }
              : post
          )
        );
        toast.success('saved');
      }
    } catch (err) {
      console.log('error', err);
      toast.error("something went wrong in saving post");
    }
  };

  // unSave post 
  const handleUnsavePost = async (itemId: string) => {
    try {
      const response = await deleteSavedItemApi(itemId, "POST");
      if (response.status === 200) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === itemId
              ? { ...post, isSaved: false }
              : post
          )
        );
        toast.success("unsaved");
      }
    } catch (error) {
      console.error("Failed to unsave post:", error);
      toast.error("Failed to unsave post. Please try again.");
    }
  };

  const onLikeToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await toggleLikeApi(post.id ?? "", "post");
      const { liked, totalLikes } = response.data;

      setLocalIsLiked(liked);

      // Update post list with new like info
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id
            ? { ...p, isLiked: liked, likeCount: totalLikes }
            : p
        )
      );

      // Optional: Notify the post owner
      // if (liked && post.userId !== myId) {
      //   socket?.emit("sendNotification", {
      //     userId: post.userId,
      //     initiatorId: myId,
      //     entityId: post.id,
      //     type: "post",
      //     message: "liked your post",
      //   });
      // } else if (!liked) {
      //   socket?.emit("removeNotification", {
      //     userId: post.userId,
      //     initiatorId: myId,
      //     entityId: post.id,
      //     type: "post",
      //   });
      // }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    } finally {
      setLoading(false);
    }
  };

  // Handler to toggle modal
  const handleLikedUsersListToggle = () => {
    setLikedUsersListOpen(prev => !prev);
  };

  return (
    <>
      <div id={id} className="flex flex-col max-w-5xl shadow-md bg-background-light dark:bg-background-dark lg:w-[28rem]">
        <div className="flex h-full overflow-hidden">
          <img className="object-cover w-full h-full" src={post.mediaUrls[0]} alt="post" />
        </div>

        <div className="flex flex-col p-2 space-y-3">
          <div className="flex flex-col">
            <div className="flex flex-row items-center space-x-2">
              <div className="w-10 h-10 overflow-hidden rounded-full">
                <img
                  className="object-cover w-full h-full cursor-pointer"
                  src={post?.profileImage ? post.profileImage : defaultProfileImage}
                  alt=""
                />
              </div>
              <div className="flex flex-row items-center w-11/12">
                <span
                  onClick={handleProfileNavigation}
                  className="py-2 text-lg font-semibold cursor-pointer font-zilla dark:text-text-white text-text-charcoal"
                >
                  {post.name}
                </span>
                <BsThreeDots
                  onClick={() => setIsPostMenu(true)}
                  className="ml-auto cursor-pointer font-golos text-text-lavenderGray"
                />
              </div>
            </div>

            <div className="flex flex-row">
              <span className="font-golos text-text-lavenderGray">{post.username}</span>
              <span className="ml-auto font-golos text-text-lavenderGray">{timeformat(post?.createdAt)}</span>
            </div>
          </div>

          <div className="max-w-xl">
            <span className="font-golos text-text-darkGray">{post.content}</span>
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center space-x-3">
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
                  <span
                    onClick={handleLikedUsersListToggle}
                    className="cursor-pointer font-golos dark:text-text-white text-text-charcoal"
                  >
                    {post.likeCount || 0}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center justify-center">
                <FaRegComment
                  onClick={handleCommentBox}
                  className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"
                />
                <span className="font-golos dark:text-text-white text-text-charcoal">
                  {post.commentCount || 0}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <IoIosShareAlt
                  onClick={() => setIsSharing(true)} // ✅ Change to setIsSharing(true) to open modal
                  className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"
                />
                <span className="font-golos dark:text-text-white text-text-charcoal">0</span>
              </div>
            </div>

            <div className="flex flex-col">
              {post.isSaved ? (
                <IoBookmark
                  onClick={() => handleUnsavePost(post.id ?? "")}
                  className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"
                />
              ) : (
                <IoBookmarkOutline
                  onClick={() => handlePostSaving({ itemId: post.id ?? '', itemType: 'POST' })}
                  className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"
                />
              )}
            </div>
          </div>

          <span
            onClick={handleCommentBox}
            className="text-text-lavenderGray font-golos hover:cursor-pointer"
          >
            view all comments
          </span>
        </div>

        {isCommentBoxOpen && (
          <Comments
            post={post}
            isLiked={isLiked}
            onLikeToggle={onLikeToggle}
            onClose={handleCommentBox}
            onCommentCountChange={handlingCommentCount}
          />
        )}
      </div>

      {isPostMenu && (
        <PostMenu
          onClose={() => setIsPostMenu(false)}
          postId={post.id ?? ''}
          postContent={post.content}
        />
      )}

      {likedUsersListOpen && (
        <LikedUsers
          postId={post.id ?? ''}
          onClose={handleLikedUsersListToggle}
        />
      )}

      {isSharing && (
        <SharingOption
          postId={post.id ?? ''}
          postType="POST" // ✅ Add this prop
          postPreview={{ // ✅ Add post preview data
            thumbnail: post.mediaUrls?.[0],
            content: post.content,
            mediaUrl: post.mediaUrls?.[0]
          }}
          onClose={() => setIsSharing(false)} // ✅ Update to setIsSharing(false)
        />
      )}
    </>
  );
};

export default PostCard;