import { NavLink } from "react-router-dom";

//icons
import { FiSearch } from "react-icons/fi";
import { FaXmark } from "react-icons/fa6";
import { useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { GoHome } from "react-icons/go";
import { MdOutlineExplore } from "react-icons/md";
import { MdExplore } from "react-icons/md";
import { PiPlayCircle } from "react-icons/pi";
import { PiPlayCircleBold } from "react-icons/pi";
import { PiPlusSquareBold } from "react-icons/pi";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { HiChatBubbleOvalLeft } from "react-icons/hi2";
import { FaRegUser } from "react-icons/fa6";
import { FaUser } from "react-icons/fa6";
import { IoMdNotifications } from "react-icons/io";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const NavBar = () => {
  const [searchText, setSearchText] = useState<string>("");
  const username = useSelector((state: RootState) => state.UserReducer.user?.user_name);
  return (
    <>
      <nav className="flex flex-row items-center justify-between w-screen dark:bg-background-dark lg:px-16 ">
        <div className="z-10 flex flex-row items-center justify-between w-full gap-3 p-3 lg:justify-start ">
          <div>
            <span className="text-2xl font-bold text-black cursor-pointer font-outfit dark:text-text-white">
              Greo
            </span>
          </div>

          <div className="flex flex-row items-center justify-center space-x-2 ">
            <div className="flex flex-row items-center justify-center p-2 rounded-full bg-background-dark dark:bg-background-light ">
              <FiSearch className="text-2xl cursor-pointer text-text-Grayish" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="bg-background-dark dark:bg-background-light text-text-white dark:text-text-black focus:outline-none focus:ring-0 "
                placeholder="Search"
              />
              {searchText.trim() && (
                <FaXmark
                  onClick={() => setSearchText("")}
                  className="text-sm cursor-pointer text-text-Grayish"
                />
              )}
            </div>
          </div>
        </div>
        <div className="flex lg:space-x-6 md:space-x-5">
          <div className="z-10 hidden lg:flex lg:space-x-6 md:space-x-5">

          
          <div className="">
            <NavLink
              className={({ isActive }) =>
                `cursor-pointer font-golos p-2 px-4 rounded-full text-text-Grayish  ${
                  isActive && "bg-black dark:bg-white"
                }`
              }
              to="/"
            >
              Home
            </NavLink>
          </div>

          <div>
            <NavLink
              className={({ isActive }) =>
                ` cursor-pointer font-golos p-2 px-4 rounded-full text-text-Grayish  ${
                  isActive && "bg-black  dark:bg-white"
                }`
              }
              to="/chat"
            >
              Chat
            </NavLink>
          </div>


          <div>
            <NavLink
              className={({ isActive }) =>
                ` cursor-pointer font-golos p-2 px-4 rounded-full text-text-Grayish ${
                  isActive && "bg-black   dark:bg-white"
                }`
              }
              to="/roll"
            >
              Roll
            </NavLink>
          </div>

          <div>
            <NavLink
              className={({ isActive }) =>
                ` cursor-pointer font-golos p-2 px-4 rounded-full text-text-Grayish ${
                  isActive && "bg-black   dark:bg-white"
                }`
              }
              to="/explore"
            >
              Explore
            </NavLink>
          </div>

          <div>
            <NavLink
              className={({ isActive }) =>
                ` cursor-pointer font-golos p-2 px-4 rounded-full text-text-Grayish ${
                  isActive && "bg-black  dark:bg-white"
                }`
              }
              to={`profile/${username}`}
            >
              Profile
            </NavLink>
          </div>

          </div>
          <div>
            <NavLink
              className={({ isActive }) =>
                ` cursor-pointer text-text-Grayish ${
                  isActive && "text-black  dark:text-text-white"
                }`
              }
              to="notification"
            >
              <IoMdNotifications className="text-2xl " />
            </NavLink>
          </div>


        </div>
       

        {/* mobile navbar */}

        <div className="fixed bottom-0 flex flex-row items-center justify-between w-full p-3 lg:hidden bg-background-light dark:bg-background-dark sm:px-10 ">
          <div>
            <NavLink to="/">
              {({ isActive }) =>
                isActive ? (
                  <GoHomeFill className="text-3xl dark:text-text-white" />
                ) : (
                  <GoHome className="text-3xl dark:text-text-Grayish" />
                )
              }
            </NavLink>
          </div>

          <div>
            <NavLink to={"/explore"}>
              {({ isActive }) =>
                isActive ? (
                  <MdExplore className="text-3xl dark:text-text-white" />
                ) : (
                  <MdOutlineExplore className="text-3xl dark:text-text-Grayish" />
                )
              }
            </NavLink>
          </div>

          <div>
            <NavLink to={"/roll"}>
              {({ isActive }) =>
                isActive ? (
                  <PiPlayCircleBold className="text-3xl dark:text-text-white" />
                ) : (
                  <PiPlayCircle className="text-3xl dark:text-text-Grayish" />
                )
              }
            </NavLink>
          </div>

          <div>
            <PiPlusSquareBold className="text-3xl dark:text-text-Grayish" />
          </div>

          <div>
            <NavLink to={"/chat"}>
              {({ isActive }) =>
                isActive ? (
                  <HiChatBubbleOvalLeft className="text-3xl dark:text-text-white" />
                ) : (
                  <HiOutlineChatBubbleOvalLeft className="text-3xl dark:text-text-Grayish" />
                )
              }
            </NavLink>
          </div>

          <div>
            <NavLink to={`/profile/${username}`}>
              {({ isActive }) =>
                isActive ? (
                  <FaUser className="text-3xl dark:text-text-white" />
                ) : (
                  <FaRegUser className="text-3xl dark:text-text-Grayish" />
                )
              }
            </NavLink>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
