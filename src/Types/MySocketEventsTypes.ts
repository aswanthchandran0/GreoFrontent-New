// MySocketEvents.ts
export interface MySocketEvents {
    'new-user-add': (userId: string) => void;
    'get-users': (users: { userId: string; socketId: string }[]) => void;
    'send-message': (data: { receiverId: string; message: string }) => void;
    // 'receive-message': (data: { senderId: string; message: string }) => void;
    'video-call-signal': (signal: { receiverId: string; signalData: any }) => void;
    'start-video-call': (data: { receiverId: string }) => void;
    'end-video-call': (data: { receiverId: string }) => void;
    'disconnect': () => void;
  }
  