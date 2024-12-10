import { useEffect, useState } from "react"
import { getUserDetailsApi } from "../../../services/admin/adminApi"
import { User } from "../../../redux/slices/userSlice"
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images"
import UserPostCard from "../../userComponents/profile/UserPostCard"
import { IPost } from "../../../Types/postTypes"
import { IoArrowBackOutline } from "react-icons/io5";

interface props{
  onClose : ()=> void
  userId:string
}
const UserDetails:React.FC<props> = ({close,userId})=>{
  
 const [user, setUser] = useState<User | null>(null)
  const [followersCount,setFollowersCount] = useState(0)
  const [followingCount,setFollowingCount] = useState(0)
  const [postcount,setPostCount] = useState(0)
  const [posts,setPosts] = useState<IPost[] | []>([])
   useEffect(()=>{

    const fetchUser = async()=>{
        const response = await getUserDetailsApi(userId)
          setUser(response.data.user)
          setFollowersCount(response.data.followersCount)
          setFollowingCount(response.data.followingCount)
          setPosts(response.data.posts)
          setPostCount(response.data.posts.length)
    }
    fetchUser()
   },[])

   console.log(user)

    return(
        <div className="flex flex-col items-center justify-center w-full ">
          <div className="flex mr-auto text-xl">
          <IoArrowBackOutline className="cursor-pointer" onClick={()=>close(false)} />
          </div>
          <div className="overflow-hidden rounded-md cursor-pointer w-80 h-72 ">
            <img className="object-cover w-full h-full" src={user?.profileImage || DEFAULT_PROFILE_IMAGE} alt="" />
          </div>
       
          <div className="flex flex-col items-center justify-center space-y-2 ">

<div className="flex flex-col items-center justify-center">

          <span className="text-2xl font-semibold cursor-pointer font-zilla text-text-charcoal ">{user?.name ?? 'user'}</span>
          <span className="text-sm font-semibold cursor-pointer font-zilla text-text-charcoal dark:text-text-Grayish">{user?.user_name ??'username'}</span>
        
</div>
           
          <div className="flex flex-row space-x-3 ">
            <div className="flex flex-col items-center justify-center">
              <span className="text-base font-medium cursor-pointer font-golos">followers</span>
              <span className="text-xl font-semibold cursor-pointer font-golos">{followersCount}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-base font-medium cursor-pointer font-golos">following</span>
              <span className="text-xl font-semibold cursor-pointer font-golos">{followingCount}</span>
            </div>


            <div className="flex flex-col items-center justify-center">
              <span className="text-base font-medium cursor-pointer font-golos">post</span>
              <span className="text-xl font-semibold cursor-pointer font-golos">{postcount}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center dark:text-text-white">
            <span className="cursor-pointer">Bio:</span>
            <span className="w-full cursor-pointer max-w-80">
           bio
           </span>
          </div>
          </div>

        
          <div className="flex flex-row justify-center w-full py-3 space-x-4 ">
           
          <div className="grid w-full max-w-2xl grid-cols-2 overflow-y-scroll scrollbar-hide">
        {posts.map((post) => (
          <UserPostCard  key={post._id} post={post} />

        ))}
      </div>
     
    </div>
     
           
        </div>
    )
}


export default UserDetails