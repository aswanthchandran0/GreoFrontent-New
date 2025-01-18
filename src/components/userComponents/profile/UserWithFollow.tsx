import { useNavigate } from "react-router-dom"
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images"
import { User } from "../../../redux/slices/userSlice"

interface Props{
  user:User
  onClose:()=>void
}
const UserWithFollow:React.FC<Props>  = ({user,onClose})=>{
   const navigate = useNavigate()

   const handleProfileView = ()=>{
     navigate(`/profile/${user.user_name}`)
    onClose()
   }
    return(
        <div className="flex flex-row items-center p-2 my-2 rounded-md shadow bg-background-light dark:bg-background-charcoal">
          <div className="w-12 h-12 overflow-hidden rounded-full">
            <img src={user.profileImage || DEFAULT_PROFILE_IMAGE} alt="profile image" />
          </div>

          <div className="flex flex-col justify-center">
            <p className=" text-text-black dark:text-text-white font-golos">{user.name || 'name'} </p>
            <p className="text-sm text-text-black dark:text-text-white font-golos">{user.user_name || 'username'}</p>
          </div>
          
          <div onClick={handleProfileView } className="px-2 ml-auto bg-blue-500 rounded-md cursor-pointer text-text-white">
            view
          </div>
        </div>
    )
}


export default UserWithFollow