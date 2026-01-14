import React from "react";
import { INotification } from "../../../Types/notifications/notificationTypes";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { timeformat } from "../../../utils/formating";
import { useNavigate } from "react-router-dom";
import { buildNotificationMessage } from "../../../utils/buildNotificationMessage";

interface Props {
  notification: INotification;
  onClose: () => void;
}

const NotificationBox: React.FC<Props> = ({ notification, onClose }) => {
  const navigate = useNavigate();

  const handleProfileNavigation = () => {
    navigate(`/profile/${notification.username}`);
    onClose();
  };

  const handlePostNavigation = () => {
    navigate(`/p/${notification.entityId}`);
    onClose();
  };

  // ========== CHECK THE TYPE ==========
  const isFollow = notification.type === "USER_FOLLOW";
  const hasMedia =
    !isFollow && notification.mediaUrl; // show media only if NOT follow

  return (
    <div className="flex flex-row items-center w-full p-2 rounded shadow bg-background-light dark:bg-background-charcoal">
      
      {/* CIRCLE PROFILE IMAGE ALWAYS */}
      <div
        onClick={handleProfileNavigation}
        className="flex w-12 h-12 overflow-hidden rounded-full cursor-pointer"
      >
        <img
          className="object-cover w-full h-full"
          src={notification.imageUrl || DEFAULT_PROFILE_IMAGE}
          alt="profile"
        />
      </div>

      {/* TEXT CONTENT */}
      <div className="flex flex-col flex-grow ml-2">
        <span
          onClick={handleProfileNavigation}
          className="cursor-pointer font-semibold text-text-black dark:text-text-white"
        >
          {notification.username || "user"}
        </span>

        <span
          onClick={!isFollow ? handlePostNavigation : handleProfileNavigation}
          className="text-sm cursor-pointer text-text-black dark:text-text-white"
        >
          {buildNotificationMessage(notification)}
        </span>

        <span className="text-xs text-gray-500">
          {timeformat(notification?.createdAt.toString())}
        </span>
      </div>

      {/* RIGHT SIDE MEDIA ONLY IF NOT FOLLOW */}
      <div className="ml-auto">
        {hasMedia && (
          <div
            onClick={handlePostNavigation}
            className="flex w-12 h-12 overflow-hidden rounded cursor-pointer"
          >
            <img
              className="object-cover w-full h-full"
              src={notification.mediaUrl}
              alt="post"
            />
          </div>
        )}

        {/* FOLLOW BUTTON (Only for USER_FOLLOW) */}
        {isFollow && (
          <div
            onClick={handleProfileNavigation}
            className="px-2 py-1 bg-blue-500 rounded cursor-pointer hover:bg-blue-600"
          >
            <span className="text-white text-sm font-medium">View</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBox;
