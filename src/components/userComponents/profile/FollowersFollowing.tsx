import React, { useEffect, useMemo, useState } from "react";
import { IoCloseOutline } from "react-icons/io5";
import UserWithFollow from "./UserWithFollow";
import { showComponentType } from "./UserProfile";
import { getFollowersApi, getFollowingApi } from "../../../services/user/api";
import { User } from "../../../redux/slices/userSlice";
import { useParams } from "react-router-dom";
import Fuse from 'fuse.js'

interface FollowersProps {
    showComponent:showComponentType
    onClose:()=>void
}
const Followers:React.FC<FollowersProps> =  ({showComponent,onClose}) =>{
    const {username} = useParams()
    const [searchValue,setSearchValue] = useState<string>('')
    const [isSearchValue,setIsSearchValue] = useState<boolean>(false)
    const [debouncingValue,setDebouncingValue]= useState<string>('')
    const [users,setUsers] = useState<User[]>([])

    // checking search field is empty or not
    useEffect(()=>{
        if(searchValue.trim() ===''){
          setIsSearchValue(false)
        }else{
        setIsSearchValue(true)
        }
    },[searchValue])

    // clearing serch field value
    const handleClearSearchFieldValue = ()=>{
        setSearchValue('')
    }

    // fetchUsers 
    useEffect(()=>{
       const fetchUsers = async()=>{
        if(showComponent === 'Followers' && username?.trim()){
            if(username?.trim() !== '' && username !== undefined){
                const response = await getFollowersApi(username)
                console.log("response data",response)
                setUsers(response.data)
            }
        }else if(showComponent ==='Following'){
            if(username?.trim() !== '' && username !== undefined){
            const response = await getFollowingApi(username )
            setUsers(response.data)
            }
        }
       }
       fetchUsers()
    },[showComponent])

    // handle debounsing value 
     useEffect(()=>{
      const handleDebounsing = setTimeout(()=>{
          setDebouncingValue(searchValue.trim())
      },300)
      return ()=> clearTimeout(handleDebounsing)
     },[searchValue])
    // fuse setup
    
     const fuse = useMemo(()=>{
        return new Fuse(users || [],{
            keys:['name','user_name'],
            threshold:0.3
        })
     },[users])
     
     // performe the search
     const filteredUsers = useMemo(()=>{
        if(!users) return []
        if(!debouncingValue ) return users
        const result = fuse.search(debouncingValue)
        return result.map(result => result.item)
     },[debouncingValue,fuse])

     console.log("filterd users",filteredUsers)
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full pt-12 bg-transparent pb-14">
        <div className="flex flex-col items-center justify-center w-full h-screen bg-opacity-50 bg-background-dark">
          <div className="flex flex-col w-full items-center h-full max-w-md max-h-[70vh] rounded-md bg-background-light dark:bg-background-customDarkGray ">
            <div className="relative flex flex-row items-center justify-center w-full p-3 border-b border-text-charcoal">
                <p className="absolute font-semibold cursor-pointer text-text-black font-outfit dark:text-text-white">{showComponent}</p>
                <IoCloseOutline onClick={onClose} className="flex ml-auto text-2xl font-bold cursor-pointer dark:text-text-white"/>
            </div>

            <div className="items-center justify-center w-full p-2 ">
                <div className="flex flex-row p-2 overflow-hidden rounded-md h-9 bg-background-lightGray dark:bg-background-charcoal">
                <input value={searchValue} onChange={(e)=>setSearchValue(e.target.value)} type="text" className="flex w-full h-full bg-transparent focus:outline-none text-text-black font-golos dark:text-text-white" placeholder="search" />
               {
                isSearchValue &&  <IoCloseOutline onClick={handleClearSearchFieldValue} className="cursor-pointer text-md text-text-black dark:text-text-white"/>
               }
                </div>
                   </div>

                     
         <div className="w-full h-full p-2 overflow-y-scroll scrollbar-hide ">
        {
          filteredUsers.length>0 ?  filteredUsers.map((user)=>(

                <UserWithFollow key={user.id} user={user} onClose={onClose}/>
            ))
            : 
            <div className="flex items-center justify-center p-2 text-text-Grayish font-golos ">
                <p>No connections yet! Follow people or gain followers to see them here.</p>
            </div>
        }
         </div>

          </div>
        </div>
        </div>
    )
}


export default Followers