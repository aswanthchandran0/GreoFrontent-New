import { useEffect, useState } from "react"
import { getAllUser } from "../../../services/admin/adminApi";
import SuspendConformationModal from "./SuspendConformation";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import UserDetails from "./UserDetails";

interface User {
  id:string
  no: number;
  profileImage: string;
  name: string;
  user_name:string
  email: string;
  is_suspended: boolean;
}


const usersHeader = [
  {name:'No'},
  {name:'profile'},
  {name:'Username'},
  {name:'Email'},
  {name:'Status'},
  {name:'Action'},
  {name:'Details'}
]

const Users:React.FC = ()=>{
    const [users,setUsers] = useState<User[]>([])
    const [username,setUserName] = useState<string|null>(null)
    const [UserDetailsComponent,setUserDetailsComponent] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; username: string, is_suspended:boolean }>({ id: '', username: '', is_suspended:false });
  
    console.log('users',users,username)
    const [userId,setUserId] = useState('')
  useEffect(()=>{
    const fetchUsers = async ()=>{
      const response =   await getAllUser()
      console.log('response data',response.data)
      setUsers(response.data)
    }
     fetchUsers()
  },[])

const handleUserDetailsComponent = (username:string,userId:string)=>{
  setUserName(username)
  setUserId(userId)
  setUserDetailsComponent(true)
}

const openSuspendModal = (id: string, username: string,is_suspended:boolean) => {
  setSelectedUser({ id, username,is_suspended });
  setIsModalOpen(true);
};

const updateUserSuspendedStatus = (id: string) => {
  setUsers((prevUsers) =>
    prevUsers.map((user) =>
      user.id === id ? { ...user, is_suspended: true } : user
    )
  );
};

const UpdateUserUnSuspendedStatus = (id: string) => {
  setUsers((prevUsers) =>
    prevUsers.map((user) =>
      user.id === id ? { ...user, is_suspended: false } : user
    )
  );
};

    return(
    <>
  
  {
      UserDetailsComponent ?

        <UserDetails close={setUserDetailsComponent} userId={userId}/>
      :
  <div className="flex flex-col space-y-4 ">
  <div className="flex items-center w-full h-16 p-3 rounded-lg shadow-sm bg-background">
    <span className="text-xl font-bold md:text-2xl font-lato text-primary">User</span>
  </div>
  <div className="w-full p-3 overflow-x-auto rounded-lg bg-background">
    
  

    <table className="min-w-full rounded-lg table-auto">
      <thead className="bg-gray-100">
        <tr>
          {usersHeader.map((header, index) => (
            <th key={index} className="px-4 py-2 text-sm font-bold text-left text-gray-600 md:text-lg">
              {header.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="w-full h-20 overflow-y-auto">
        {users && users.map((user, index) => (
          <tr key={index} className="border-b hover:bg-gray-50">
            <td className="px-4 py-2 text-sm md:text-lg">{index + 1}</td>
            <td className="px-4 py-2 text-sm md:text-lg">
              <div  className="overflow-hidden rounded-full shadow-sm sm:w-5 sm:h-5 md:w-14 md:h-14">
              <img className="object-cover w-full h-full" src={user.profileImage?user.profileImage:DEFAULT_PROFILE_IMAGE} alt="" />
              </div>
            </td>
            <td className="px-4 py-2 text-sm md:text-lg">{user.user_name}</td>
            <td className="px-4 py-2 text-sm md:text-lg">{user.email}</td>

            <td className={`py-2 text-sm md:text-lg px-4`}>
              
              <span className={` font-lato ${user.is_suspended? 'text-red-500'  : 'text-green-500' }`}>{user.is_suspended?'Suspended':'active'}</span>
              </td>
       
            <td onClick={()=>openSuspendModal(user.id, user.user_name,user.is_suspended)} className="px-4 py-2 text-sm md:text-md">

             <span className={`${user.is_suspended?  'bg-green-500 ':'bg-red-500'}  cursor-pointer  text-text_white font-bold rounded font-lato p-2`}>{user.is_suspended?'unSuspend':'Suspend'}</span>
            </td>
          <td onClick={()=>handleUserDetailsComponent(user.user_name,user.id)} className="px-4 px-6 py-2 text-sm text-blue-600 cursor-pointer md:text-lg">view</td>
          </tr>
        ))}
      </tbody>
    </table>

  </div>
</div>
        }

<SuspendConformationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        id={selectedUser.id}
        username={selectedUser.username}
        is_suspended={selectedUser.is_suspended}
        onSuspend={updateUserSuspendedStatus}
        onUnSuspend={UpdateUserUnSuspendedStatus}
      />
    </>
   )
}


export default Users