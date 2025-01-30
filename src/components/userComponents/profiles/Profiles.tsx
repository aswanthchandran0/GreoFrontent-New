import { ArrowLeft } from "lucide-react";
import ProfileCard from "./ProfileCard"
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Pagination from "../../ui/Pagination";
import { User } from "../../../redux/slices/userSlice";
import { getUserProfiles } from "../../../services/user/api";



  

const Profiles = ()=>{

  const [userProfiles, setUserProfiles] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,setTotalPages]= useState<number>(1)
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // Track if more users are available
  const itemsPerFetch = 4; // Fetch 8 items from backend
  const itemsPerPage = 4; // Show 4 items per page
  const navigate = useNavigate()

  console.log(hasMore)
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      try {
        const response = await getUserProfiles(currentPage, itemsPerFetch);
        console.log('response data',response.data)
        setUserProfiles(response.data.users); // Update state with fetched users
         setTotalPages(Math.ceil(response?.data.totalUsers / itemsPerPage))
         console.log('totoa users',response.data.totalUsers)
          // If response contains fewer users than expected, assume no more users
          setHasMore(response.data.length === itemsPerFetch);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [currentPage]); // Fetch data when the page changes



   // loading spinnner 
   const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-16 h-16 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin"></div>
    </div>
  );



    return (
        <div className="flex flex-col items-center justify-center w-full h-full col-span-2 ">
            

            <div className="flex w-full p-2">
                <ArrowLeft onClick={()=>navigate('/')} className="cursor-pointer text-text-black dark:text-text-white"/>
                  
            </div>
            <div className="flex flex-col w-full ">
           
        <h2 className="mb-8 text-3xl font-bold text-center text-gray-900 dark:text-text-white sm:text-4xl">
          Connect with Amazing People
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {   
          
          loading?(
            <div className="flex items-center justify-center w-screen h-full ">
              <LoadingSpinner />
            </div>
          ):(
            userProfiles.map(user => (
              <ProfileCard key={user.id} user={user} />
            ))
          )
         }
        </div>
  
   {/* Pagination */}
   <Pagination
          currentPage={currentPage}
          totalPages={totalPages} // Allow navigating to the next page only if more users exist
          onPageChange={setCurrentPage}
        />


        </div>
      </div>
    )
}

export default Profiles