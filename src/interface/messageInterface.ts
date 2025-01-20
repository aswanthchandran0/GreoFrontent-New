export interface IMessage {
    chatId: string; // Replaces mongoose.Types.ObjectId with string
    senderId: string; // Replaces mongoose.Types.ObjectId with string
    text: string;
    createdAt:Date
  }