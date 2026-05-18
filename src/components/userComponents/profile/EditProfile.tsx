// src/components/userComponents/profile/EditProfile.tsx

import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import ImageCropper from "../../ui/ImageCropper";
import { checkUsernameApi, updateProfileApi } from "../../../services/user/api";
import { updateUserData } from "../../../redux/slices/userSlice";
import { debounce } from 'lodash';
import { useNavigate } from "react-router-dom";
import { User } from "../../../redux/slices/userSlice";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IoClose, 
  IoCamera, 
  IoCheckmark, 
  IoWarning,
  IoPersonOutline,
  IoAtOutline,
  IoDocumentTextOutline,
  IoMaleFemaleOutline,
  IoCalendarOutline,
  IoArrowBack
} from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import cloudinaryUploadService from "../../../services/CloudinaryService";

interface EditProfileProps {
  onClose: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ onClose }) => {
  const user = useSelector((state: RootState) => state.UserReducer.user as User);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [selectedImage, setSelectedImage] = useState<string>(user?.profileImage || "");
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      bio: user?.bio ?? '',
      gender: user?.gender ?? '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Name is required")
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .test('not-only-whitespace', 'Name cannot be empty', (value) => { 
          return value ? value.trim().length > 0 : false; 
        }),
      username: Yup.string()
        .required("Username is required")
        .matches(/^[a-zA-Z0-9_]{3,20}$/, "Username can only contain letters, numbers, and underscores (3-20 characters)")
        .test('no-spaces', "Username cannot contain spaces", (value) => {
          return value ? !value.includes(' ') : true;
        }),
      bio: Yup.string()
        .max(150, "Bio must be less than 150 characters")
        .trim(),
    }),
    onSubmit: async (values) => {
      if (isUsernameAvailable === false) {
        formik.setFieldError("username", "Username already exists");
        return;
      }
      
      setIsLoading(true);
      
      try {
        let profileImageUrl = user?.profileImage || "";
        
        // Upload image to Cloudinary if a new image is selected
        if (croppedImage) {
          setIsUploading(true);
          setUploadProgress(0);
          
          // Convert base64 to File object
          const response = await fetch(croppedImage);
          const blob = await response.blob();
          const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
          
          // Upload to Cloudinary
          const uploadResult = await cloudinaryUploadService.uploadFile(
            file,
            {
              folder: "profiles",
              tags: ["profile", user?.id],
            },
            (progress) => {
              setUploadProgress(progress.percent);
            },
            'image'
          );
          
          if (uploadResult.success && uploadResult.data) {
            profileImageUrl = uploadResult.data.secure_url;
            console.log('Cloudinary upload success:', profileImageUrl);
          } else {
            throw new Error(uploadResult.error || 'Failed to upload image');
          }
        } else if (imageFile) {
          setIsUploading(true);
          setUploadProgress(0);
          
          // Upload to Cloudinary
          const uploadResult = await cloudinaryUploadService.uploadFile(
            imageFile,
            {
              folder: "profiles",
              tags: ["profile", user?.id],
            },
            (progress) => {
              setUploadProgress(progress.percent);
            },
            'image'
          );
          
          if (uploadResult.success && uploadResult.data) {
            profileImageUrl = uploadResult.data.secure_url;
            console.log('Cloudinary upload success:', profileImageUrl);
          } else {
            throw new Error(uploadResult.error || 'Failed to upload image');
          }
        }
        
        setIsUploading(false);
        
        // Prepare data for backend
        const updateData = {
          name: values.name,
          username: values.username,
          bio: values.bio,
          gender: values.gender || undefined,
          profileImage: profileImageUrl, // Send the Cloudinary URL
        };
        
        console.log('Sending to backend:', updateData);
        
        // Update profile via API
        const response = await updateProfileApi(updateData);
        console.log('Profile update response:', response.data);
        
        const { id, name, username, email, profileImage, bio, gender } = response.data;
        
        dispatch(updateUserData({ 
          id, name, username, profileImage, email, bio, gender
        }));
        
        const usernameChanged = username !== user?.username;
        
        toast.success('Profile updated successfully!');
        
        if (usernameChanged) {
          navigate(`/profile/${username}`);
          onClose();
        } else {
          window.location.reload();
        }
        
      } catch (err: any) {
        console.log('Error:', err);
        setIsUploading(false);
        
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else if (err.response?.data?.error) {
          toast.error(err.response.data.error);
        } else {
          toast.error(err.message || 'Something went wrong');
        }
      } finally {
        setIsLoading(false);
        setUploadProgress(0);
      }
    },
  });

  const checkUsernameAvailability = debounce(async (username: string) => {
    if (username && username !== user?.username) {
      try {
        await checkUsernameApi(username);
        formik.setFieldError("username", "");
        setIsUsernameAvailable(true);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          formik.setFieldError("username", "Username already exists");
          setIsUsernameAvailable(false);
        }
        console.log('Error checking username:', err);
      }
    } else {
      setIsUsernameAvailable(null);
    }
  }, 500);

  useEffect(() => {
    if (formik.values.username && formik.values.username !== user?.username) {
      checkUsernameAvailability(formik.values.username);
    }
  }, [formik.values.username]);

  const onImageSelected = (file: File | string) => {
    if (typeof file === "string") {
      setSelectedImage(file);
    } else {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCancelCrop = () => {
    setIsCropping(false);
    setSelectedImage(user?.profileImage || "");
    setCroppedImage(null);
    setImageFile(null);
  };

  const onCropComplete = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setSelectedImage(croppedImageUrl);
    setIsCropping(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getUsernameStatusColor = () => {
    if (!formik.values.username) return "text-gray-400";
    if (formik.values.username === user?.username) return "text-gray-500";
    if (isUsernameAvailable === true) return "text-green-500";
    if (isUsernameAvailable === false) return "text-red-500";
    return "text-gray-400";
  };

  const getUsernameStatusIcon = () => {
    if (!formik.values.username) return null;
    if (formik.values.username === user?.username) return null;
    if (isUsernameAvailable === true) return <IoCheckmark className="w-4 h-4 text-green-500" />;
    if (isUsernameAvailable === false) return <IoWarning className="w-4 h-4 text-red-500" />;
    return null;
  };

  const handleBack = () => {
    onClose();
  };

  

  if (isCropping && selectedImage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Crop Profile Picture
            </h2>
            <button
              onClick={onCancelCrop}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>
          <ImageCropper
            image={selectedImage}
            onCropDone={onCropComplete}
            onCropCancel={onCancelCrop}
            isAspectRatios={true}
            aspectRatio={1}
          />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
              >
                <IoArrowBack className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Edit Profile
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Update your profile information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group"
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                  onClick={triggerFileInput}
                >
                  <img
                    src={selectedImage || `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128&name=${encodeURIComponent(formik.values.name || "User")}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200 ${
                    avatarHover ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <IoCamera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onImageSelected(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </div>
              <button
                onClick={triggerFileInput}
                className="mt-3 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Change profile photo
              </button>
              {isUploading && (
                <div className="mt-3 w-48">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <IoPersonOutline className="w-4 h-4" />
                    <span>Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Your full name"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    formik.touched.name && formik.errors.name
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  disabled={isLoading || isUploading}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-red-500">{formik.errors.name}</p>
                )}
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <IoAtOutline className="w-4 h-4" />
                    <span>Username</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="username"
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      formik.touched.username && formik.errors.username
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                    }`}
                    disabled={isLoading || isUploading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getUsernameStatusIcon()}
                  </div>
                </div>
                <p className={`mt-1 text-sm ${getUsernameStatusColor()}`}>
                  @{formik.values.username || 'username'}
                  {isUsernameAvailable === true && " - Username is available"}
                  {isUsernameAvailable === false && " - Username already taken"}
                </p>
                {formik.touched.username && formik.errors.username && (
                  <p className="mt-1 text-sm text-red-500">{formik.errors.username}</p>
                )}
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <IoDocumentTextOutline className="w-4 h-4" />
                    <span>Bio</span>
                  </div>
                </label>
                <textarea
                  name="bio"
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                    formik.touched.bio && formik.errors.bio
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  disabled={isLoading || isUploading}
                />
                <div className="flex justify-between mt-1">
                  {formik.touched.bio && formik.errors.bio && (
                    <p className="text-sm text-red-500">{formik.errors.bio}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {formik.values.bio.length}/150
                  </p>
                </div>
              </div>

              {/* Gender Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <IoMaleFemaleOutline className="w-4 h-4" />
                    <span>Gender</span>
                  </div>
                </label>
                <select
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  disabled={isLoading || isUploading}
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Join Date */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  {/* <IoCalendarOutline className="w-4 h-4" /> */}
                  {/* <span>Joined {new Date(user?.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span> */}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={onClose}
              disabled={isLoading || isUploading}
              className="flex-1 px-6 py-3 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 border border-gray-200 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => formik.handleSubmit()}
              disabled={isLoading || isUploading || !formik.isValid || (formik.values.username !== user?.username && isUsernameAvailable === false)}
              className="flex-1 px-6 py-3 font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading || isUploading ? (
                <>
                  <FaSpinner className="w-5 h-5 animate-spin" />
                  <span>{isUploading ? 'Uploading...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <IoCheckmark className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditProfile;