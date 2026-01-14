import React, { useState } from "react";
import { FaRegHeart, FaRegComment } from "react-icons/fa";
import { IPost } from "../../../Types/postTypes";
import { IRoll } from "./UserPosts";
import OpenedRoll from "../Roll/OpenedRoll";
import Comments from "../post/Comments";

// User interface (as per your requirement)
interface User {
  id: string;
  no: number;
  profileImage: string;
  name: string;
  username: string;
  email: string;
  isSuspended: boolean;
}

// Backend response data interfaces
export interface BackendPostData {
  id: string;
  content: string;
  mediaUrls: string[];
  createdAt: string | Date;
  likeCount: number;
  commentCount: number;
  user?: {
    id: string;
    username: string;
    profileImage?: string;
  };
}

export interface BackendReelData {
  id: string;
  mediaUrl: string;
  thumbnail?: string;
  content?: string;
  createdAt: string | Date;
  likeCount: number;
  commentCount: number;
  user?: {
    id: string;
    username: string;
    profileImage?: string;
  };
}

// Main saved item interface from backend
export interface BackendSavedItem {
  id: string;
  type: 'POST' | 'REEL'; // Uppercase as in backend
  data: BackendPostData | BackendReelData;
  savedAt: string | Date;
}

// Updated props for your component
export interface SavedItemCardProps {
  item: BackendSavedItem;
}

const SavedItemCard: React.FC<SavedItemCardProps> = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("item in savedCard", item);
  console.log("item.type in savedItemcard", item.type);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Helper function to convert backend post data to IPost
  const convertToIPost = (postData: BackendPostData): IPost => {
    return {
      _id: postData.id,
      id: postData.id,
      mediaUrls: postData.mediaUrls,
      content: postData.content,
      createdAt: typeof postData.createdAt === 'string' ? postData.createdAt : postData.createdAt.toISOString(),
      updatedAt: typeof postData.createdAt === 'string' ? postData.createdAt : postData.createdAt.toISOString(),
      likeCount: postData.likeCount,
      commentCount: postData.commentCount,
      profileImage: postData.user?.profileImage || '',
      name: postData.user?.username || 'Unknown',
      username: postData.user?.username || 'unknown',
      userId: postData.user?.id || '',
      isLiked: false, // You'll need to get this from separate API
      isSaved: true, // Since it's from saved items
      isBlocked: false,
      postId: postData.id,
      postDetails: { isBlocked: false }
    };
  };

  // Helper function to convert backend reel data to IRoll
  const convertToIRoll = (reelData: BackendReelData): IRoll => {
    return {
      id: reelData.id,
      userId: reelData.user?.id || '',
      thumbnail: reelData.thumbnail || reelData.mediaUrl,
      mediaUrl: reelData.mediaUrl,
      content: reelData.content || '',
      createdAt: reelData.createdAt instanceof Date ? reelData.createdAt : new Date(reelData.createdAt),
      name: reelData.user?.username || 'Unknown',
      username: reelData.user?.username || 'unknown',
      profileImage: reelData.user?.profileImage || '',
      isLiked: false,
      likeCount: reelData.likeCount,
      commentCount: reelData.commentCount || 0,
      isSaved: true
    };
  };

  // Render post based on backend data
  const renderPost = (postData: BackendPostData) => {
    const post = convertToIPost(postData);
    return (
      <div className="relative p-1 cursor-pointer" onClick={handleCardClick}>
        <img
          className="object-cover w-full h-full"
          src={post.mediaUrls[0]}
          alt="Post Media"
        />
        <div className="absolute inset-0 flex flex-row items-center justify-center w-full h-full space-x-2 transition-opacity duration-300 opacity-0 hover:opacity-50 hover:bg-black">
          <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
            <FaRegHeart className="text-2xl" />
            <span>{post.likeCount}</span>
          </div>
          <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
            <FaRegComment className="text-2xl" />
            <span>{post.commentCount}</span>
          </div>
        </div>
      </div>
    );
  };

  // Render reel based on backend data
  const renderReel = (reelData: BackendReelData) => {
    const roll = convertToIRoll(reelData);
    return (
      <div
        className="relative p-1 cursor-pointer w-full h-[300px]"
        onClick={handleCardClick}
      >
        <img
          className="object-cover w-full h-full"
          src={roll.thumbnail || "default_thumbnail_url"}
          alt="Roll Thumbnail"
        />
        <div className="absolute inset-0 flex flex-row items-center justify-center w-full h-full space-x-2 transition-opacity duration-300 opacity-0 hover:opacity-50 hover:bg-black">
          <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
            <FaRegHeart className="text-2xl" />
            <span>{roll.likeCount}</span>
          </div>
          <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
            <FaRegComment className="text-2xl" />
            <span>{roll.commentCount}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {item.type === 'POST' && renderPost(item.data as BackendPostData)}
      {item.type === 'REEL' && renderReel(item.data as BackendReelData)}

      {isModalOpen && (
        <>
          {item.type === 'POST' && (
            <Comments
              post={convertToIPost(item.data as BackendPostData)}
              isLiked={false}
              onLikeToggle={() => {}}
              onClose={handleCloseModal}
              onCommentCountChange={(count) =>
                console.log("Comment count changed:", count)
              }
            />
          )}
          {item.type === 'REEL' && (
            <OpenedRoll 
              roll={convertToIRoll(item.data as BackendReelData)} 
              onClose={handleCloseModal} 
            />
          )}
        </>
      )}
    </>
  );
};

export default SavedItemCard;