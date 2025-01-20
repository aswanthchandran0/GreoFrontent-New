import { IoClose, IoMoon, IoSunny } from "react-icons/io5";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { logOut, User } from "../../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { MdArrowForwardIos } from "react-icons/md";
import { useEffect} from "react";
import { toggleDarkMode } from "../../../redux/slices/preferenceSlice";

interface Props {
  onClose: () => void;
  user:User | null
}

const Settings: React.FC<Props> = ({ onClose,user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state:RootState)=>state.preferences.darkMode)


    // Sync dark mode state with the DOM
    useEffect(() => {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, [isDarkMode]);

    
  // logout handling
  const handleLogout = () => {
    dispatch(logOut());
    navigate("/auth/signin");
  };

  // handle password change option
  const handleIsChangePassword = ()=>{
    dispatch(logOut())
    navigate("/auth/forgotpassword")
  }

// Toggle dark mode
const handleToggleDarkMode = () => {
  dispatch(toggleDarkMode());
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
      <div
        onClick={onClose}
        className="flex flex-col items-end justify-center w-full h-screen bg-opacity-50 "
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col w-full h-full max-w-sm p-5 shadow-md bg-background-light dark:bg-background-customDarkGray"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xl text-text-black dark:text-text-white font-outfit">
              Settings
            </span>
            <IoClose
              onClick={onClose}
              className="text-2xl cursor-pointer text-text-Grayish font-outfit"
            />
          </div>

          <div className="flex flex-col w-full h-full py-4 space-y-2 overflow-y-scroll scrollbar-hide">
            <div className="flex pt-3">
              <span className="font-bold text-text-black dark:text-text-white text-md">Account</span>
            </div>
            <div className="flex flex-col w-full ">
              <span className="text-text-black dark:text-text-white">Email</span>

              <div className="flex w-full ">
                <input
                  readOnly
                  className="flex w-full p-2 rounded outline-none cursor-pointer bg-background-lightGray dark:bg-background-charcoal text-text-black dark:text-text-white"
                  type="text"
                  placeholder={user?.email ?? 'example@gmail.com'}
                />
              </div>
            </div>

            <div className="flex flex-col w-full ">
          
       
                 <div className="flex flex-col w-full space-y-2">
                  <span className="text-text-black dark:text-text-white">Password</span>
                  <div
                    onClick={handleIsChangePassword }
                    className="flex items-center justify-between w-full p-2 rounded cursor-pointer group hover:bg-background-Grayish dark:hover:bg-background-customGray bg-background-lightGray dark:bg-background-charcoal "
                  >
                    <span className="text-text-black group-hover:text-text-white dark:text-text-white">Change password</span>
                    <MdArrowForwardIos className="text-xl text-text-Grayish group-hover:text-text-white dark:text-text-white" />
                  </div>
                  </div>
                 
                 {/* themes */}
                  <div className="flex pt-4">
              <span className="font-bold text-text-white text-md">Themes</span>
            </div>

            <div  onClick={handleToggleDarkMode} className={`cursor-pointer flex items-center justify-between transition-all duration-500 w-full p-2 py-3 my-2 space-x-1 rounded ${isDarkMode?'bg-background-dark ':'bg-background-light shadow'} `}>
              {
              isDarkMode ?
              <IoMoon className="text-xl animate-pulse text-text-white"/>
              :
              <IoSunny className="text-2xl text-yellow-600 animate-pulse"/>
              }
                     <span className={`transition-all duration-300 ${isDarkMode?'text-text-white font-bold ':'text-text-black font-bold'}`}>{` ${isDarkMode?'Dark mode ' :'Light mode'}`}</span>
                     <MdArrowForwardIos className={` transition-all duration-300 ${isDarkMode?'text-text-white  ':'text-text-black '}`} />
                  </div>
            </div>

            <div className="flex-grow"></div>
            {/* logout out area */}
            <div className="flex flex-row items-center w-full p-2 mt-auto space-x-1 rounded shadow bg-background-light dark:bg-background-charcoal">
              <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-full">
                <img
                  className="object-cover w-full h-full"
                  src={user?.profileImage || DEFAULT_PROFILE_IMAGE}
                  alt=""
                />
              </div>

              <div className="flex flex-col ">
                <span className="font-golos text-text-black dark:text-text-white">{user?.name || 'user'}</span>
              </div>

              <div className="flex justify-end w-full">
                <button
                  onClick={handleLogout}
                  className="p-1 px-2 rounded text-text-white bg-background-charcoal dark:bg-background-EerieBlack"
                >
                  logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
