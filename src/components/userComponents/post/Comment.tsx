import { useEffect } from "react";
import { IComment } from "../../../Types/commentTypes";
import { timeformat } from "../../../utils/formating";

interface Props {
  comment: IComment;
}

const Comment: React.FC<Props> = ({ comment }) => {
  useEffect(()=>{
    console.log('comment in use effect ------------------- ',comment)
  },[])
  return (
    <div className="flex flex-row items-start space-x-2">
      {/* Profile image */}
      <div className="w-10 h-10 overflow-hidden rounded-full">
        <img
          className="object-cover w-full h-full"
          src={comment.profileImage ?? "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1729611509~exp=1729615109~hmac=f56084f44329d588f81849bc897a8533f197f38f12e1fd5d08aca16c67adffb4&w=740"}
          alt={comment.username}
        />
      </div>

      {/* Username and time */}
      <div className="flex flex-col">
        <p className="text-text-black dark:text-text-white font-golos">
          {comment.username ?? "Unknown User"}
        </p>
        <p className="text-sm text-text-darkGray font-outfit">
          {timeformat(comment.createdAt)}
        </p>
      </div>

      {/* Comment content */}
      <div className="flex-1">
        <p className="text-text-darkGray font-golos">{comment.content}</p>
      </div>
    </div>
  );
};

export default Comment;
