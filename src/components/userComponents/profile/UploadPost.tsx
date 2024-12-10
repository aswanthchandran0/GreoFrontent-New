import React, { useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";


interface uploadPostProps {
  file:string | null
  onUploadFile: (file: File, userId: string, mediaType: string, comment: string) => void;
  onCancelUpload: () => void
  userId: string; 
}
const UploadPost: React.FC<uploadPostProps> = ({ file,onUploadFile,onCancelUpload ,userId }) => {
  const [mediaType, setMediaType] = useState<string>("post");
  const [comment, setComment] = useState<string>("");

  const handleUpload = () => {
    if (file) {
      const selectedFile = new File([file], "post_media"); // Convert base64 to a File object if needed
      onUploadFile(selectedFile, userId, mediaType, comment);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
      <div className="flex flex-col items-center justify-center w-full h-full bg-opacity-50 bg-background-dark ">
        <div className="flex flex-col w-full  h-[32rem] md:max-h-[35rem]  max-w-[32rem] bg-black rounded">
        <div className="flex flex-row items-center justify-between p-2 mx-1 rounded">
          <FaArrowLeftLong  className="text-xl cursor-pointer text-text-white" onClick={()=>{onCancelUpload() }} />
           <span className="text-md text-text-white font-gaolos">Upload</span>
           <span className="text-blue-500 cursor-pointer text-md font-golos" onClick={handleUpload} >Next</span>
          </div>
          <div className="w-full h-96">
            <img src={file} alt="" />
          </div>

          <div className="w-full px-5 md:mt-6">
            <textarea
              className="w-full h-full rounded outline-none md:mt-4"
              placeholder="write a caption"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPost;
