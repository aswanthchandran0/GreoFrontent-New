import { useEffect, useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6"
import { generateThumbnail } from "../../../utils/thumbnailGenerator";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { rollUploadApi } from "../../../services/user/api";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { LoaderSpinner } from "../../ui/LoadingSpinner";

interface Props{
  base64Video: string;
  onClose:(boolean:boolean)=>void
  handleReelUploadFinish:()=>void
}

export interface RollUploadPayload {
  thumbnail?: null | string;
  mediaUrl: string;
  content: string;
}


const RollUpload:React.FC<Props> = ({base64Video,onClose, handleReelUploadFinish})=>{
     const [thumbnail,setThumbnail] = useState<string | null>(null)
     const [description, setDescription] = useState<string>("");
     const [descriptionCharLength,setDescriptionCharLength] = useState<number>(0)
     const [loading,setLoading] = useState(false)
     const user = useSelector((state:RootState)=>state.UserReducer.user)
     useEffect(()=>{
      const handleThumbnail = async()=>{
        try {
        const thumbnailImage:string = await generateThumbnail({base64Video,timeInSeconds:1})
        setThumbnail(thumbnailImage)
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
      }
      handleThumbnail()
     },[base64Video])

     // for handling discription 
     const handleDiscriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      setDescriptionCharLength(value.length)
      if (value.length <= 2200) {
        setDescription(value);
      }
    };


      // Handle upload button click
      const handleUpload = async () => {
        try {
          setLoading(true)
          const payload:RollUploadPayload = {
            thumbnail,
            mediaUrl: base64Video,
            content: description,
          };
      
          console.log("Payload:", payload);
          const response = await rollUploadApi(payload); 
          handleReelUploadFinish()
          console.log("Upload success:", response.data);
        } catch (error) {
          console.error("Error uploading roll:", error);
        }finally{
          setLoading(false)
        }
      };
      

  
    return (
 <div className="fixed inset-0 flex items-center justify-center w-full h-full bg-transparent lg:pt-12 pb-14">
      <div className="flex flex-col items-center justify-center w-full h-screen bg-opacity-50 bg-background-dark ">
        <div className="flex flex-col w-full  h-[32rem] md:max-h-[50rem]  max-w-[50rem] bg-background-light dark:bg-black overflow-auto scrollbar-hide rounded">
          <div className="flex flex-row items-center justify-between p-2 mx-1 rounded ">
            <FaArrowLeftLong onClick={()=>onClose(false)} className="text-xl cursor-pointer text-text-black dark:text-text-white" />
            <span className="font-bold text-md text-text-black font-golos dark:text-text-white font-gaolos">Upload</span>
            {
              loading ?
              <div className="relative flex items-center justify-center w-10 h-10">
                <LoaderSpinner loading={loading} size={30}/>
              </div>
              :
            <span  onClick={handleUpload} className="text-blue-500 cursor-pointer text-md font-golos">
              upload 
            </span>
            }
          </div>
          <div className="flex flex-col w-full h-full overflow-hidden md:flex-row">

          <div className="w-full h-full overflow-hidden">
          <img src={thumbnail ??''} className="object-cover w-full h-full" alt="Video Thumbnail" />
          </div>

          <div className="flex flex-col w-full h-full p-2 space-y-2 border-l border-text-EerieBlack ">
           
           <div className="flex flex-row items-center w-full gap-2 ">
           <div className='w-10 h-10 overflow-hidden rounded-full'>
            <img className="object-cover w-full h-full" src={user?.profileImage || DEFAULT_PROFILE_IMAGE } alt="profile image" />
           </div>
    <p className="font-semibold text-text-black dark:text-text-white font-golos">{user?.username}</p>
           </div>

            <textarea value={description} onChange={handleDiscriptionChange} 
        className="outline-none bg-background-lightGray dark:bg-background-customDarkGray text-text-black dark:text-text-white min-h-28"></textarea>          
           <div className="flex w-full px-2">
               <p className="ml-auto text-xs text-text-Grayish font-golos ">{`${descriptionCharLength}/2,200`}</p>
           </div>
          </div>
          </div>

        </div>
      </div>
    </div>
    )
}


export default RollUpload