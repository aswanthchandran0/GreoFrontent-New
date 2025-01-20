import { useState } from "react"
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images"
import { User } from "../../../redux/slices/userSlice"
import UserDetails from "../userManagement/UserDetails"

interface Props{
    user:User
}
const TopUser:React.FC<Props> = ({user})=>{
    const [UserDetailsComponent,setUserDetailsComponent] = useState(false)
    const handleUserDetailsComponent = ()=>{
        setUserDetailsComponent(true)
      }
    return(
        <>
        {
            UserDetailsComponent ?
    <div onClick={()=>setUserDetailsComponent(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div onClick={(e)=> e.stopPropagation()} className="max-w-6xl w-full rounded  bg-background-light h-[90vh]  overflow-y-scroll scrollbar-hide">
        <UserDetails close={setUserDetailsComponent} userId={user?._id || ''}/>
        </div>
    </div>
            :
        <div className="flex flex-col p-1"> 
        <div className="flex flex-row items-center w-full px-1 space-x-1 rounded shadow shadow-blue-100 h-14">
        <div className="flex items-center space-x-1 ">
            
       <div className="flex w-12 h-12 overflow-hidden rounded-full">
        <img className="object-cover w-full h-full" src={user.profileImage || DEFAULT_PROFILE_IMAGE} alt="" />
       </div>
       <div className="flex flex-col leading-none">
       <span className="text-md font-outfit">{user.name}</span>
       <span className="text-sm font-outfit">{user.user_name}</span>
       </div>
       </div>
       <div className="flex flex-row justify-end w-full gap-2 p-2">
        <span className="font-semibold text-green-600 font-outfit">{user.followersCount} followers</span>
    
        <div onClick={()=>handleUserDetailsComponent()} className="justify-center px-1 bg-blue-500 rounded text-text-white font-golos ">
            view
        </div>
      </div>
      </div>
        </div>
}
</>
    )
}

export default TopUser