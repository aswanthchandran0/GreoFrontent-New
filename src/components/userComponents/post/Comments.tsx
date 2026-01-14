import { IPost } from "../../../Types/postTypes";
import { IoClose } from "react-icons/io5";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { IoBookmarkOutline } from "react-icons/io5";
import Comment from "./Comment";
import { useEffect, useState } from "react";
import {
  postCommentApi,
  getCommentsApi,
  saveNotification,
} from "../../../services/user/api";
import { CommentsDto, IComment} from "../../../Types/commentTypes";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { BsThreeDots } from "react-icons/bs";
import PostMenu from "./PostMenu";
import { timeformat } from "../../../utils/formating";
import SharingOption from "./SharingOption";
// import { useSocket } from "../../../context/SocketContext";
import { ExploreI } from "../../../Types/exploreTypes";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";

const defaultProfileImage =
  "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729611509~exp=1729615109~hmac=f56084f44329d588f81849bc897a8533f197f38f12e1fd5d08aca16c67adffb4&w=740";
interface CommetsProps {
  post: IPost | null | ExploreI;
  isLiked: boolean;
  onLikeToggle: () => void;
  onClose: () => void;
  clearDeletePostCatch?: (postId: string) => void;
  handleUpdatePostCatch?: (postId: string, content: string) => void;
  onCommentCountChange?: (count: number) => void;
  likeCount?:number
}
const Comments: React.FC<CommetsProps> = ({
  post,
  isLiked,
  onLikeToggle,
  onClose,
  clearDeletePostCatch = () => {},
  handleUpdatePostCatch = () => {},
  onCommentCountChange = () => {},
  likeCount
}) => {
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<IComment[]>([]);
  const [isPostMenu, setIsPostMenu] = useState<boolean>(false);
  const loggedUser = useSelector((state: RootState) => state.UserReducer.user);
  const { username } = useParams();
  const [isSharing, setIsSharing] = useState<boolean>(false);
   const [commentsCount,setCommentsCount] = useState(post?.commentCount || 0)
  // const { socket } = useSocket();
  
  

  
useEffect(() => {
  const fetchComments = async () => {
    try {
      const response = await getCommentsApi(post?.id ?? '');

      // backend might return a single object or array, normalize it
      const commentsArray: IComment[] = Array.isArray(response.data)
        ? response.data
        : [response.data];

      setComments(commentsArray);
    } catch (err) {
      console.log('Error fetching comments:', err);
    }
  };

  fetchComments();
}, [post?.id]);

  const handleAddComment = (newComment: IComment) => {
  setComments(prevComments => [newComment, ...prevComments]);
};

  // comment sent
  const handleCommentPost = async () => {
    try {
      if (comment.trim()) {
        const response = await postCommentApi(post?.id?? "",'post', comment);
        response.data.profileImage = loggedUser?.profileImage
        response.data.username = loggedUser?.username

        handleAddComment(response.data);
        setComment("");
         setCommentsCount((prev) => prev +1)
        // comment notifying
        const NotifcationMessage = "commented on your post";
        const notificationResponse = await saveNotification(
          post?.userId ?? "",
          post?.id ?? "",
          post && "mediaUrls" in post && post.mediaUrls?.[0] ? post.mediaUrls[0] : "",
          NotifcationMessage,
          "comment"
        );
        console.log(
          "response from the comment notirication",
          notificationResponse.data
        );
        if (notificationResponse.data) {
          // socket?.emit("sendNotification", notificationResponse.data);
        }
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  const navigate = useNavigate();
  const loggedUserName = useSelector(
    (state: RootState) => state.UserReducer.user?.username
  );

  // profile navigation
  const handleProfileNavigation = () => {
    if (post && 'username' in post && post.username !== loggedUserName) {
      navigate(`/profile/${post.username}`);
    }
  };

  const handleUpdateContent = (postId: string, content: string) => {
    handleUpdatePostCatch(postId, content);
    setIsPostMenu(!isPostMenu);
  };

  // comment count change
  useEffect(() => {
    if (comments) {
      onCommentCountChange(comments.length);
    }
  }, [comments, onCommentCountChange]);

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
        <div className="flex items-center justify-center hidden w-2/5 h-full border-r cursor-pointer md:flex bg-background-dark border-text-charcoal ">
          <div>
            <img src={post && 'mediaUrls' in post && post.mediaUrls.length > 0 ? post.mediaUrls[0] : DEFAULT_PROFILE_IMAGE} alt="" />
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
                src={
                  post?.profileImage ? post.profileImage : defaultProfileImage
                }
                alt=""
              />
            </div>
            <span
              onClick={handleProfileNavigation}
              className="font-semibold cursor-pointer text-text-black dark:text-text-white"
            >
             { post && 'username' in post && post.username ? post.username : 'Unknown User' }
            </span>

            <div className="flex flex-row ml-auto space-x-3 text-xl font-semibold cursor-pointer text-text-black dark:text-text-white">
              {loggedUser?.username === username && (
                <BsThreeDots onClick={() => setIsPostMenu(true)} />
              )}
              <IoClose onClick={onClose} />
            </div>
          </div>

          {/* comment box */}

          <div className="w-full h-full p-2 space-y-5 overflow-y-auto scrollbar-hide ">
            {/* post description  */}
            {post?.content && (
              <div className="flex flex-row items-center space-x-2 ">
                <div className="w-10 h-10 mb-auto overflow-hidden rounded-full">
                  <img
                    className="object-cover w-full h-full"
                    src={
                      post?.profileImage
                        ? post.profileImage
                        : "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729611509~exp=1729615109~hmac=f56084f44329d588f81849bc897a8533f197f38f12e1fd5d08aca16c67adffb4&w=740"
                    }
                    alt=""
                  />
                </div>
                <div className="flex flex-col mb-auto">
                  <p className="text-text-black dark:text-text-white font-golos">
                  {post && "username" in post ? post.username : "user name"}
                  </p>
                  <p className="text-sm text-text-darkGray font-outfit">
                    {timeformat(post.createdAt?.toString() || "")}
                  </p>
                </div>
                <div className="mb-auto md:w-80 ">
                  <p className=" text-text-darkGray font-golos">
                    {post.content}
                  </p>
                </div>
              </div>
            )}
            {/* post description end */}

            {comments.map((comment, index) => {
              return <Comment key={index} comment={comment} />;
            })}
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
                      onClick={onLikeToggle}
                    />
                  ) : (
                    <FaRegHeart
                      className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"
                      onClick={onLikeToggle}
                    />
                  )}
                  {<span className="font-golos dark:text-text-white text-text-charcoal">
          {likeCount}
        </span> }
        
                </div>

                <div className="flex flex-col items-center justify-center">
                  <FaRegComment className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal" />

                    {<span className="font-golos dark:text-text-white text-text-charcoal">
          {commentsCount}
        </span> }
                </div>

                <div className="flex flex-col items-center justify-center">
                  <IoIosShareAlt
                    onClick={() => setIsSharing(!isSharing)}
                    className="text-2xl cursor-pointer dark:text-text-white text-text-charcoal"
                  />
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
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCommentPost()}
                className="p-2 outline-none w-96 dark:bg-background-dark text-text-black bg-background-light dark:text-text-white "
                type="text"
                placeholder="Add a comment..."
              />
              <p
                onClick={handleCommentPost}
                className="text-blue-500 cursor-pointer font-golos"
              >
                post
              </p>
            </div>
          </div>
        </div>
        {/* comment side end */}
      </div>
      {isPostMenu && (
        <PostMenu
          postId={post?.id ?? ''}
          clearDeletePostCatch={clearDeletePostCatch}
          postContent={post?.content ?? ''}
          handleUpdatePostCatch={handleUpdateContent}
        />
      )}

      {isSharing && (
        <SharingOption
          postId={post?.id ?? ''}
          onClose={() => setIsSharing(!isSharing)}
        />
      )}
    </div>
  );
};
export default Comments;