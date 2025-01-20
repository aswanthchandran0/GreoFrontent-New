import { useEffect, useState } from "react";
import { getReportedPostApi } from "../../../services/admin/adminApi";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import PostDetails from "./PostDetails";
import { IPost } from "../../../Types/postTypes";
import BlockModal from "./BlockModal";
import { User } from "../../../redux/slices/userSlice";


export interface ViewPost {
  userId: string;
  postDetails: IPost;
  userDetails: User;
  likeCount: number;
  commentCount: number;
  users: User[];
}


export interface IReportedPost{
  _id:string,
  userId:string,
  postId:string,
  reportedCount:number,
  likeCount:number,
  commentCount:number
  createdAt:string
  postDetails:IPost
  userDetails:User
  users:User[]
  userName:string
}


const Posts = ()=>{

    const [reportedPosts,setReportedPosts] = useState<IReportedPost[]>([])
    const [isPostView,setIsPostView] = useState(false)
    const [viewPost,setViewPost] = useState<ViewPost | null>(null)
    const [isBlockModal,setIsBlockModal] = useState(false)
    const [selectedPostId, setSelectedPostId] = useState<string>('');
   const [selectedAction, setSelectedAction] = useState<boolean>(false);
  
  useEffect(()=>{
    const fetchReportedPosts = async()=>{
        const response = await getReportedPostApi()
        setReportedPosts(response.data)
    }
    fetchReportedPosts()
  },[])

  console.log("reported posts",reportedPosts)
  
  const handlePostView = (post:IPost,user:User,likeCount:number,commentCount:number,userId:string,users:User[])=>{
    // const Count = [...new Set(users.map(user =>user.userId))]
    const data:ViewPost =  {
        userId:userId,
        postDetails:post,
        userDetails:user,
        likeCount:likeCount,
        commentCount:commentCount,
        users:users,
        // repotedCount:Count

    }
      setViewPost(data) 
       setIsPostView(true)
      console.log('request was reaching inside the handle post')
  }

   const handleIsBlockModal = (postId:string,action:boolean)=>{
     setSelectedPostId(postId)
     setSelectedAction(action)
     setIsBlockModal(!isBlockModal)
   }
 
   

   useEffect(()=>{
    console.log('reported posts',reportedPosts)
   },[reportedPosts])
    return(
        <div className="flex flex-col items-center m-4">
     <div className="flex items-center w-full p-2 bg-indigo-500 rounded">
        <span className="text-xl text-text-white font-outfit"> Reported Posts</span>
     </div>
     

     {
        isPostView && viewPost ?
       <PostDetails data={viewPost} />
        :

        <div className="w-full mt-4 overflow-x-auto overflow-y-scroll ">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="text-white bg-indigo-500">
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Post</th>
              <th className="px-4 py-2 text-left">User Name</th>
              <th className="px-4 py-2 text-left">User Image</th>
              <th className="px-4 py-2 text-left">Reported Count</th>
              <th className="px-4 py-2 text-left">View Post</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {reportedPosts.map((post, index) => (
              <tr key={post.postId} className="border-b">
                <td className="px-4 py-2 font-bold text-center">{index + 1}</td>
                <td className="px-4 py-2">

                <img
                    src={post.postDetails.mediaUrls[0] || DEFAULT_PROFILE_IMAGE}
                    alt={post.userName}
                    className="w-12 h-12 rounded"
                  />

                </td>
                <td className="px-4 py-2">{post.userDetails.name}</td>
                <td className="px-4 py-2">
                  <img
                    src={post.userDetails.profileImage || DEFAULT_PROFILE_IMAGE}
                    alt={post.userName}
                    className="w-12 h-12 rounded-full"
                  />
                </td>
                <td className="px-4 py-2 font-bold text-center text-red-500 ">{[...new Set(post.users.map(user => user.id))].length}</td>
                <td className="px-4 py-2 text-center">
                  <button onClick={()=>handlePostView(post.postDetails,post.userDetails,post.likeCount,post.commentCount,post.userId,post.users)} className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                    view
                  </button>
                </td>
                <td className="px-4 py-2 text-center">
                  
                <button
                      onClick={()=>handleIsBlockModal(post.postId,!post.postDetails.isBlocked)}
                      className={`px-4 py-2 text-white rounded ${
                        post.postDetails.isBlocked
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {post.postDetails.isBlocked ? "Unblock" : "Block"}
                    </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     }

     {
      isBlockModal && <BlockModal isOpen={isBlockModal} onClose={()=>setIsBlockModal(false)}  setReportedPosts={setReportedPosts} postId={selectedPostId} action={selectedAction} />
     }
    
        </div>
    )

}

export default Posts