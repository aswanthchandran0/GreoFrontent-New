import { useEffect, useState } from "react";
import { getUserByIdApi } from "../../../services/user/api";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { User } from "../../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { IChat } from "../../../Types/userChats/chatType";
import { timeformat } from "../../../utils/formating";
import { IMessage } from "../../../interface/messageInterface";

interface UserProps {
  chat:IChat
  currentUserId: string | null;
  onClick: (chat: IChat) => void;
  lastMessage: IMessage | undefined;
}

const UserComponent = ({ chat, currentUserId, onClick ,lastMessage }: UserProps) => {
  const [userData, setUserData] = useState<User | null>(null);
  const navigate = useNavigate()
    // Get the opponent user's data
    useEffect(() => {
      const opponentId = chat.members.find((id) => id !== currentUserId);
      if (opponentId) {
        const fetchUserData = async () => {
          const { data } = await getUserByIdApi(opponentId);
          setUserData(data);
        };
        fetchUserData();
      }
    }, [chat, currentUserId]);


  

    // Handle user click to navigate to chat with that user
    const handleUserClick = () => {
      const opponentId = chat.members.find((id) => id !== currentUserId);
      if (opponentId) {
        navigate(`/chat/${opponentId}`); // Navigate with userId as a parameter
        onClick(chat)
      }
    };

   

    return(
        <div className="cursor-pointer hover:bg-background-lightGray dark:hover:bg-background-EerieBlack"  onClick={handleUserClick}>
 <div className="flex flex-row items-center w-full gap-2 p-2">
              <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-full">
           <img className="object-cover w-full h-full" src={userData?.profileImage || DEFAULT_PROFILE_IMAGE}
          alt={userData?.name || "User Profile"} />
              </div>

              <div className="flex justify-between w-full">
                <div className="flex flex-col w-full">
                <span className="text-md font-golos ">{userData?.name || userData?.user_name}</span>
                <div className="flex justify-between w-full ">

                <p className="text-sm text-gray-500">
        {lastMessage ? lastMessage.text : "No messages yet"}
      </p>
      <p className="text-sm text-gray-500">{lastMessage ? timeformat(lastMessage.createdAt.toString()) : "No messages yet"}</p>
                </div>
                </div>
                <span className="font-bold text-text-green font-golos">
                {/* {userData ? (userData.status === "online" ? "online" : lastActive) : "offline"} */}
                </span>
              </div>
            </div>
      
        </div>
    )
}

export default UserComponent