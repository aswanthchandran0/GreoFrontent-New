import { IoClose } from "react-icons/io5";
import { INotification } from "../../../Types/notifications/notificationTypes";
import NotificationBox from "./NotificationBox";
import { useEffect } from "react";
import { getUserNotificationApi} from "../../../services/user/api";


interface Props {
  onClose: () => void;
  notifications:INotification[]
  isLoading:boolean
  setNotificationReaded:()=>void
  setNotification:()=>void
}

const Notification: React.FC<Props> = ({ onClose,notifications,isLoading,setNotificationReaded,setNotification }) => {
 
console.log("notifications",notifications)
 // make the notification isRead = true
 useEffect(()=>{
  const updateNotfication = async()=>{
    const response = await getUserNotificationApi()
    console.log("after updating is readed",response)
    if(response.data == true){
  // setNotificationReaded()
  setNotification(response.data)
    }
  }
  updateNotfication()
 },[])




   // Skeleton for Notification
   const NotificationSkeleton = () => (
    <div className="flex items-center p-3 space-x-4 bg-gray-800 rounded-lg animate-pulse">
      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
      <div className="flex flex-col w-full space-y-2">
        <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
        <div className="w-1/2 h-4 bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  console.log("notifications",notifications)
  
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
            <span className="text-xl text-text-black font-outfit dark:text-text-white">
              Notification
            </span>
            <IoClose
              onClick={onClose}
              className="text-2xl cursor-pointer text-text-Grayish font-outfit"
            />
          </div>

          <div className="flex flex-col w-full h-full py-3 space-y-2 overflow-y-scroll scrollbar-hide">
          {isLoading &&
              Array(5)
                .fill(0)
                .map((_, index) => <NotificationSkeleton key={index} />)}

            {!isLoading &&
              notifications.map((notification) => (
                <NotificationBox
                  key={notification?._id}
                  onClose={onClose}
                  notification={notification}
                />
              ))}
              
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
