import { useEffect, useState } from "react";
import UserRegistractionGraph from "./RegistrationGraph";
import TopUsers from "./TopUsers";
import UserAnalytics from "./UserAnalytics";
import { getAllUser, getTop10Users } from "../../../services/admin/adminApi";
import { User } from "../../../redux/slices/userSlice";
// import { useSocket } from "../../../context/SocketContext";
import PostGrowthGraph from "./PostGrowthGraph";

const Dashboard = () => {
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [suspendedUsers, setSuspendedUsers] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [top10Users,setTop10users] = useState<User[]>([])
  // const { socket } = useSocket();

  console.log('top10Users in Dashboard',top10Users)
  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getAllUser();
  
      console.log("response data in fetch users", response.data.data.users);
      const suspended = response.data.data.users.filter(
        (user: User) => user.isSuspended === true
      );
      setUsers(response.data.data.users);
      setTotalUsers(response.data.data.users.length);
      setSuspendedUsers(suspended.users.length);
    };
    fetchUsers();
  }, []);

  // fetchTOp10user 
  useEffect(()=>{
   const fetchTop10Users = async ()=>{
    const response = await getTop10Users()
  
    
     setTop10users(response.data.data.topUsers)
   }
   fetchTop10Users()
  },[])

  // Get active users from socket
 

  return (
    <div className="flex flex-col w-full h-full space-y-3">
      <div className="flex flex-col items-center space-y-2 md:space-x-4 md:flex-row">
        <UserAnalytics
          totalUsers={totalUsers}
          suspendedUsers={suspendedUsers}
          activeUsers={activeUsers}
        />
        <UserRegistractionGraph users={users} />
      </div>
      <div className="flex flex-col items-center space-y-2 md:space-x-4 md:flex-row">
       <PostGrowthGraph/>
        <TopUsers users={top10Users} />
      </div>
    </div>
  );
};

export default Dashboard;
