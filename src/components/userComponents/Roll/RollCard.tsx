import ReadMoreAndLess from 'react-read-more-read-less';
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { IoIosShareAlt } from "react-icons/io";
import { IoBookmarkOutline } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";

const RollCard = ()=>{
    return(
        <>
        <div className='flex flex-row'>

        
<div className="relative w-[351.84px] h-[625.50px] ">
 <video
 className="w-full h-full object-cover rounded"
 src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
 autoPlay
 loop
 muted
 ></video>

 <div className="absolute  bottom-0 left-0 p-4 ">
   <div className="flex flex-col">
<div className="flex flex-row items-center gap-2">
    <div className="w-10 h-10 overflow-hidden rounded-full cursor-pointer">
        <img className="w-full h-full" src="JamesPhoto.png" alt="" />
    </div>
   <span className="text-text-white font-golos cursor-pointer">James</span>
   <button className="border rounded p-1 text-text-white text-sm font-gaolos font-bold ">Follow</button>
</div>

<div className='text-text-white font-outfit cursor-pointer'>
<ReadMoreAndLess

charLimit={40}
moreText='...more'
lessText='show less'
readMoreClassName='text-text-white font-golos text-sm '
readLessClassName='text-text-white font-golos text-sm'
      >
 its a cartoon bunny would you like that or not just comment
           
      </ReadMoreAndLess> 
    
</div>

<div className='absolute bottom-12 right-0 sm:hidden flex flex-col mt-auto py-5 p-4 space-y-3'>
  <div className='flex flex-col justify-center items-center cursor-pointer text-text-white font-golos font-bold'>
   <FaRegHeart className='text-2xl '/>
   <span>1.4k</span>
  </div>

  <div className='flex flex-col justify-center items-center cursor-pointer  text-text-white font-golos font-bold'>
   <FaRegComment  className='text-2xl '/>
   <span>987</span>
  </div>

  <div className='flex flex-col justify-center items-center cursor-pointer text-text-white font-golos font-bold'>
   <IoIosShareAlt className='text-2xl '/>
  </div>
</div>
   </div>
 </div>
</div>

<div className='hidden sm:flex flex-col mt-auto py-5 p-4 space-y-3'>
  <div className='flex flex-col justify-center dark:text-text-white items-center cursor-pointer'>
   <FaRegHeart className='text-2xl'/>
   <span>1.4k</span>
  </div>

  <div className='dark:text-text-white'>
   <FaRegComment className='text-2xl cursor-pointer'/>
   <span>987</span>
  </div>

  <div className='dark:text-text-white'>
   <IoIosShareAlt className='text-2xl cursor-pointer'/>
  </div>
</div>
</div>
        </>
    )
}

export default RollCard