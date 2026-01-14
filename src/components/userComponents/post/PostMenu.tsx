import toast from "react-hot-toast";
import {
  deletePostApi,
  reportPostApi,
  updatePostApi,
} from "../../../services/user/api";
import React, { useEffect, useState } from "react";
import { LoaderSpinner } from "../../ui/LoadingSpinner";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { IoCloseOutline } from "react-icons/io5";
import { ReportReasonType } from "../../../Types/postTypes";
import { IoIosArrowForward } from "react-icons/io";
import { GoCheckCircle } from "react-icons/go";

interface PostMenuProps {
  postId: string;
  clearDeletePostCatch?: (postId: string) => void;
  postContent: string;
  handleUpdatePostCatch?: (postId: string, content: string) => void;
  onClose?:()=>void
}

const PostMenu: React.FC<PostMenuProps> = ({
  postId,
  clearDeletePostCatch = () => {},
  postContent,
  handleUpdatePostCatch = () => {},
  onClose = ()=>{}
}) => {
  const { username } = useParams();
  const loggedUser = useSelector((state: RootState) => state.UserReducer.user);
  const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
  const [isEditDescription, setIsEditDescription] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [isReported,setIsReported]  = useState<boolean>(false)
  useEffect(() => {
    setContent(postContent || "");
  }, [postContent]);

  const handleDeletePost = async () => {
    try {
      setIsLoading(true);
      await deletePostApi(postId);
      clearDeletePostCatch(postId);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error("error in delete post ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = async () => {
    try {
      setIsLoading(true);
      await updatePostApi(postId, content);
      handleUpdatePostCatch(postId, content);
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      toast.error("error in update post");
    }
  };

  const reportingReasons = [
    { id: 1, value: "dislike" as ReportReasonType ,  message:"I just don't like it" },
    { id: 2, value: "bullying" as ReportReasonType, message:"Bullying or unwanted contact" },
    { id: 3, value: "self_harm" as ReportReasonType, message:"Suicide, self-injury or eating disorders" },
    { id: 4, value: "violence" as ReportReasonType, message:"Violence, hate or exploitation" },
    { id: 5, value: "nudity" as ReportReasonType, message:"Nudity or sexual activity " },
    { id: 6, value: "fraud" as ReportReasonType, message:"Scam,fraud or spam" },
    { id: 7, value: "false_info" as ReportReasonType, message:"false information" },
  ];
  // handling opponent user  PostMenu

    const handleReportPost = async (reason:ReportReasonType)=>{
      try{
        setIsLoading(true)
          await reportPostApi(postId,reason)
          setIsReported(true)
      }catch(err){
        console.log("error",err)
          console.log(err);
          // if(err?.message){
          //   toast.error(err.message)
          // }else{

          //   toast.error("error in reporting  post");
          // }
           toast.error("error in reporting  post");
      }finally{
        setIsLoading(false)
      }
    }

 

  const loggedUserPostMenu = ()=> (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
      <div  className="flex flex-col items-center justify-center w-full bg-opacity-50 h-dvh bg-background-dark ">
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex justify-center items-center flex-col w-full md:max-h-[35rem]  max-w-[25rem] bg-background-light dark:bg-background-customDarkGray rounded"
        >
          {isDeleteModal ? (
            <div className="relative flex flex-col items-center justify-center w-full p-4 space-y-4 h-80">
              {isLoading ? (
                <LoaderSpinner loading={isLoading} />
              ) : (
                <>
                  <span className="text-text-black dark:text-text-white">
                    {" "}
                    Do you realy want to delete this post?
                  </span>

                  <div className="flex flex-row space-x-2">
                    <button
                      onClick={() => setIsDeleteModal(!isDeleteModal)}
                      className="px-2 bg-blue-500 rounded hover:bg-blue-600 text-text-white"
                    >
                      cancel
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="p-1 px-2 bg-red-500 rounded text-text-white"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : isEditDescription ? (
            <div className="relative flex flex-col items-center justify-center w-full p-2 space-y-4 h-80">
              {isLoading ? (
                <LoaderSpinner loading={isLoading} />
              ) : (
                <>
                  <span className=" text-text-black dark:text-text-white font-golos">
                    Update Post Description
                  </span>
                  <textarea
                    onChange={(e) => setContent(e.target.value)}
                    value={content}
                    className="w-full p-2 outline-none min-h-20 bg-background-lightGray dark:bg-background-charcoal text-text-black font-golos dark:text-text-white"
                    placeholder="description"
                  ></textarea>

                  <div className="flex flex-row space-x-2">
                    <button
                      onClick={() => setIsEditDescription(!isEditDescription)}
                      className="px-2 rounded bg-background-Grayish hover:bg-background-charcoal text-text-white"
                    >
                      cancel
                    </button>
                    <button
                      onClick={handleUpdatePost}
                      className="p-1 px-2 bg-blue-500 rounded hover:bg-blue-600 text-text-white"
                    >
                      Update
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <div
                onClick={() => setIsDeleteModal(!isDeleteModal)}
                className="flex items-center justify-center w-full p-2 border-b hover:bg-background-lightGray dark:hover:bg-background-charcoal border-background-charcoal"
              >
                <span className="text-red-500">Delete</span>
              </div>

              <div
                onClick={() => setIsEditDescription(!isEditDescription)}
                className="flex items-center justify-center w-full p-2 border-b hover:bg-background-lightGray dark:hover:bg-background-charcoal border-background-charcoal"
              >
                <span className="text-text-black font-golos dark:text-text-white">Edit</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const userPostMenu = () => (
    <div className="fixed inset-0 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
      <div onClick={()=> onClose()} className="flex flex-col items-center justify-center w-full bg-opacity-50 h-dvh bg-background-dark ">
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex justify-center items-center flex-col w-full md:max-h-[35rem]  max-w-[25rem] bg-background-light dark:bg-background-customDarkGray rounded"
        >
          <div className="flex flex-col w-full">
            {isReporting ? (
              <div className="flex flex-col justify-center w-full border-b cursor-pointer bg-background-light dark:bg-background-dark dark:border-background-charcoal">
               

              {
             isLoading?(
              <>
               <div className=" relative flex flex-row items-center w-full p-2 border-b border-background-charcoal">
                  <span className="absolute transform -translate-x-1/2 left-1/2 text-text-black dark:text-text-white font-golos">
                    Report
                  </span>

                  <IoCloseOutline onClick={()=>onClose()} className="flex ml-auto text-2xl font-bold cursor-pointer dark:text-text-white" />
                </div>

                <div className="relative flex flex-col items-center justify-center w-full p-4 space-y-4 h-80">
               <LoaderSpinner loading={isLoading}/>
                </div>
              </>
                ): isReported?(
                  <div className="flex flex-col items-center justify-center w-full p-4 space-y-4 h-80">
                    <GoCheckCircle className="text-5xl font-extrabold text-green-500" />
                    <span className="font-semibold dark:text-text-white font-outfit text-text-black">Thanks for your feedback</span>
                    <p className="text-sm text-text-darkGray font-golos">When you see something you don't like on Greo, you can report it if it doesn't follow our Community Standards, or you can remove the person who shared it from your experience.</p>
                   <button onClick={()=>onClose()} className="w-full p-2 bg-blue-500 rounded-md hover:bg-blue-600 text-text-white font-outfit">Close</button>
                  </div>
                ):(
                <> 
                 <div className="relative flex flex-row items-center w-full p-2 border-b border-background-charcoal">
                  <span className="absolute font-semibold transform -translate-x-1/2 left-1/2 text-text-black font-golos dark:text-text-white">
                    Report
                  </span>

                  <IoCloseOutline onClick={()=>onClose()} className="flex ml-auto text-2xl font-bold cursor-pointer dark:text-text-white" />
                </div>

                <div className="flex flex-col p-4 ">
                  <span className=" text-text-black font-golos dark:text-text-white">
                    Why are you reporting this post?
                  </span>

                  {
                    reportingReasons.map((reason)=>(
                      <div key={reason.id}  className="flex flex-row items-center w-full p-2 rounded hover:bg-background-lightGray dark:hover:bg-background-charcoal">
                    <div onClick={()=>handleReportPost(reason.value)} className="flex flex-row w-full py-2">
                      <span className="text-sm text-text-black font-outfit dark:text-text-white">{reason.message} </span>
                      <IoIosArrowForward className="flex ml-auto text-xl text-text-darkGray" />
                    </div>
                  </div>

))
}
                  
                </div>
</>
                )
              }
              </div>
            ) : (
              <div
                onClick={() => setIsReporting(true)}
                className="flex items-center justify-center w-full p-2 border-b cursor-pointer hover:bg-background-lightGray dark:hover:bg-background-charcoal border-background-charcoal"
              >
                <span className="text-red-500">Report</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  console.log("loggedUser", loggedUser?.username);
  console.log("username", username);
  return loggedUser?.username === username
    ? loggedUserPostMenu()
    : userPostMenu();
};

export default PostMenu;
