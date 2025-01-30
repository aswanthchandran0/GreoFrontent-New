

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
    // TACTICAL: exploreTypes
    userName?:string
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
    isSaved?:boolean
    // TACTICAL:  opened explore 
    isLiked?:boolean
    user_name?:string
  }

  export type ExploreI = PostInter | RollInter;