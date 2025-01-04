import React, { useState } from "react";
import { FaRegHeart, FaRegComment } from "react-icons/fa";
import { IPost } from "../../../Types/postTypes";
import { IRoll } from "./UserPosts";
import OpenedRoll from "../Roll/OpenedRoll";
import Comments from "../post/Comments";

export interface SavedItemCardProps {
  item: {
    type: "post" | "roll";
    postData?: IPost;
    rollData?: IRoll;
  };
}

const SavedItemCard: React.FC<SavedItemCardProps> = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("item in saavedCard",item)
  console.log("item.type in savedItemcard",item.type)
  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const renderPost = (post: IPost) => (
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

  const renderRoll = (roll: IRoll) => (
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

  return (
    <>
      {item.type === "post" && item.postData && renderPost(item.postData)}
      {item.type === "roll" && item.rollData && renderRoll(item.rollData)}

      {isModalOpen && (
        <>
          {item.type === "post" && item.postData && (
            <Comments
              post={item.postData}
              isLiked={false} // Replace with the actual like status if available
              onLikeToggle={() => {}}
              onClose={handleCloseModal}
              onCommentCountChange={(count) =>
                console.log("Comment count changed:", count)
              }
            />
          )}
          {item.type === "roll" && item.rollData && (
            <OpenedRoll roll={item.rollData} onClose={handleCloseModal} />
          )}
        </>
      )}
    </>
  );
};

export default SavedItemCard;
