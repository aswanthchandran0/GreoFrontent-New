

export interface PostInter {
    id?: string,
    userId:string,
    mediaUrls:string[],
    content: string,
    createdAt: Date,
    updatedAt: Date,
    type?:string,
    likeCount?:number,
    commentCount?:number,
    profileImage:string,
    user_name:string,
    name:string
    isBlocked?:boolean,
    isLiked?:boolean
    // tactical
    thumbnail?:string,
    _id?:string,
}



export interface RollInter{
    id?: string,
    _id?:string,
    userId:string,
    thumbnail:string,
    mediaUrl: string,
    content?: string,
    createdAt:Date
    name?: string;
    userName?:string
    profileImage?: string;
    likeCount?:number,
    commentCount?:number,
    isLikedByViewingUser?:boolean
    type?:string
    isLiked?:boolean
    isSaved?:boolean
  }

  export type ExploreI = PostInter | RollInter;