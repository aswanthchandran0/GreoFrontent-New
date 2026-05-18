// src/components/userComponents/profile/Settings.tsx

import { motion, AnimatePresence } from "framer-motion";
import { 
  IoClose, 
  IoMoon, 
  IoSunny,
  IoLogOutOutline,
  IoKeyOutline,
  IoMailOutline,
  IoPersonOutline,
  IoShieldOutline,
  IoChevronForward,
} from "react-icons/io5";
import { FaRegHeart, FaUsers, FaUserFriends } from "react-icons/fa";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { AppDispatch, RootState } from "../../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { logOut, User } from "../../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toggleDarkMode } from "../../../redux/slices/preferenceSlice";

interface Props {
  onClose: () => void;
  user: User | null;
  followersCount?: number;
  followingCount?: number;
  postCount?: number;
}

const Settings: React.FC<Props> = ({ onClose, user, followersCount, followingCount, postCount }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state: RootState) => state.preferences.darkMode);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync dark mode state with the DOM
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Logout handling
  const handleLogout = () => {
    dispatch(logOut());
    navigate("/get-started");
  };

  // Handle password change option
  const handleChangePassword = () => {
    dispatch(logOut());
    navigate("/auth/forgotpassword");
    onClose();
  };

  // Toggle dark mode
  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  // Format join date properly
  const formatJoinDate = (date?: string | Date) => {
    if (!date) return "Member since 2024";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Member since 2024";
    return `Member since ${dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  // Settings sections
  const settingsSections = [
    {
      id: "account",
      title: "Account",
      icon: <IoPersonOutline className="w-5 h-5" />,
      items: [
        {
          id: "email",
          label: "Email Address",
          value: user?.email,
          icon: <IoPersonOutline className="w-4 h-4" />,
          action: null,
        },
        {
          id: "password",
          label: "Password",
          value: "••••••••",
          icon: <IoKeyOutline className="w-4 h-4" />,
          action: handleChangePassword,
          actionLabel: "Change",
        },
      ],
    },
    {
      id: "preferences",
      title: "Preferences",
      icon: <IoShieldOutline className="w-5 h-5" />,
      items: [
        {
          id: "darkMode",
          label: "Dark Mode",
          icon: isDarkMode ? <IoMoon className="w-4 h-4" /> : <IoSunny className="w-4 h-4" />,
          isToggle: true,
          toggleValue: isDarkMode,
          onToggle: handleToggleDarkMode,
        },
      ],
    },
  ];

  // Stats items - using passed props for real-time counts
  const stats = [
    { label: "Posts", value: postCount ?? user?.postCount ?? 0, icon: <FaRegHeart className="w-4 h-4" /> },
    { label: "Followers", value: followersCount ?? user?.followersCount ?? 0, icon: <FaUsers className="w-4 h-4" /> },
    { label: "Following", value: followingCount ?? user?.followingCount ?? 0, icon: <FaUserFriends className="w-4 h-4" /> },
  ];

  // Custom scrollbar styles
  const scrollbarStyles = "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Customize your experience
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          {/* Content with custom scrollbar */}
          <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${scrollbarStyles}`}>
            {/* Profile Section */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-200 dark:border-purple-800">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500">
                  <img
                    src={user?.profileImage || DEFAULT_PROFILE_IMAGE}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user?.name || "User"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{user?.username}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {formatJoinDate(user?.createdAt)}
                </p>
              </div>
            </div>

            {/* Stats Section - Now shows real-time counts */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-center mb-1 text-purple-500">
                    {stat.icon}
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Settings Sections */}
            {settingsSections.map((section) => (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    {section.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h4>
                </div>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400 group-hover:text-purple-500 transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.label}
                          </p>
                          {item.value && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.value}
                            </p>
                          )}
                        </div>
                      </div>
                      {item.isToggle ? (
                        <button
                          onClick={item.onToggle}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                            item.toggleValue
                              ? 'bg-purple-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              item.toggleValue ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : item.action ? (
                        <button
                          onClick={item.action}
                          className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                          <span>{item.actionLabel || "Edit"}</span>
                          <IoChevronForward className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Logout Button */}
            <div className="pt-4">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-200 group"
              >
                <IoLogOutOutline className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Logout</span>
              </button>
            </div>

            {/* Version Info */}
            <div className="text-center pt-4">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Version 1.0.0 • © 2024 Greo
              </p>
            </div>
          </div>

          {/* Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <IoLogOutOutline className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Logout
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Are you sure you want to logout? You'll need to sign in again to access your account.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Settings;