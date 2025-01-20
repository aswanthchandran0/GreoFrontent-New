import { useEffect, useState } from "react";
import { FaRegComment, FaRegHeart } from "react-icons/fa"
import { PiPlayCircleBold } from "react-icons/pi"
import Comments from "../post/Comments";
import OpenedRoll from "../Roll/OpenedRoll";
import { likePostApi } from "../../../services/user/api";
import toast from "react-hot-toast";
import { ExploreI } from "../../../Types/exploreTypes";

interface Prop{
    index:number
    item:ExploreI
}

const ExploreFeed:React.FC<Prop> = ({item,index})=>{
      const [isCommentBoxOpen, setIsCommentBoxOpen] = useState(false);
      const [isRollOpened,setIsRollOpened] = useState<boolean>(false)
      const [isLiked, setIsLiked] = useState(item.isLiked || false);

      const handleCommentBox = ()=>{
        console.log('the event was occured')
        console.log("item",item)
        console.log("isliked",isLiked)
        try{
          setIsCommentBoxOpen(!isCommentBoxOpen)
        }catch(err){
          console.log("error in set is comment box open",err)
        }
       }


       const handleRollOpen = async ()=>{
        setIsRollOpened(!isRollOpened)
      }
      


// handle like

const handleLike = async () => {
  try {
    if (!isLiked) {
      await likePostApi([item._id ??''], []); // Liking the post
      setIsLiked(true);
    } else {
      await likePostApi([], [item._id ?? '']); // Unliking the post
      setIsLiked(false);
    }
  } catch (err) {
    console.error("Error liking post:", err);
    toast.error("Something went wrong while liking.");
  }
};

       
useEffect(() => {
  console.log("isCommentBoxOpen state changed:", isCommentBoxOpen);
}, [isCommentBoxOpen]);

  if (item.type === "post") {
    return (

        <div
        onClick={handleCommentBox}
        className={`relative ${
          index % 7 === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
        }`}
      >
        <img
          src={"mediaUrls" in item ? item.mediaUrls[0] : item.mediaUrl}
          alt="post"
          className="object-cover w-full h-full rounded-md cursor-pointer"
        />

<div className="absolute inset-0 flex flex-row items-center justify-center w-full h-full space-x-2 transition-opacity duration-300 opacity-0 cursor-pointer hover:opacity-50 hover:bg-black">
                  <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
                      <FaRegHeart className="text-2xl "/>
                     <span className="text-text-white">{item.likeCount}</span>
                  </div>
                  <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
                      <FaRegComment className="text-2xl "/>
                     <span className="text-text-white">{item.commentCount}</span>
                  </div>
              </div>

              {isCommentBoxOpen && item && (
                console.log("Rendering Comments component with item:", item),
  <Comments
    post={item}
    isLiked={isLiked}
    onLikeToggle={handleLike}
    onClose={handleCommentBox}
  />
)}

      </div>
    )
  } else if(item.type === "roll"){
    return (
      <div
     onClick={handleRollOpen} 
      className={`relative ${
        index % 7 === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
      }`}
    >
      <PiPlayCircleBold className="absolute text-3xl text-text-PurpleHeart right-4 top-4"/>

      <img
        src={item.thumbnail}
        alt="roll"
        className="object-cover w-full h-full rounded-md cursor-pointer"
      />

      <div className="absolute inset-0 flex flex-row items-center justify-center w-full h-full space-x-2 transition-opacity duration-300 opacity-0 cursor-pointer hover:opacity-50 hover:bg-black">
                  <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
                      <FaRegHeart className="text-2xl "/>
                     <span className="text-text-white">{item.likeCount}</span>
                  </div>
                  <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
                      <FaRegComment className="text-2xl "/>
                     <span className="text-text-white">{item.commentCount}</span>
                  </div>
              </div>

             


{
                isRollOpened && <OpenedRoll roll={item} onClose={handleRollOpen}/>
            }


    </div>
    )
  }
}

export default ExploreFeed