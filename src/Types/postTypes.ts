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
    username: string
    userId:string
    isLiked:boolean
    isSaved:boolean
    isBlocked:boolean
    // TACTICAL: postId, postDetails is used in here as the part of tactical for using that in blockmodal
    postId?:string
    postDetails?: {
      isBlocked: boolean;
      // Add other details if needed
    };
    id?:string
}

export type ReportReasonType =
  | "dislike"
  | "bullying"
  | "self_harm"
  | "violence"
  | "nudity"
  | "fraud"
  | "false_info"


