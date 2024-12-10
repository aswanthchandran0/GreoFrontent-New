export interface IPost {
    _id:string,
    mediaUrls:string[],
    content:string,
    createdAt:string,
    updatedAt:string,
    likeCount:number,
    commentCount:number
    profileImage: string | undefined;
    user_name: string
}