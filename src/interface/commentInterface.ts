export interface CommentResponse {
  id: string;
  targetId: string;
  targetType: string;
  userId: string;
  content: string;
  createdAt: Date;
  parentCommentId?: string;
}
