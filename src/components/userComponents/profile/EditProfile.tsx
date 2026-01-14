import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import {  useEffect, useState } from "react";
import FileInput from "../../ui/FileInput";
import ImageCropper from "../../ui/ImageCropper";
import { checkUsernameApi, updateProfileApi } from "../../../services/user/api";
import { updateUserData } from "../../../redux/slices/userSlice";
import {debounce} from 'lodash'
import { useNavigate } from "react-router-dom";
import { User } from "../../../redux/slices/userSlice";
import axios from "axios";

const EditProfile = () => {
    const user = useSelector((state:RootState)=>state.UserReducer.user as User)
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string>(user?.profileImage || "");
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState<boolean>(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const formik = useFormik({
    initialValues: {
      Name: user?.name??'',
      UserName: user?.username??'',
      Bio:user?.bio??'',
    },
    validationSchema: Yup.object({
      Name: Yup.string().required("Required")
      .trim()
      .test('not-only-whitespace', 'Name cannot be empty', (value) => { return value ? value.trim().length > 0 : false; }),
      UserName: Yup.string().required("Required")
      .matches(/^\S+$/, "Username cannot contain spaces"),
      Bio: Yup.string().trim()
    }),
    onSubmit: async (values) => {
      if (isUsernameAvailable === false) {
        formik.setFieldError("UserName", "Username already exists");
        return; 
      }
      
      // REMOVE THIS CONDITION: if(!isEditing){
      setIsLoading(true);
      try{
        const formData = new FormData();
        formData.append("name", values.Name);
        formData.append("username", values.UserName);
        formData.append("bio", values.Bio);
        
        if (croppedImage) {
            formData.append("profileImage", croppedImage);
        }

       const response = await updateProfileApi(formData)
       console.log('profile update response',response.data)
       const { id,name, username,  email, profileImage,  bio } = response.data;
       
        dispatch(updateUserData({ 
          id,
          name,
          username,
          profileImage,
          email,
          bio
        }));
        
        // Check if username changed before navigating
        const usernameChanged = username !== user?.username;
        
        // Reset edit mode
        setIsEditing(false);
        setCroppedImage(null);
        
        toast.success('Profile updated successfully!');
        
        // Only navigate if username actually changed
        if (usernameChanged) {
          navigate(`/profile/${username}`);
        } else {
          // // Reload the page to show updated data
          // window.location.reload();
        }
        
      }catch(err: any){
        console.log('error',err)
        
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else if (err.response?.data?.error) {
          toast.error(err.response.data.error);
        } else {
          toast.error('Something went wrong');
        }
      } finally {
        setIsLoading(false);
      }
      // REMOVE THIS: }
    },
  });

  const checkUsernameAvailability = debounce(async (username) => {
    if(username && username !== user?.username){
      try{
       await checkUsernameApi(username)

        formik.setFieldError("UserName", "");
        setIsUsernameAvailable(true); 
      }catch(err:unknown){
        if (axios.isAxiosError(err) && err.response) {
          formik.setFieldError("UserName", "Username already exists");
          setIsUsernameAvailable(false);
        } 
        console.log('Error checking username:',err)
      }
    } else {
      setIsUsernameAvailable(null);
    }
  },200)

  useEffect(() => {
    if (formik.values.UserName && isEditing) {
      checkUsernameAvailability(formik.values.UserName);
    }
  }, [formik.values.UserName, isEditing]);

  const onImageSelected = (selectedImage:File | string) =>{
    if(typeof selectedImage === "string"){
      setSelectedImage(selectedImage)
    }
    setIsCropping(true);
  }
  
   const onCancelCrop = ()=>{
    setIsCropping(false);
    setSelectedImage(user?.profileImage || '');
   }

   const onCropComplete = (croppedAreaPixels:string)=>{
    setCroppedImage(croppedAreaPixels)
    setSelectedImage(croppedAreaPixels);
    setIsCropping(false);
   }
 
   const handleEditToggle = () => {
     if (isEditing) {
       formik.resetForm();
       setSelectedImage(user?.profileImage || "");
       setCroppedImage(null);
       setIsUsernameAvailable(null);
     }
     setIsEditing(!isEditing);
   }

  return (
    <div className="flex flex-row items-center justify-center w-full h-full">
     <div className="flex flex-col items-center justify-center w-full h-full space-y-3">
      <div className={`relative flex overflow-hidden rounded-md w-80 h-72 ${isEditing && 'hover:bg-black hover:opacity-50'}`}>
        <img
          className="object-cover w-full h-full"
          src={selectedImage || "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740"}
          alt=""
        />
        {
          isEditing && (
            <FileInput acceptType="image" onSelectedFile={onImageSelected}/>
          )
        }
      </div>
            
      <div className="flex flex-col w-full max-w-xs mx-auto ">
        <label className="text-white py-1">Name</label>
        <input
          className={`w-full px-8 py-4 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white ${!isEditing && 'cursor-not-allowed'} ${isLoading && 'opacity-50'}`}
          type="text"
          name="Name"
          placeholder="name"
          value={formik.values.Name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={!isEditing || isLoading}
        />
        {formik.touched.Name && formik.errors.Name ? (
          <p className="ml-3 text-red-500">{formik.errors.Name}</p>
        ) : null}
        
        <label className="text-white py-1">Username</label>
        <input
          className={`w-full px-8 py-4 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white ${!isEditing && 'cursor-not-allowed'} ${isLoading && 'opacity-50'}`}
          type="text"
          placeholder="username"
          name="UserName"
          value={formik.values.UserName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={!isEditing || isLoading}
        />
        {formik.touched.UserName && formik.errors.UserName ? (
          <p className="ml-3 text-red-500">{formik.errors.UserName}</p>
        ) : (
          isUsernameAvailable === false && (
            <p className="ml-3 text-red-500">Username already exists</p>
          )
        )}

        <label className="text-white py-1">Bio</label>
        <textarea
          className={`w-full px-8 py-4 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white ${!isEditing && 'cursor-not-allowed'} ${isLoading && 'opacity-50'}`}
          placeholder="Bio"
          name="Bio"
          value={formik.values.Bio}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={!isEditing || isLoading}
          rows={3}
        />
        {formik.touched.Bio && formik.errors.Bio ? (
          <p className="ml-3 text-red-500">{formik.errors.Bio}</p>
        ) : null}

        <div className="flex gap-2 mt-5">
          {isEditing && (
            <button
              onClick={handleEditToggle}
              type="button"
              disabled={isLoading}
              className="flex-1 py-4 font-semibold tracking-wide text-gray-700 transition-all duration-300 ease-in-out bg-gray-200 rounded-lg hover:bg-gray-300 focus:shadow-outline focus:outline-none disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              if (isEditing) {
                formik.handleSubmit();
              } else {
                setIsEditing(true);
              }
            }}
            type="button"
            disabled={isLoading || (isEditing && !formik.isValid)}
            className={`flex-1 py-4 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out rounded-lg focus:shadow-outline focus:outline-none disabled:opacity-50 ${
              isLoading ? 'bg-indigo-400' : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Loading...'}
              </div>
            ) : isEditing ? 'Update Profile' : 'Edit Profile'}
          </button>
        </div>
      </div>
      
      {isCropping && (
        <ImageCropper image={selectedImage} onCropDone={onCropComplete} onCropCancel={onCancelCrop} isAspectRatios={false}/>
      )}
    </div>
    </div>
  );
};

export default EditProfile; 
