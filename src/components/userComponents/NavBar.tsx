// src/components/layout/NavBar.tsx

import React, { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { debounce } from "lodash";

// Icons
import { GoHome, GoHomeFill } from "react-icons/go";
import { MdExplore, MdOutlineExplore } from "react-icons/md";
import { PiPlayCircle, PiPlayCircleBold, PiPlusSquareBold } from "react-icons/pi";
import { HiOutlineChatBubbleOvalLeft, HiChatBubbleOvalLeft } from "react-icons/hi2";
import { FaUser, FaRegUser, FaSearch, FaTimes } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";

// Components
import SearchedUsersList from "./SearchedUsersList";
import Notification from "./notification/Notification";

// Services & Types
import { searchUsersApi, getUserNotificationApi } from "../../services/user/api";
import { User } from "../../redux/slices/userSlice";
import { IPost } from "../../Types/postTypes";
import { INotification } from "../../Types/notifications/notificationTypes";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";


interface Props {
  onNewPost: (post: IPost) => void;
}

const NavBar: React.FC<Props> = ({ onNewPost }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isUploadOptionComponent, setIsUploadOptionComponent] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.UserReducer.user);
  const username = user?.username;

  // Debounced search function
  const debouncedSearch = debounce(async (query: string) => {
    if (query.trim()) {
      try {
        setIsLoading(true);
        const response = await searchUsersApi(query);
        setSearchResults(response.data);
        setShowSearchResults(true);
      } catch (err) {
        console.log(err);
        toast.error("Something went wrong");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(searchText);
    return () => debouncedSearch.cancel();
  }, [searchText]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getUserNotificationApi();
        setNotifications(response.data);
      } catch (err) {
        console.log("Error in fetch notification", err);
      }
    };
    fetchNotifications();
  }, []);

  // Update unread count
  useEffect(() => {
    const unReadedNotifications = notifications.filter(
      (notification: INotification) => !notification.isRead
    );
    setUnreadCount(unReadedNotifications.length);
  }, [notifications]);

  const handleOnClose = () => {
    setSearchResults([]);
    setSearchText("");
    setIsSearchActive(false);
    setShowSearchResults(false);
  };

  const handleSearchFocus = () => {
    if (searchText.trim()) {
      setShowSearchResults(true);
    }
  };

  const setNotificationReaded = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
    setUnreadCount(0);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="text-2xl font-bold text-black dark:text-white font-outfit hover:opacity-80 transition-opacity"
              >
                Greo
              </button>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8" ref={searchRef}>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search"
                />
                {searchText.trim() && (
                  <button
                    onClick={() => {
                      setSearchText("");
                      setShowSearchResults(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showSearchResults && searchText && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50">
                    <SearchedUsersList
                      users={searchResults}
                      onClose={handleOnClose}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                <GoHomeFill className="w-6 h-6" />
              </NavLink>

              <NavLink
                to="/explore"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                <MdExplore className="w-6 h-6" />
              </NavLink>

              <NavLink
                to="/roll"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                <PiPlayCircleBold className="w-6 h-6" />
              </NavLink>

              <button
                onClick={() => setIsUploadOptionComponent(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <PiPlusSquareBold className="w-6 h-6" />
              </button>

              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                <HiChatBubbleOvalLeft className="w-6 h-6" />
              </NavLink>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <IoMdNotifications className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Profile */}
              <NavLink
                to={`/profile/${username}`}
                className={({ isActive }) =>
                  `p-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                <FaUser className="w-6 h-6" />
              </NavLink>
            </div>

            {/* Mobile Search Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsSearchActive(true)}
                className="p-2 text-gray-600 dark:text-gray-400"
              >
                <FaSearch className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchActive && (
          <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden">
            <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search"
                  autoFocus
                />
                <button
                  onClick={handleOnClose}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FaTimes className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
            {searchResults.length > 0 && (
              <div className="p-4">
                <SearchedUsersList users={searchResults} onClose={handleOnClose} isLoading={isLoading} />
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
        <div className="flex items-center justify-around h-16 px-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `p-2 flex flex-col items-center ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`
            }
          >
            {({ isActive }) =>
              isActive ? (
                <GoHomeFill className="w-6 h-6" />
              ) : (
                <GoHome className="w-6 h-6" />
              )
            }
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `p-2 flex flex-col items-center ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`
            }
          >
            {({ isActive }) =>
              isActive ? (
                <MdExplore className="w-6 h-6" />
              ) : (
                <MdOutlineExplore className="w-6 h-6" />
              )
            }
          </NavLink>

          <NavLink
            to="/roll"
            className={({ isActive }) =>
              `p-2 flex flex-col items-center ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`
            }
          >
            {({ isActive }) =>
              isActive ? (
                <PiPlayCircleBold className="w-6 h-6" />
              ) : (
                <PiPlayCircle className="w-6 h-6" />
              )
            }
          </NavLink>

          <button
            onClick={() => setIsUploadOptionComponent(true)}
            className="p-2 text-gray-600 dark:text-gray-400"
          >
            <PiPlusSquareBold className="w-6 h-6" />
          </button>

          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `p-2 flex flex-col items-center ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`
            }
          >
            {({ isActive }) =>
              isActive ? (
                <HiChatBubbleOvalLeft className="w-6 h-6" />
              ) : (
                <HiOutlineChatBubbleOvalLeft className="w-6 h-6" />
              )
            }
          </NavLink>

          <NavLink
            to={`/profile/${username}`}
            className={({ isActive }) =>
              `p-2 flex flex-col items-center ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`
            }
          >
            {({ isActive }) =>
              isActive ? (
                <FaUser className="w-6 h-6" />
              ) : (
                <FaRegUser className="w-6 h-6" />
              )
            }
          </NavLink>
        </div>
      </div>

      {/* Modals */}
      {/* {isUploadOptionComponent && (
        <UploadOption
          userId={user?.id || ""}
          onClose={() => setIsUploadOptionComponent(false)}
          setRefreshPosts={() => {}}
          refreshPosts={false}
          onNewPost={onNewPost}
        />
      )} */}

      {isNotificationOpen && (
        <Notification
          notifications={notifications}
          isLoading={isLoading}
          onClose={() => setIsNotificationOpen(false)}
          setNotificationReaded={setNotificationReaded}
          setNotification={setNotifications}
        />
      )}
    </>
  );
};

export default NavBar;