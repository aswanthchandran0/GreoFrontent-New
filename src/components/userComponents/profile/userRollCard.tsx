import { FaRegHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa";

import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { IRoll } from "./UserPosts";
import { useState } from "react";
import OpenedRoll from "../Roll/OpenedRoll";


interface props{
    roll:IRoll
}



const UserRollCard:React.FC<props> = ({roll}) =>{
      const [isRollOpened,setIsRollOpened] = useState<boolean>(false)

  const handleRollOpen = async ()=>{
        setIsRollOpened(!isRollOpened)
      }
    return(
        <div onClick={handleRollOpen} className="relative p-1 cursor-pointer w-full h-[300px]">
            <div>

        <img  className="object-cover w-full h-full" src={roll?.thumbnail || DEFAULT_PROFILE_IMAGE} alt="" />
            </div>
        <div className="absolute inset-0 flex flex-row items-center justify-center w-full h-full space-x-2 transition-opacity duration-300 opacity-0 hover:opacity-50 hover:bg-black">
            <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
                <FaRegHeart className="text-2xl "/>
               <span className="text-text-white"></span>
            </div>
            <div className="flex flex-row items-center justify-center space-x-2 text-xl text-white">
                <FaRegComment className="text-2xl "/>
               <span className="text-text-white"></span>
            </div>
        </div>

            
            {
                isRollOpened && <OpenedRoll roll={roll} onClose={handleRollOpen}/>
            }

        </div>
    )
}

export default UserRollCard