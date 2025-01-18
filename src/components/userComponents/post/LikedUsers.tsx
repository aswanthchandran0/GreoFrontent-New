import { useEffect, useState } from "react"
import { IoCloseOutline } from "react-icons/io5"
import { User } from "../../../redux/slices/userSlice"
import { getLikedUsersApi } from "../../../services/user/api"
import UserWithFollow from "../profile/UserWithFollow"

interface Props{
    postId:string
    onClose:()=>void
}

const LikedUsers:React.FC<Props> = ({postId,onClose})=>{
    const [users,setUsers] = useState<User[]|[]>([])

    useEffect(()=>{
   const handleFetchUsers = async ()=>{
  const response = await getLikedUsersApi(postId)
    setUsers(response.data)
   }
   handleFetchUsers()
    },[postId])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
            <div className="flex flex-col items-center justify-center w-full h-screen bg-opacity-50 bg-background-dark">
            <div className="flex flex-col w-full items-center h-full max-w-md max-h-[70vh] rounded-md bg-background-light dark:bg-background-customDarkGray ">
                 <div className="relative flex flex-row items-center justify-center w-full p-3 border-b border-text-charcoal">
                                <p className="absolute font-semibold cursor-pointer text-text-black dark:text-text-white font-outfit">Likes</p>
                                <IoCloseOutline onClick={onClose} className="flex ml-auto text-2xl font-bold cursor-pointer text-text-black dark:text-text-white"/>
                            </div>
                            <div className="flex flex-col w-full h-full overflow-y-scroll scrollbar-hide">
    {
        users.length> 0 && users?.map((user)=>(
            <UserWithFollow key={user.id} user={user} onClose={onClose} />
        ))
    }
    </div>
</div>
</div>
        </div>
    )
}

export default LikedUsers