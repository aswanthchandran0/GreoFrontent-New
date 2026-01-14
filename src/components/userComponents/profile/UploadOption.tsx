import { useState } from "react";
import { IoCloseOutline } from "react-icons/io5"
import { FaRegImage } from "react-icons/fa6";
import FileInput from "../../ui/FileInput";
import { postUploadApi } from "../../../services/user/api";
import ImageCropper from "../../ui/ImageCropper";
import UploadPost from "./UploadPost";
import { PiFilmReel } from "react-icons/pi";
import VideoPreview from "./VideoPreview";
import RollUpload from "./RollUpload";
import { LoaderSpinner } from "../../ui/LoadingSpinner";
import { IPost } from "../../../Types/postTypes";

interface UploadOptionProps {
    userId: string;
    onClose: () => void;
    setRefreshPosts: (value:boolean) => void;
    refreshPosts: boolean
      onNewPost?: (post:IPost)=>void
  }
  
const UploadOption: React.FC<UploadOptionProps>  = ({ userId, onClose,setRefreshPosts,refreshPosts,onNewPost  })=>{
    const [selectedOption, setSelectedOption] = useState<string>("Upload Post");
    const options = ["Upload Post", "Upload Reel"];
    
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState<boolean>(false);
    const [isloading,SetIsLoading]= useState<boolean>(false)
  // Handle file selection
  const onSelectedFile = (file: string | File) => {
    if (file) {

      if(typeof file ==='string'){
        setSelectedFile(file);
      }
      setIsCropping(true);
    }
  };

  // Handle cropping
  const onCropComplete = (croppedDataURL: string) => {
    setCroppedImage(croppedDataURL);
    setIsCropping(false);
  };

  const onCancelCrop = () => {
    setCroppedImage(null);
    setIsCropping(false);
  };


    // upload file
  const onUploadFile = async (
    file: File,
    userId: string,
    mediaType: string,
    comment: string
  ) => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("userId", userId);
    formData.append("content", comment);
    setSelectedFile(null);
    setCroppedImage(null);
    try {
      SetIsLoading(true)
      const response =  await postUploadApi(formData);
      setRefreshPosts(!refreshPosts);
      onClose()
    if (onNewPost) {
        onNewPost(response.data);
      }
    } catch (error) {
      console.error("Error uploading post:", error);
    }finally{
      SetIsLoading(false)
    }
  };

  const onCancelUpload = () => {
    setCroppedImage(null);
    setIsCropping(true);
  };

  // reel 
   const [selectedVideo,setSelectedVideo] = useState<string| null>(null)
   const [showReelUpload,setShowReelUpload] = useState<boolean>(false)
  const onSelectedVideo = (file: string | File) => {
    if (file && typeof file ==='string') {

      setSelectedVideo(file)
    }
  };

  const handleCancelVideoFile = ()=>{
     setSelectedVideo(null)
  }
      
  const handleReelUploadFinish = ()=>{
    setSelectedVideo(null)
    setShowReelUpload(false)
    onClose()
  }
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
        <div className="flex flex-col items-center justify-center w-full h-screen bg-opacity-50 bg-background-dark">
        <div className="flex flex-col w-full items-center h-full max-w-md max-h-[70vh] rounded-md bg-background-light dark:bg-background-customDarkGray ">
        <div className="relative flex flex-row items-center justify-center w-full p-3 border-b border-text-charcoal">
                <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="p-2 bg-transparent border rounded-md cursor-pointer font-golos dark:text-text-white border-text-charcoal focus:outline-none"
              >
                {options.map((option) => (
                  <option key={option} value={option} className="dark:bg-background-dark dark:text-text-white">
                    {option}
                  </option>
                ))}
              </select>
                <IoCloseOutline  onClick={onClose} className="flex ml-auto text-2xl font-bold cursor-pointer text-text-black dark:text-text-white"/>
            </div>



{
    selectedOption ==='Upload Reel' ?
    // upload reel
    <div className="flex flex-col items-center justify-center w-full h-full p-2 space-y-3">
         <div className="flex flex-col items-center justify-center w-full h-full p-2 space-y-3 ">

         {
            selectedVideo && !showReelUpload ?
            <VideoPreview onClose={handleCancelVideoFile} setShowReelUpload={setShowReelUpload} base64Video={selectedVideo}/>
            :
            showReelUpload && selectedVideo ?
            <RollUpload   handleReelUploadFinish={ handleReelUploadFinish} onClose={setShowReelUpload}  base64Video={selectedVideo}/>
            :
            <>
             <PiFilmReel className="text-7xl text-text-Grayish" />
         <p className="text-text-Grayish font-golos dark:text-text-white">Select the video for upload.</p>
         <button className="relative flex flex-row items-center justify-center p-1 border rounded-md text-text-black dark:text-white hover:bg-white hover:text-text-Grayish ">
          <FileInput acceptType="video" onSelectedFile={onSelectedVideo}   />
          <p className="text-md">upload</p>
        </button>
            </>
        }

        
        
        </div>
        </div>
        :



    //    upload post
        <div className="flex flex-col items-center justify-center w-full h-full p-2 space-y-3">
            {isCropping ? (
              <ImageCropper
                image={selectedFile}
                onCropDone={onCropComplete}
                onCropCancel={onCancelCrop}
                isAspectRatios={true}
              />
            ) : croppedImage ? (
                <UploadPost
                file={croppedImage}
                onUploadFile={onUploadFile}
                onCancelUpload={onCancelUpload}
                userId={userId}
              />
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full p-2 space-y-3 ">
                <FaRegImage className="text-7xl text-text-Grayish"/>

                 {
                   !isloading ?
                   <>
                   <p className=" text-text-Grayish font-golos dark:text-text-white">Select the post for upload.</p>
                  <button className="relative flex flex-row items-center justify-center p-1 border rounded-md text-text-black hover:dark:text-text-black dark:text-white hover:bg-white hover:text-text-Grayish ">
                  <FileInput acceptType="image" onSelectedFile={onSelectedFile}   />
                  <p className="text-md">upload</p>
                </button>
                </>
                :

        <LoaderSpinner loading={isloading}/>
                 }
               

              </div>
            )}
          </div>


}
 
        
        </div>
        </div>
      
    </div>
    )
}


 export default UploadOption