import { IoCloseOutline } from "react-icons/io5"
import UserWithFollow from "./profile/UserWithFollow"
import { User } from "../../redux/slices/userSlice"

interface Props{
    users:User[]
    onClose:()=>void
}

const SearchedUsersList:React.FC<Props> = ({users,onClose})=>{
    return(
        <div className="fixed inset-0 z-50 flex flex-col items-center rounded-md shadow-md bg-background-light dark:bg-background-customDarkGray top-16 md:top-20 md:left-8 md:h-96 md:w-96">
            
            <div className="relative flex flex-row items-center w-full p-2">
  <span className="absolute text-lg transform -translate-x-1/2 left-1/2 text-text-white font-outfit">Users</span>
   <IoCloseOutline onClick={()=>onClose()} className="flex ml-auto text-2xl font-bold cursor-pointer text-text-white" />
            </div>

            <div className="flex flex-col w-full h-full overflow-y-scroll scrollbar-hide">
            {
                users && users.map((user)=>(

                    <UserWithFollow key={user?.id} user={user} onClose={onClose}/>
                ))
            }
     
          <p className="text-center text-text-darkGray">no more users</p>
              </div>
        </div>
    )

}


export default SearchedUsersList