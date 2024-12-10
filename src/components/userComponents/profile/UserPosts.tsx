import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import { useEffect, useState } from "react";
import UserPostCard from "./UserPostCard";
import { IoMdAdd } from "react-icons/io";
import FileInput from "../../ui/FileInput";
import ImageCropper from "../../ui/ImageCropper";
import UploadPost from "./UploadPost";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { postUploadApi } from "../../../services/user/api";
import { RootState } from "../../../redux/store";
import { IPost } from "../../../Types/postTypes";
import Comments from "../post/Comments";

// Define types for props
interface User {
  user_name: string;
  profileImage:string
}

interface UserPostsProps {
  user: User | null;
  posts: IPost[];
  setRefreshPosts: (value:boolean) => void;
  refreshPosts: boolean
}

const UserPosts: React.FC<UserPostsProps> = ({ user, posts,setRefreshPosts,refreshPosts }) => {
  const [selectedOption, setSelectedOption] = useState("Posts");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const userId = useSelector((state: RootState) => state.UserReducer.user?.id);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const { username } = useParams();

  console.log('profiel user in user post',user)
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
  }, [ posts]);

  // for post or roll option change
  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  //file selecting
  const onSelectedFile = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      setIsCropping(true);
    }
  };

  //file cropping
  const onCropComplete = (croppedDataURL: string) => {
    setCroppedImage(croppedDataURL);
    setIsCropping(false);
  };

  const onCancelCrop = () => {
    setCroppedImage(null);
    setIsCropping(false);
  };

  // upload file
  const onUploadFile = async (
    file: File,
    userId: string,
    mediaType: string,
    comment: string
  ) => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("userId", userId);
    formData.append("mediaType", mediaType);
    formData.append("comment", comment);
    setSelectedFile("");
    setCroppedImage(null);
    try {
   await postUploadApi(formData);
      setRefreshPosts(!refreshPosts);
    } catch (error) {
      console.error("Error uploading post:", error);
    }
  };

  const onCancelUpload = () => {
    setCroppedImage(null);
    setIsCropping(true);
  };


  return (
    <div className="relative flex flex-col w-full">
      <div className="flex flex-row items-center justify-center space-x-3 md:justify-end ">
        {username === user?.user_name && (
          <button className="relative flex flex-row items-center justify-center p-1 text-white border rounded-md hover:bg-white hover:text-text-Grayish ">
            <IoMdAdd className="text-md" />
            <FileInput acceptType="both" onSelectedFile={onSelectedFile} />

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
            </Menu>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-2 overflow-y-scroll scrollbar-hide">
        {userPosts.map((post) => (
          <UserPostCard key={post._id} post={post} />
        ))}
      </div>
      {isCropping && (
        <ImageCropper
          image={selectedFile}
          onCropDone={onCropComplete}
          onCropCancel={onCancelCrop}
          isAspectRatios={true}
        />
      )}

      {croppedImage && (
        <UploadPost
          file={croppedImage}
          onUploadFile={onUploadFile}
          onCancelUpload={onCancelUpload}
          userId={userId}
        />
      )}


    </div>
  );
};

export default UserPosts;
