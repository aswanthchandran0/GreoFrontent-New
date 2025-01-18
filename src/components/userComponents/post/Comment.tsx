import { IComment } from "../../../Types/commentTypes"
import { timeformat } from "../../../utils/formating"

interface Props{
  comment:IComment
}

const Comment:React.FC<Props> = ({comment})=>{
  
    return(
        <div className="flex flex-row items-center space-x-2 ">
        <div className="w-10 h-10 mb-auto overflow-hidden rounded-full">
          <img className="object-cover w-full h-full" src={comment?.userDetails?.profileImage?comment?.userDetails?.profileImage: "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729611509~exp=1729615109~hmac=f56084f44329d588f81849bc897a8533f197f38f12e1fd5d08aca16c67adffb4&w=740"} alt="" />
        </div>
        <div className="flex flex-col mb-auto">
        <p  className="text-text-black dark:text-text-white font-golos">{comment.userDetails.user_name}</p>
        <p className="text-sm text-text-darkGray font-outfit">{timeformat(comment.createdAt?.toString() || '')}</p>
        </div>
        <div className="mb-auto md:w-80 ">
        <p className=" text-text-darkGray font-golos">{comment.content}</p>
        </div>
     </div>
    )
}


export default Comment