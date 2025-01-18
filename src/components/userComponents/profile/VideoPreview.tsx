import React, { useEffect } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";

interface VideoPreviewProps {
  base64Video: string;
  setShowReelUpload:(boolean:boolean)=>void
  onClose:()=>void
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ base64Video,setShowReelUpload,onClose }) => {
   
  if (!base64Video) {
    return <p>Error: Unable to preview video.</p>;
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full bg-transparent lg:pt-12 pb-14">
      <div className="flex flex-col items-center justify-center w-full h-screen bg-opacity-50 bg-background-dark ">
        <div className="flex flex-col w-full  h-[32rem] md:max-h-[50rem]  max-w-[32rem] bg-background-light dark:bg-black overflow-auto scrollbar-hide rounded">
          <div className="flex flex-row items-center justify-between p-2 mx-1 rounded ">
            <FaArrowLeftLong onClick={onClose} className="text-xl cursor-pointer text-text-black dark:text-text-white" />
            <span className="font-bold text-md text-text-black font-golos dark:text-text-white font-gaolos">Upload</span>
            <span onClick={()=>setShowReelUpload(true)} className="text-blue-500 cursor-pointer text-md font-golos">
              Next
            </span>
          </div>
          <div className="w-full h-full">
            <video
              src={base64Video}
              controls
              className="object-contain w-full h-full rounded-md"
              autoPlay
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default VideoPreview;
