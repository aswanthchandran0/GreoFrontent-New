import { useEffect, useState } from "react";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images"
import { FaRegHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserDetails from "../userManagement/UserDetails";
import { getStackOfUsersApi } from "../../../services/admin/adminApi";

const PostDetails = ({data})=>{
   const [UserDetailsComponent,setUserDetailsComponent] = useState(false)
   const [userDetailsWithReasons, setUserDetailsWithReasons] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedUserId, setSelectedUserId] = useState(null);
    


  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userIds = data.users.map((user) => user.id);
        const response = await getStackOfUsersApi(userIds);
        const userDetails = response.data;
        
        const mergedData = userDetails.map((userDetail) => {
          const reasonData = data.users.find(
            (user) => user.id === userDetail._id // Match IDs
          );
          return {
            ...userDetail,
            reason: reasonData?.reason || "Unknown reason", // Include reason
          };
        });

        setUserDetailsWithReasons(mergedData);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [data]);



  const handleViewUserDetails = (userId) => {
    setSelectedUserId(userId); // Set the selected userId for viewing details
    setUserDetailsComponent(true); // Show the user details component
  };

    return (
        <div className="flex flex-col items-center w-full shadow md:m-2 ">

{
UserDetailsComponent ?
<UserDetails close={setUserDetailsComponent} userId={selectedUserId}/>
:
<>

<div className="flex flex-row w-full rounded shadow bg-background-light h-44 ">
  <div className="flex flex-row items-center justify-center w-1/4 bg-blue-500 rounded-l" >
  
  {/* <!-- Reports Section --> */}
  <div className="flex flex-col items-center justify-center">
    <span className="text-sm font-bold text-text-white">Reports</span>
    <span className="text-4xl font-bold text-text-white">{userDetailsWithReasons.length || 0}</span>
  </div>
  </div>

  {/* <!-- Table Section --> */}
  <div className="flex-1 overflow-auto">
    <table className="w-full border border-collapse border-gray-200 rounded-lg table-auto">
      <thead>
        <tr className="text-white bg-indigo-500">
          <th className="px-4 py-2 text-left">Users</th>
          <th className="px-4 py-2 text-left">Reason</th>
          <th className="px-4 py-2 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b">
          {
            userDetailsWithReasons && userDetailsWithReasons.map((user,index)=>(
              <>
<td className="px-4 py-2">{user.name}</td>
<td className="px-4 py-2">{user.reason}</td>
          <td
           onClick={() => handleViewUserDetails(user._id)}
          className="px-4 py-2">
            <button  className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600">
              view
            </button>
          </td>
              </>
            ))
          }
        </tr>
      </tbody>
    </table>
  </div>
  
  <div>

  </div>
</div>
<div className="flex flex-col items-center w-full shadow md:m-2 md:flex-row">
<div className="flex flex-col items-center w-1/2 m-2 ">


<div className="flex flex-col space-y-2">
  <div className="flex w-full h-full overflow-hidden rounded cursor-pointer max-w-96 max-h-96">
    <img className="flex object-cover w-full h-full" src={data.postDetails.mediaUrls[0]} alt="" />
  </div>

  
  <div className="flex flex-row justify-center w-full gap-5 p-2 rounded shadow">
  <div className="flex flex-col items-center justify-center">
    <FaRegHeart className="text-2xl text-indigo-500"/>
    <span className="font-semibold text-indigo-500 font-golos">{data.likeCount || 0}</span>
  </div>

  <div className="flex flex-col items-center justify-center">
  <FaRegComment  className="text-2xl text-indigo-500"/>
    <span className="font-semibold text-indigo-500 font-golos">{data.commentCount || 0}</span>
  </div>

  
  
  </div >
  <div className="flex flex-row justify-center w-full p-2 bg-indigo-500 rounded shadow">
  <div className="flex flex-col w-full p-2 ">
  <span className="text-lg font-semibold text-text-white">Description</span>
  <span className="font-semibold text-text-white">{data.postDetails.content}</span>
  </div>
  {/* <div className="flex items-center justify-center h-full p-2">
    <button className="w-full h-full px-4 font-bold text-indigo-500 rounded bg-background-light">view</button>
    </div> */}
  </div>
  
  </div>
</div>


<div className="flex flex-col items-center w-1/2 ">

<div className="flex flex-col space-y-2">
<div className="flex w-full h-full overflow-hidden rounded cursor-pointer max-w-96 max-h-96">
    <img className="flex object-cover w-full h-full" src={data.userDetails.profileImage || DEFAULT_PROFILE_IMAGE} alt="" />
  </div>

  <div className="flex flex-row justify-center w-full bg-indigo-500 rounded shadow">
    <div className="flex flex-col w-full p-2 ">
    <span className="font-semibold text-text-white">Name: {data.userDetails.name}</span>
  <span className="font-semibold text-text-white ">Username: {data.userDetails.user_name}</span>
  <span className="font-semibold text-text-white ">Bio: {data.userDetails.bio || "empty"}</span>
    </div>
    <div className="flex items-center justify-center h-full p-2">
    <button  onClick={() => handleViewUserDetails(data.userId)} className="w-full h-full px-4 font-bold text-indigo-500 rounded bg-background-light">view</button>
    </div>
  </div>
{/* 
  <div className="flex flex-row justify-center w-full gap-5 p-2 rounded shadow">
  <div className="flex flex-col items-center justify-center">
  <span className="font-semibold text-text-black font-golos">followers</span>
    <span className="font-semibold text-indigo-500 font-golos">0</span>
    </div>
    
    <div className="flex flex-col items-center justify-center">
    <span className="font-semibold text-text-black font-golos">following</span>
    <span className="font-semibold text-indigo-500 font-golos">0</span>
  </div>
  
  <div className="flex flex-col items-center justify-center">
  <span className="font-semibold text-text-black font-golos">posts</span>
  <span className="font-semibold text-indigo-500 font-golos">0</span>
  </div>
  
  </div> */}
  </div>
</div>
</div>
</>
    }
        </div>
    )
}

export default PostDetails