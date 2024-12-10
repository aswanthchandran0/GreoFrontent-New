
export interface IChat {
    id: string
    members: string[]
    timeStamb: Date
  }

export interface Message {
    chatId: string;
    senderId: string;
    text: string;
    updatedAt:string
  }
  