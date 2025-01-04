import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import { useEffect, useState } from "react";
import UserPostCard from "./UserPostCard";
import { IoMdAdd } from "react-icons/io";
import { useParams } from "react-router-dom";
import { IPost } from "../../../Types/postTypes";
import UploadOption from "./UploadOption";
import { getSavedItemApi, getUserRollApi } from "../../../services/user/api";
import UserRollCard from "./userRollCard";
import { SavedItem } from "../../../Types/savedItemTypes";
import SavedItemCard from "./SavedItemCard";
// Define types for props
interface User {
  id:string
  user_name: string;
  profileImage:string
}

interface UserPostsProps {
  user: User | null;
  posts: IPost[];
  setRefreshPosts: (value:boolean) => void;
  refreshPosts: boolean
}

export interface IRoll{
  _id:string,
  userId:string,
  thumbnail:string,
  mediaUrl: string,
  content?: string,
  createdAt:Date,
  name?: string;
  userName?:string
  profileImage?: string; 
  isLikedByViewingUser?:boolean
  likeCount?:number
  commentCount?:number
  isSaved:boolean
}

const UserPosts: React.FC<UserPostsProps> = ({ user, posts,setRefreshPosts,refreshPosts }) => {
  const [selectedOption, setSelectedOption] = useState("Posts");
  const [isUploadOptionComponent, setIsUploadOptionComponent] = useState<boolean>(false);
  const [rolls,setRolls] = useState<IRoll[]>([])
  // const userId = useSelector((state: RootState) => state.UserReducer.user?.id);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]); 
  const { username } = useParams();
 console.log("savedItems",savedItems)
  // for post update
  useEffect(() => {
    if (user && posts) {
      // Add user details to each post
      const postDetails = posts.map((post) => ({
        ...post,
        profileImage: user.profileImage,
        user_name: user.user_name,
      }));
      setUserPosts(postDetails);
    } else {
      // Use original posts if no user details
      setUserPosts(posts);
    }
  }, [ posts,user]);

  // for post or roll option change
  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };
 
// fetch user Roll 
useEffect(()=>{
  if(selectedOption == 'Roll'){
    const fetchUserRoll = async()=>{
      const response  = await getUserRollApi(user?.id??'')
      setRolls(response.data)
    }
    fetchUserRoll()
  } 
},[selectedOption,user?.id])


 // Fetch saved items when "Saved" is selected
 useEffect(() => {
  if (selectedOption === "Saved") {
    const fetchSavedItems = async () => {
      try {
        const response = await getSavedItemApi(); // Update with your API
        setSavedItems(response.data);
      } catch (error) {
        console.error("Error fetching saved items:", error);
      }
    };
    fetchSavedItems();
  }
}, [selectedOption, user?.id]);


const clearDeletePostCatch = (postId:string)=>{
   setUserPosts((posts)=> posts.filter(post => post._id !== postId))
}

console.log('posts',posts)


const handleUpdatePostCatch = (postId:string,content:string)=>{
  setUserPosts((posts)=> posts.map((post)=> post._id == postId ?{...post,content:content}:post))
}
  return (
    <div className="relative flex flex-col w-full">
      <div className="flex flex-row items-center justify-center space-x-3 md:justify-end ">
        {username === user?.user_name && (
          <button    onClick={() => setIsUploadOptionComponent(true)} className="relative flex flex-row items-center justify-center p-1 text-white border rounded-md hover:bg-white hover:text-text-Grayish ">
            <IoMdAdd className="text-md" />
         
            <p className="text-md">upload</p>
          </button>
        )}

        <div className="flex justify-end">
          <Dropdown>
            <MenuButton>{selectedOption}</MenuButton>
            <Menu>
              <MenuItem onClick={() => handleOptionChange("Posts")}>
                Posts
              </MenuItem>
              <MenuItem onClick={() => handleOptionChange("Roll")}>
                Roll
              </MenuItem>
              <MenuItem onClick={() => handleOptionChange("Saved")}>
                Saved
              </MenuItem>
            </Menu>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-2 overflow-y-scroll scrollbar-hide">

        {selectedOption =='Posts' && userPosts.map((post) => (
          <UserPostCard key={post._id} post={post}  clearDeletePostCatch={clearDeletePostCatch} handleUpdatePostCatch={handleUpdatePostCatch}/>
        ))}
      </div>
   
      <div className="grid grid-cols-2 overflow-y-scroll scrollbar-hide">
   {
    selectedOption =='Roll' &&  rolls.map((roll)=>(
      <UserRollCard roll={roll} />
    ))
   }

{selectedOption === "Saved" &&
    savedItems.map((savedItem, index) =>
      savedItem.items.map((item, itemIndex) => (
        <SavedItemCard
          key={itemIndex}
          item={{
            type: item.type,
            postData: item.type === "post" ? item.postData : undefined,
            rollData: item.type === "roll" ? item.rollData : undefined,
          }}
        />
      ))
    )}

   </div>
{isUploadOptionComponent && (
        <UploadOption
          userId={user?.id || ""}
          onClose={() => setIsUploadOptionComponent(false)}
          setRefreshPosts={setRefreshPosts}
          refreshPosts={refreshPosts}
        />
      )}

    </div>
  );
};

export default UserPosts;
