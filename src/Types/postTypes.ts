export interface IPost {
    _id:string,
    mediaUrls:string[],
    content:string,
    createdAt:string,
    updatedAt:string,
    likeCount:number,
    commentCount:number
    profileImage: string | undefined;
    name:string
    user_name: string
    isLiked:string
    isSaved:boolean
}

export type ReportReasonType =
  | "dislike"
  | "bullying"
  | "self_harm"
  | "violence"
  | "nudity"
  | "fraud"
  | "false_info"


