
export interface IUserDetails{
    userId:string
    user_name:string
    profileImage:string
}

export interface IComment{
  postId: string
  userId:string
  content:string
  createdAt?:Date
  updateAt?:Date
  userDetails:IUserDetails
}


export interface CommentsDto{
 postId:string
 comments:IComment[]
}

