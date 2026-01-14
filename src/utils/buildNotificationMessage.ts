export const buildNotificationMessage = (n: any) => {
    switch (n.type) {
        case "USER_FOLLOW":
            return `${n.username} started following you`;
        
        case "POST_LIKE":
            return `${n.username} liked your post`;

        case "POST_COMMENT":
            return `${n.username} commented on your post: "${n.contentPreview}"`;

        case "REEL_LIKE":
            return `${n.username} liked your reel`;

        case "REEL_COMMENT":
            return `${n.username} commented on your reel: "${n.contentPreview}"`;

        default:
            return "You have a new notification";
    }
};
