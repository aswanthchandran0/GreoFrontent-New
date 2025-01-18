import React from "react"
import { User } from "../../../redux/slices/userSlice"
import TopUser from "./TopUser"

interface Props{
    users:User[]
}

const TopUsers:React.FC<Props> = ({users})=>{
    console.log("top 10 users",users)
    return (
        <div  className="flex flex-col p-2 rounded shadow w-[80vh] h-80 shadow-blue-100" >
<span className="text-blue-600 font-golos">Top Users</span>
<div className="flex w-full h-full overflow-y-scroll scrollbar-hide">
 <div className="flex flex-col justify-between w-full p-2">
    {
        users &&
        users.map((user)=>(
                <TopUser user={user} />
        ))
    }
 </div>
</div>
        </div>
    )
}


export default TopUsers