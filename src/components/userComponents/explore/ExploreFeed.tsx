
import { FaRegComment, FaRegHeart } from "react-icons/fa"
import { PiPlayCircleBold } from "react-icons/pi"

import { ExploreI } from "../../../Types/exploreTypes";

interface Prop{
    index:number
    item:ExploreI
    handleOpenExplore:(number:number)=>void
}

const ExploreFeed:React.FC<Prop> = ({item,index,handleOpenExplore})=>{
      // const [isLiked, setIsLiked] = useState(item.isLiked || false);
     

// // handle like
// const handleLike = async () => {
//   try {
//     if (!isLiked) {
//       await likePostApi([item._id ??''], []); // Liking the post
//       setIsLiked(true);
//     } else {
//       await likePostApi([], [item._id ?? '']); // Unliking the post
//       setIsLiked(false);
//     }
//   } catch (err) {
//     console.error("Error liking post:", err);
//     toast.error("Something went wrong while liking.");
//   }
// };

const isRoll = item.type === "roll";
const imageUrl = isRoll ? item.thumbnail : ("mediaUrls" in item ? item.mediaUrls[0] : item.mediaUrl);

return (
  <div 
  onClick={()=>handleOpenExplore(index)}
    className={`relative  ${
      index % 7 === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
    }`}
  >
    {isRoll && (
      <PiPlayCircleBold className="absolute text-3xl text-text-PurpleHeart right-4 top-4" />
    )}

    <img
      src={imageUrl}
      alt={isRoll ? "roll" : "post"}
      className="object-cover w-full h-full rounded-md cursor-pointer"
    />

    <div className="absolute inset-0 flex flex-row items-center justify-center w-full h-full space-x-2 transition-opacity duration-300 opacity-0 cursor-pointer hover:opacity-50 hover:bg-black">
      <div
        className="flex flex-row items-center justify-center space-x-2 text-xl text-white cursor-pointer"
      >
        <FaRegHeart
          className={`text-2xl ${item.isLiked ? "text-red-500" : "text-white"}`}
        />
        <span>{item.likeCount}</span>
      </div>
      <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
        <FaRegComment className="text-2xl" />
        <span>{item.commentCount}</span>
      </div>
    </div>
  </div>
);
};

export default ExploreFeed