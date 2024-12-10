import User from "./User";

interface ChatListProps {
    data: Chat[]; // Chats data passed from parent
    currentUserId: string | null; // Current user ID
    onConversationClick: (chat: IChat) => void;
  }
  
  const ChatList = ({ data, currentUserId ,onConversationClick}: ChatListProps) => {

    const allUserIds = data
    .map((chat) =>
      chat.members.filter((member) => member !== currentUserId && member !== null)
    )
    .flat();

  // Remove duplicates by converting the array to a Set, then back to an array
  const uniqueUserIds = Array.from(new Set(allUserIds));

  // Find chats for each unique user and ensure only one chat per user is shown
  const uniqueChats = data.filter((chat, index, self) => {
    const [user1, user2] = chat.members;
    const userId = user1 === currentUserId ? user2 : user1;

    // Find the first occurrence of the user in the chats and keep that
    return (
      uniqueUserIds.includes(userId) &&
      index === self.findIndex((otherChat) => {
        const [otherUser1, otherUser2] = otherChat.members;
        const otherUserId = otherUser1 === currentUserId ? otherUser2 : otherUser1;
        return otherUserId === userId;
      })
    );
  });

    
    return(
        <>
            <div className="flex flex-col overflow-y-scroll scrollbar-hide">
            {uniqueChats.map((chat) => (
          <div key={chat.id}>
            <User chat={chat} currentUserId={currentUserId} onClick={() => onConversationClick(chat)} />
          </div>
        ))}
            </div>
        </>
    )
}

export default ChatList