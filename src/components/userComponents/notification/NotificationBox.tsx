import React from "react"
import { INotification } from "../../../Types/notifications/notificationTypes"
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images"
import { timeformat } from "../../../utils/formating"
import { useNavigate } from "react-router-dom"

interface Props{
    notification:INotification
    onClose: () => void;
}

const NotificationBox:React.FC<Props> = ({notification,onClose})=>{
       const navigate = useNavigate()

       // handling profile navigation
       const handleProfileNavigation = ()=>{
           navigate(`/profile/${notification.username}`)
           onClose()
       }

       // handling post navigation
      const handlePostNavigation = ()=>{
        navigate(`/p/${notification.entityId}`)
        onClose()
      }
    return(
        <div className="flex flex-row items-center w-full p-1 space-x-1 rounded shadow bg-background-light dark:bg-background-charcoal">
        {/* Profile Image */}
        <div className='flex w-12 h-12 overflow-hidden rounded-full cursor-pointer'>
          <img 
            className="object-cover w-full h-full" 
            src={notification.profileImage || DEFAULT_PROFILE_IMAGE} 
            alt="profile" 
          />
        </div>
      
        {/* User Info and Message */}
        <div className="flex flex-col flex-grow">
          <span onClick={handleProfileNavigation} className="cursor-pointer text-text-black dark:text-text-white">{notification.username || 'user'}</span>
          <span onClick={handlePostNavigation} className="text-sm cursor-pointer text-text-black dark:text-text-white">{notification.message}</span>
          <span className="text-sm cursor-pointer text-text-black dark:text-text-white">{timeformat(notification?.createdAt.toString())}</span>
        </div>
      
        {/* Media Image Aligned to Right */}
        <div className="ml-auto">
          {notification.mediaUrl && (
            <div onClick={handlePostNavigation} className='flex w-12 h-12 overflow-hidden rounded cursor-pointer'>
              <img 
                className="object-cover w-full h-full" 
                src={notification.mediaUrl} // Corrected to mediaUrl
                alt="post" 
              />
            </div>
          )}

          {
            notification.type == 'follow' && (
              <div onClick={handleProfileNavigation} className="px-2 m-2 bg-blue-500 rounded cursor-pointer hover:bg-blue-600 ">
                <span className="text-text-white font-golos">view</span>
              </div>
            )
          }
        </div>
      </div>
    )
}


export default NotificationBox