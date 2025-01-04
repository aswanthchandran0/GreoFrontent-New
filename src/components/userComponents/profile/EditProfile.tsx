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
  const formik = useFormik({
    initialValues: {
      Name: user?.name??'',
      UserName: user?.user_name??'',
      Bio:user?.user_bio??'',
    },
    validationSchema: Yup.object({
      Name: Yup.string().required("Required")
      .trim()
      .test('not-only-whitespace', 'Name cannot be empty', (value) => { return value ? value.trim().length > 0 : false; })
,
      UserName: Yup.string().required("Required")
      .matches(/^\S+$/, "Username cannot contain spaces"),
      Bio: Yup.string().trim()

    }),
    onSubmit: async (values) => {
      if (isUsernameAvailable === false) {
        formik.setFieldError("UserName", "Username already exists");
        console.log('request was reqaqchinign in ther')
        return; 
      }
        
      if(!isEditing){
      try{
        const formData = new FormData();
        formData.append("name", values.Name);
        formData.append("user_name", values.UserName);
        formData.append("user_bio", values.Bio);
        
        if (croppedImage) {
            formData.append("profileImage", croppedImage); // Use cropped image
        }

       const response =   await updateProfileApi(formData)
       const { id, profileImage, name, user_name, email, user_bio } = response.data;

          dispatch(updateUserData({ id,
            profileImage,
            name,
            user_name,
            email,
            user_bio
          }));
          
          navigate(`/profile/${values.UserName}`);
      }catch(err){
        console.log('error',err)
        // toast.error(err?.response?.data?.error)
        toast.error('something went wrong ')
      }
      }
    },
  });

  const checkUsernameAvailability = debounce(async (username) => {
    if(username){
    try{
     await checkUsernameApi(username)

      formik.setFieldError("UserName", ""); // Clear error if available
      setIsUsernameAvailable(true); 
    }catch(err:unknown){
      if (axios.isAxiosError(err) && err.response) {
        formik.setFieldError("UserName", "Username already exists");
        console.log('request was reaching in there')
        setIsUsernameAvailable(false);
      } 
      console.log('Error checking username:',err)
    }
  }
  },200)

  useEffect(() => {
    if (formik.values.UserName && isEditing) {
      checkUsernameAvailability(formik.values.UserName); // Call debounced function
    }
  }, [formik.values.UserName]);
  

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setSelectedImage(URL.createObjectURL(file));
  //     setIsCropping(true);
  //   }
  // };

  const onImageSelected = (selectedImage:string) =>{
    setSelectedImage(selectedImage)
    setIsCropping(true);

  }
   const onCancelCrop = ()=>{
    setIsCropping(false);
    setSelectedImage('')
   }

   const onCropComplete = (croppedAreaPixels:string)=>{
    setCroppedImage(croppedAreaPixels)
    setIsCropping(false);
   }
 
   const handleIsEditing =()=>{
    setIsEditing(!isEditing);
   }


  return (
    <div className="flex flex-row items-center justify-center w-full h-full">
     <div className="flex flex-col items-center justify-center w-full h-full space-y-3">
      <div className={`relative flex overflow-hidden rounded-md w-80 h-72 ${isEditing && 'hover:bg-black hover:opacity-50'} `}>
        <img
          className="object-cover w-full h-full"
          src={croppedImage ? croppedImage : selectedImage || "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740"}
          alt=""
          
        />
        {
          isEditing && (
            <FileInput acceptType="image" onSelectedFile={onImageSelected}/>
          )
        }
      </div>
       

     
            
      <div className="flex flex-col w-full max-w-xs mx-auto ">
        <input
          className={`w-full px-8 py-4 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white ${!isEditing && 'cursor-not-allowed'}`}
          type="text"
          name="Name"
          placeholder="name"
          value={formik.values.Name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={!isEditing}
        />
        {formik.touched.Name && formik.errors.Name ? (
          <p className="ml-3 text-red-500">{formik.errors.Name}</p>
        ) : null}
        <input
          className={`w-full px-8 py-4 mt-5 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white  ${!isEditing && 'cursor-not-allowed'}`}
          type="text"
          placeholder="username"
          name="UserName"
          value={formik.values.UserName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={!isEditing}
        />
{formik.touched.UserName && formik.errors.UserName ? (
  <p className="ml-3 text-red-500">{formik.errors.UserName}</p>
) : (
  isUsernameAvailable === false && (
    <p className="ml-3 text-red-500">Username already exists</p>
  )
)}



<input
          className={`w-full px-8 py-4 mt-5 text-sm font-medium placeholder-gray-500 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:bg-white  ${!isEditing && 'cursor-not-allowed'}`}
          type="text"
          placeholder="Bio"
          name="Bio"
          value={formik.values.Bio}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={!isEditing}
        />
        {formik.touched.Bio && formik.errors.Bio ? (
          <p className="ml-3 text-red-500">{formik.errors.Bio}</p>
        ) : null}

        <button
          onClick={() => {formik.handleSubmit();  handleIsEditing()}}
          type="button"
          className="flex items-center justify-center w-full py-4 mt-5 font-semibold tracking-wide text-gray-100 transition-all duration-300 ease-in-out bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:shadow-outline focus:outline-none"
        >
          <span  className="ml-3">{!isEditing?'Edit':'update'}</span>
        </button>
      </div>
      {isCropping && (
                <ImageCropper image={selectedImage} onCropDone={onCropComplete} onCropCancel={onCancelCrop} isAspectRatios={false}/>
            )}
    </div>
    </div>
  );
};

export default EditProfile;


//TODO: want to change the input box design
//TODO: image size want to reduce