import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../../../redux/store"
import { useNavigate, useParams } from "react-router-dom"
import { followUserApi, unfollowUserApi } from "../../../services/user/api"
import { useEffect, useState } from "react"
import { logOut, User } from "../../../redux/slices/userSlice"
import FollowersFollowing from "./FollowersFollowing"


export type showComponentType =  'Followers'|'Following'|null

interface UserProfileProps{
  profileUser:User | null
  initialIsFollowing:boolean
  initialFollowersCount:number
  followingCount:number
  postCount:number
}

const UserProfile:React.FC<UserProfileProps> = ({profileUser, initialIsFollowing,initialFollowersCount,followingCount,postCount})=>{
  const user = useSelector((state:RootState)=> state.UserReducer.user)
  const dispatch = useDispatch<AppDispatch>()
  const {username} = useParams()
  const navigate = useNavigate()

  const handleProfileEdit = ()=>{
    if(user?.user_name === username){
      navigate(`/profile/${username}/edit`);
    }
  }
   if(profileUser && profileUser?.otherUser === false){
    profileUser = user
   }
  // follow unfollow
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [isFollowerFollowingComponent,setIsFollowerFollowingComponent] = useState(false)
  const [showComponent,setShowComponet] = useState<showComponentType>(null)
  // Update followers count and following status when initial props change
  useEffect(() => {
    setFollowersCount(initialFollowersCount);
    setIsFollowing(initialIsFollowing);
  }, [initialFollowersCount, initialIsFollowing]);

  const handleFollow = async ()=>{
    if(isFollowing){
      setIsFollowingLoading(true)
    const response = await  unfollowUserApi(user?.id??'', profileUser?.id??'')
    if(response.status === 200){
      setIsFollowing(false)
      setFollowersCount((prev:number)=>prev-1)
      setIsFollowingLoading(false)
    }
    }else{
      setIsFollowingLoading(true)
     const response = await  followUserApi(user?.id??'', profileUser?.id??'')
     if(response.status === 200){    
      setIsFollowing(true)
      setFollowersCount((prev:number)=>prev+1)
       setIsFollowingLoading(false)
     }
    }
  }
  
   console.log("profile user",profileUser)

   // logOut

   const handleLogout = ()=>{
    dispatch(logOut())
    navigate('/auth/signin')
   }

     // Navigate to the message page
  const handleMessageClick = () => {
    navigate(`/chat/${profileUser?.id}`)
  }

  // handle onClose of followingComponent
  const OnCloseFollowerFollowingComponent = ()=>{
    setIsFollowerFollowingComponent(false)
  }

  // handle show followers , following component
  const handleShowComponet = (data:showComponentType)=>{
     setShowComponet(data)
     setIsFollowerFollowingComponent(true)
  }

  console.log('is following',isFollowing)
  
    return(
        <div className="flex flex-col items-center justify-center w-full ">
          <div className="overflow-hidden rounded-md cursor-pointer w-80 h-72">
            <img className="object-cover w-full h-full" src={profileUser?.profileImage?profileUser.profileImage:"https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729611509~exp=1729615109~hmac=f56084f44329d588f81849bc897a8533f197f38f12e1fd5d08aca16c67adffb4&w=740"} alt="" />
          </div>
       
          <div className="flex flex-col items-center justify-center space-y-2 ">

<div className="flex flex-col items-center justify-center">

          <span className="text-2xl font-semibold cursor-pointer font-zilla text-text-charcoal dark:text-text-white">{profileUser?.name??'user'}</span>
          <span className="text-sm font-semibold cursor-pointer font-zilla text-text-charcoal dark:text-text-Grayish">{profileUser?.user_name??'username'}</span>
        
</div>
           
          <div className="flex flex-row space-x-3 dark:text-text-white ">
            <div className="flex flex-col items-center justify-center">
              <span className="text-base font-medium cursor-pointer font-golos">followers</span>
              <span onClick={()=>handleShowComponet('Followers')} className="text-xl font-semibold cursor-pointer font-golos">{followersCount??0}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-base font-medium cursor-pointer font-golos">following</span>
              <span onClick={()=>handleShowComponet('Following')} className="text-xl font-semibold cursor-pointer font-golos">{followingCount??0}</span>
            </div>


            <div className="flex flex-col items-center justify-center">
              <span className="text-base font-medium cursor-pointer font-golos">post</span>
              <span className="text-xl font-semibold cursor-pointer font-golos">{postCount??0}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center dark:text-text-white">
            <span className="cursor-pointer">Bio:</span>
            <span className="w-full cursor-pointer max-w-80">
           {user?.user_bio}
           </span>
          </div>
          </div>

        
          <div className="flex flex-row py-3 space-x-4">
        {profileUser?.otherUser ? (
          <>
            <button onClick={handleFollow} className="p-1 px-2 bg-indigo-500 rounded hover:bg-indigo-600 text-text-white">
              {isFollowingLoading ? (
                <span>Loading...</span>
              ) : isFollowing ? (
                "Following"
              ) : (
                "Follow"
              )}
            </button>
            <button  onClick={handleMessageClick}  className="p-1 px-2 rounded dark:bg-text-white dark:text-text-charcoal bg-text-charcoal text-text-white">Message</button>
          </>
        ) : (
          <div className="flex space-x-2">
          <button onClick={handleProfileEdit} className="p-1 px-2 bg-indigo-500 rounded hover:bg-indigo-600 text-text-white">Edit Profile</button>
          <button onClick={handleLogout} className="p-1 px-2 rounded bg-background-light hover:bg-gray-100 text-text-black">logout</button>
          </div>
        )}
      </div>
           
           {
            isFollowerFollowingComponent && <FollowersFollowing  showComponent={showComponent} onClose={ OnCloseFollowerFollowingComponent} />
    
                        }
        </div>
    )
}


export default UserProfile