import { FaEllipsis } from "react-icons/fa6";
import { useDispatch} from "react-redux";
import { AppDispatch } from "../../../redux/store";
import { adminLogOut } from "../../../redux/slices/adminSlice"
import { FaSignOutAlt } from "react-icons/fa";
import { useState } from "react";
import { IoMenu } from "react-icons/io5";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
const menuConfig = [
  { name: 'Dashboard', to:"" },
  { name: 'Community', to:"" },
  { name: 'Post', to:"" },
  { name: 'Transaction', to:"" },
  { name: 'Users', to:"/admin/users" },
  { name: 'Notification', to:"" }
]

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [profilePopUp, setProfilePopUp] = useState(false)
  const [isSidebarOpen,setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  


  const handleLogout = () => {
    dispatch(adminLogOut())
    navigate('/admin/auth')
  }

 

  const handleProfilePopUp = () => {
    setProfilePopUp(!profilePopUp)
  }

const toggleSidebar = ()=>{
  setSidebarOpen(!isSidebarOpen)
}

  return (
    <>
      <div className="  w-full  sm:w-20 md:w-24 lg:w-56 xl:w-50 flex md:flex-col md:h-screen border-r border-r-1 border-secondary">
        <div className="flex flex-row w-full  items-center p-5 justify-between">
          <span className="text-3xl font-Lato font-semibold text-background">GREO</span>

         
          <IoMenu onClick={toggleSidebar} className="sm:hidden cursor-pointer text-2xl text-text_white" />
        
        </div>
        <div className="hidden md:flex flex-col   p-2  mt-16 space-y-3 ">
          {
            menuConfig.map((item, index) => {
              return (
                <div key={index} className="flex justify-center items-center w-full h-10 bg-background rounded text-text-white bg-indigo-500 shadow-lg hover:bg-indigo-600 hover:text-text-white hover:cursor-pointer">
                  <Link to={item.to}>
                  <span className="text-md font-bold font-lato">{item.name}</span>
                  </Link>
                </div>
              )
            })
          }
        </div>




        <div className="p-2 absolute bottom-0">

          {
            profilePopUp && (
              <div onClick={handleLogout} className='hidden cursor-pointer sm:flex justify-between px-3 items-center mx-auto my-4 mt-auto mb-2 bg-background  lg:w-52 lg:h-14 md:w-12 rounded-lg shadow-lg lg:items-center'>
                <div className='flex items-center'>
                  <FaSignOutAlt className="text-indigo-500  " />
                  <span className='ml-4 text-indigo-500  font-lato font-medium'>Logout</span>
                </div>
              </div>
            ) 
          }

          <div className='hidden sm:flex justify-between px-3 items-center mx-auto my-4 mt-2 mb-10 bg-indigo-500 lg:w-52 lg:h-14 md:w-12 rounded-lg shadow-lg lg:items-center'>
            <div className='flex  items-center'>
              <img src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729611509~exp=1729615109~hmac=f56084f44329d588f81849bc897a8533f197f38f12e1fd5d08aca16c67adffb4&w=740" alt="profile icon" className='w-12 h-12 rounded-full' />
              <span className='ml-4 text-text-white font-lato font-medium'>Admin</span>
            </div>
            <FaEllipsis onClick={handleProfilePopUp} className='text-balance text-text-white cursor-pointer ml-4' />
          </div>
        </div>
      </div>

      {
        isSidebarOpen && (
        <div >
         <div className="fixed mt-20 bg-premiumBlack opacity-60  inset-0 z-40" onClick={toggleSidebar}></div>
         <div className={`fixed right-0  top-[5.3rem] m-2  h-xl rounded-md w-[22rem] bg-background p-4 z-50 transform transition-transform duration-1000 ease-in-out ${isSidebarOpen?'translate-x-0':'translate-x-full'}`}>
       
         <div className="flex flex-col  bg-background-light shadow-md  rounded  space-y-1">
         {
            menuConfig.map((item,index)=>(
              <div  key={index} className="font-bold  text-indigo-500 rounded p-2  font-lato text-primary">
           {item.name}
              </div>
            ))
          }

        <div onClick={handleLogout} className="font-bold  text-indigo-500  rounded p-2  font-lato text-primary">
          logout
         </div>
         </div>

        
         
         </div>
        </div>
        )
      }
    </>
  )

}



export default Sidebar