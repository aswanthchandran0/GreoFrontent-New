export interface INotification {
    _id: string
    userId:  string
    username: string;
    profileImage: string;
    initiatorId:  string
    mediaUrl?: string;
    entityId:  string
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
  }
  
  