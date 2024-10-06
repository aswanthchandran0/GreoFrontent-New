import { NavLink } from "react-router-dom";

//icons
import { FiSearch } from "react-icons/fi";
import { FaXmark } from "react-icons/fa6";
import { useState } from "react";
import { TbHeart } from "react-icons/tb";
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

const NavBar = () => {
  const [searchText, setSearchText] = useState<string>("");

  return (
    <>
      <nav className="flex flex-row dark:bg-background-dark  justify-between items-center  w-screen lg:px-16  ">
        <div className="flex flex-row items-center justify-between  p-3    z-10 gap-3  w-full lg:justify-start   ">

          <div>

          <span className="font-outfit text-2xl text-black dark:text-text-white font-bold cursor-pointer">
            Greo
          </span>
          </div>
           

        <div className="flex flex-row items-center justify-center  space-x-2 ">
        <div className="flex  flex-row justify-center items-center bg-background-dark dark:bg-background-light p-2 rounded-full ">
            <FiSearch className="text-text-Grayish text-2xl cursor-pointer" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-background-dark dark:bg-background-light 
               text-text-white dark:text-text-black focus:outline-none focus:ring-0 "
              placeholder="Search"
            />
            {searchText.trim() && (
              <FaXmark
                onClick={() => setSearchText("")}
                className="text-text-Grayish text-sm cursor-pointer"
              />
            )}
          </div>
          <TbHeart className="text-text-black dark:text-text-Grayish text-3xl cursor-pointer" />

        </div>

          </div>
        <div className="hidden lg:space-x-10 md:space-x-5  lg:flex ">
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

          {/* <div>
          <span className="cursor-pointer font-golos text-text-Grayish">Search</span>
           </div> */}

          <div>
            <NavLink
              className={({ isActive }) =>
                ` cursor-pointer font-golos p-2 px-4 rounded-full text-text-Grayish  ${
                  isActive && "bg-black dark:bg-white"
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
                  isActive && "bg-black   dark:bg-white"
                }`
              }
              to="/profile"
            >
              Profile
            </NavLink>
          </div>
        </div>

{/* mobile navbar */}

        <div className="flex flex-row lg:hidden items-center justify-between  fixed bottom-0 w-full p-3 sm:px-10 ">

<div>
  <NavLink to='/' >
{
  ({isActive}) => (
    isActive ? <GoHomeFill  className="text-3xl dark:text-text-white"/> : <GoHome className="text-3xl dark:text-text-Grayish"/>
  )
}
  </NavLink>
</div>

<div>
  <NavLink to={'/explore'}>
  {
    ({isActive}) => (
      isActive ? <MdExplore className="text-3xl dark:text-text-white"/> : <MdOutlineExplore className="text-3xl dark:text-text-Grayish"/>
    )
  }
  </NavLink>
</div>


<div>
  <NavLink to={'/roll'}>
  {
    ({isActive}) => (
      isActive ? <PiPlayCircleBold className="text-3xl dark:text-text-white"/> : <PiPlayCircle className="text-3xl dark:text-text-Grayish"/>
    )
  }
  </NavLink>
</div>

<div>
  <PiPlusSquareBold className="text-3xl dark:text-text-Grayish"/>
</div>

<div>
  <NavLink to={'/chat'}>
  {
    ({isActive}) => (
      isActive ? <HiChatBubbleOvalLeft className="text-3xl dark:text-text-white"/> : <HiOutlineChatBubbleOvalLeft className="text-3xl dark:text-text-Grayish"/>
    )
  }
  </NavLink>
</div>

<div>
  <NavLink to={'/profile'}>
  {
    ({isActive}) =>(
      isActive ? <FaUser className="text-3xl  dark:text-text-white"/> : <FaRegUser className="text-3xl dark:text-text-Grayish"/>
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
