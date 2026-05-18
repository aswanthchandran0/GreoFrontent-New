// src/components/userComponents/Chat/Chat.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../../context/SocketContext";
import { useCall } from '../../../context/CallContext';
import { 
  BsEmojiSmile, 
  BsPaperclip, 
  BsCameraVideo,
  BsMic,
  BsMicMute,
  BsSend,
  BsThreeDotsVertical,
  BsCheck2All,
  BsCheck
} from "react-icons/bs";
import { 
  FaArrowLeft,
  FaPhone,
  FaImage,
  FaVideo,
  FaFileAlt,
  FaPlay,
  FaStop,
  FaTimes,
  FaSpinner
} from "react-icons/fa";
import { RiGalleryUploadLine } from "react-icons/ri";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import useClickOutside from "../../../customHook/useClickOutside";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { useUserOnlineStatus } from "../../../hooks/useUserOnlineStatus";
import MessageBubble from "./MessageBubble";
import FileUploadModal from "./FileUploadModal";
import { IMessage, FileAttachment, ChatAttachment } from "../../../Types/messageTypes";
import { format } from "date-fns";
import chatUploadService from "../../../services/ChatUploadService";
import toast from "react-hot-toast";

interface IUser {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  online: boolean;
}

interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video' | 'document' | 'audio';
  name: string;
  size: number;
  duration?: number;
  width?: number;
  height?: number;
}

const DEFAULT_PROFILE_IMAGE = "/default-avatar.png";

const Chat: React.FC = () => {
  const { socket } = useSocket();
  const  { initiateCall } = useCall();
  const opponentUserId = useParams().userId!;
  const navigate = useNavigate();
  const me = useSelector((state: RootState) => state.UserReducer.user);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [opponentUser, setOpponentUser] = useState<IUser | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [uploadFileType, setUploadFileType] = useState<'image' | 'video' | 'document'>('image');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMarkedInitialRead, setHasMarkedInitialRead] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [isChatActive, setIsChatActive] = useState<boolean>(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const readTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastReadMessagesRef = useRef<string[]>([]);
  const pendingReadNotificationsRef = useRef<Map<string, number>>(new Map());
  const messageElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityCheckRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);


// In your Chat.tsx component, update the call handlers:

// Voice Call Handler
const handleVoiceCall = async () => {
  if (!opponentUser?.id) {
    console.error('No opponent user ID');
    toast.error('Cannot make call: User not found');
    return;
  }
  
  try {
    console.log('📞 Starting voice call to:', {
      id: opponentUser.id,
      name: opponentUser.name,
      image: opponentUser.profileImage
    });
    
    await initiateCall(
      opponentUser.id, 
      opponentUser.profileImage || '', 
      opponentUser.name, 
      'voice'
    );
    
    toast.success(`📞 Calling ${opponentUser.name}...`);
  } catch (error) {
    console.error('Failed to start call:', error);
    toast.error('Failed to start call. Please check your microphone permissions.');
  }
};

// Video Call Handler
const handleVideoCall = async () => {
  if (!opponentUser?.id) {
    console.error('No opponent user ID');
    toast.error('Cannot make video call: User not found');
    return;
  }
  
  try {
    console.log('📹 Starting video call to:', {
      id: opponentUser.id,
      name: opponentUser.name,
      image: opponentUser.profileImage
    });
    
    await initiateCall(
      opponentUser.id, 
      opponentUser.profileImage || '', 
      opponentUser.name, 
      'video'
    );
    
    toast.success(`📹 Video calling ${opponentUser.name}...`);
  } catch (error) {
    console.error('Failed to start video call:', error);
    toast.error('Failed to start video call. Please check your camera and microphone permissions.');
  }
};
  
  const isOpponentOnline = useUserOnlineStatus({
    userId: opponentUserId,
    initialOnlineStatus: opponentUser?.online || false
  });

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Reset scroll position when chat changes
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = 0;
    }
    setHasMarkedInitialRead(false);
    setIsChatActive(true);
  }, [opponentUserId]);

  // Handle clicks outside
  useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));
  useClickOutside(attachmentMenuRef, () => setShowAttachmentMenu(false));

  // Track user activity in chat
  useEffect(() => {
    const updateActivity = () => {
      setLastActivityTime(Date.now());
      setIsChatActive(true);
      
      // Clear existing activity timer
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
      
      // Set timeout to mark chat as inactive after 2 seconds of no activity
      activityTimerRef.current = setTimeout(() => {
        setIsChatActive(false);
      }, 2000);
    };

    // Listen for user interactions
    const handleUserActivity = () => {
      updateActivity();
      
      // Mark messages as read when user is active in chat
      if (isChatActive && unreadCount > 0 && chatId) {
        markAllMessagesAsRead();
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
    };
  }, [isChatActive, unreadCount, chatId]);

  // Initialize chat with improved read status handling
  useEffect(() => {
    if (!socket || !me?.id) return;

    console.log("🔄 Initializing chat with opponent:", opponentUserId);
    
    // Clear previous state
    setMessages([]);
    setChatId(null);
    chatIdRef.current = null;
    setHasMarkedInitialRead(false);
    setIsChatActive(true);
    
    socket.emit("chat:init", { opponentId: opponentUserId });

    socket.on("chat:init:response", (data: { 
      chatResponse: any; 
      messages: IMessage[]; 
      opponentUser: IUser 
    }) => {
      console.log("✅ Chat init response received:", {
        opponentId: opponentUserId,
        chatId: data.chatResponse?.id,
        messageCount: data.messages?.length
      });
      
      setOpponentUser(data.opponentUser);
      const newChatId = data.chatResponse?.id || data.chatResponse?._id || null;
      setChatId(newChatId);
      chatIdRef.current = newChatId;
      setMessages(data.messages || []);
      
      // Calculate unread messages
      const unread = data.messages.filter(msg => 
        msg.senderId !== me?.id && !msg.isRead
      ).length;
      setUnreadCount(unread);
      
      // 🔥 IMPROVED: Mark all messages as read when opening chat immediately
      if (newChatId && data.messages.length > 0 && unread > 0) {
        console.log(`📚 Immediately marking ${unread} messages as read`);
        markAllMessagesAsRead();
        setHasMarkedInitialRead(true);
      }
    });

    // Typing indicator
    socket.on("chat:typing", ({ userId, isTyping }) => {
      if (userId === opponentUserId) {
        setIsTyping(isTyping);
      }
    });

    return () => {
      socket.off("chat:init:response");
      socket.off("chat:typing");
    };
  }, [socket, opponentUserId, me?.id]);

  // Listen for messages with improved read status handling
  useEffect(() => {
    if (!socket || !me?.id || !opponentUserId) return;

    const handleReceiveMessage = (message: IMessage) => {
      console.log("📨 Received message:", {
        senderId: message.senderId,
        receiverId: message.receiverId || opponentUserId,
        chatId: message.chatId,
        content: message.content?.substring(0, 50),
        isRead: message.isRead,
        messageType: message.messageType,
        attachmentsCount: message.attachments?.length || 0
      });

      // ✅ FIX: Only process message if it's for this specific chat
      const shouldAddMessage = (
        // Case 1: Message is from opponent to me
        (message.senderId === opponentUserId && message.receiverId === me?.id) ||
        // Case 2: Message is from me to opponent (for consistency)
        (message.senderId === me?.id && message.receiverId === opponentUserId) ||
        // Case 3: Message has chatId and it matches current chat
        (message.chatId && chatIdRef.current && message.chatId === chatIdRef.current)
      );

      if (!shouldAddMessage) {
        console.log("🚫 Ignoring message - not for current chat");
        return;
      }

      // Update chatId if not set
      if (!chatIdRef.current && message.chatId) {
        console.log("🆔 Setting chatId from received message:", message.chatId);
        chatIdRef.current = message.chatId;
        setChatId(message.chatId);
      }
      
      // Add message to state
      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(msg => msg.id === message.id || msg.tempId === message.id);
        if (exists) return prev;
        
        return [...prev, message];
      });
      
      // Update unread count
      if (message.senderId !== me?.id) {
        setUnreadCount(prev => prev + 1);
        
        // 🔥 IMPROVED: Auto-mark new incoming messages as read if chat is active
        if (isChatActive && document.visibilityState === 'visible') {
          console.log("💬 Chat is active, marking new message as read");
          markSingleMessageAsRead(message.id);
        }
      }
    };

    const handleSendSuccess = (data: { message: IMessage, tempId?: string }) => {
      console.log("✅ Message sent successfully:", {
        tempId: data.tempId,
        actualId: data.message.id,
        receiverId: data.message.receiverId,
        isRead: data.message.isRead,
        messageType: data.message.messageType
      });
      
      // ✅ FIX: Only update if message belongs to current chat
      const isForCurrentChat = (
        data.message.receiverId === opponentUserId || 
        data.message.senderId === opponentUserId ||
        (chatIdRef.current && data.message.chatId === chatIdRef.current)
      );
      
      if (!isForCurrentChat) {
        console.log("🚫 Ignoring send success - not for current chat");
        return;
      }
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === data.tempId) {
          return { 
            ...data.message, 
            id: data.message.id,
            isRead: data.message.isRead || false 
          };
        }
        return msg;
      }));
    };

    // 🔥 ENHANCED: Listen for message read notifications
    const handleMessageRead = (data: { 
      messageId: string; 
      chatId: string; 
      readAt: string; 
      readerId: string 
    }) => {
      console.log("📖 Single message read update:", data);
      
      // Only update if it's our message being read by opponent AND it's the current chat
      if (data.readerId === opponentUserId && data.chatId === chatIdRef.current) {
        console.log(`✅ Updating message ${data.messageId} as read`);
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        ));
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };

    // 🔥 ENHANCED: Listen for bulk messages read notifications
    const handleMessagesRead = (data: { 
      chatId: string; 
      readerId: string;
      count: number;
      messageIds?: string[];
      readAt: string;
    }) => {
      console.log(`📚 ${data.count} messages read in chat ${data.chatId} by ${data.readerId}`);
      
      if (data.readerId === opponentUserId && data.chatId === chatIdRef.current) {
        if (data.messageIds && data.messageIds.length > 0) {
          // Update specific messages
          setMessages(prev => prev.map(msg => 
            data.messageIds!.includes(msg.id) 
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          ));
        } else {
          // Update all messages from current user in this chat
          setMessages(prev => prev.map(msg => 
            msg.senderId === me?.id && msg.chatId === data.chatId
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          ));
        }
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - data.count));
      }
    };

    // 🔥 NEW: Handle message delivered notifications
    const handleMessageDelivered = (data: {
      messageId: string;
      chatId: string;
      deliveredAt: string;
      receiverId: string;
    }) => {
      console.log("📫 Message delivered:", data);
      
      if (data.receiverId === opponentUserId && data.chatId === chatIdRef.current) {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, isDelivered: true, deliveredAt: data.deliveredAt }
            : msg
        ));
      }
    };

    socket.on("chat:receive", handleReceiveMessage);
    socket.on("chat:send:success", handleSendSuccess);
    socket.on("chat:message:read", handleMessageRead);
    socket.on("chat:messages:read", handleMessagesRead);
    socket.on("chat:message:delivered", handleMessageDelivered);
    
    // Handle errors
    socket.on("chat:send:error", (error: { message: string, tempId?: string }) => {
      console.error("❌ Message send error:", error);
      // Remove optimistic message if it failed
      if (error.tempId) {
        setMessages(prev => prev.filter(msg => msg.id !== error.tempId));
      }
      toast.error(error.message || "Failed to send message");
    });

    return () => {
      socket.off("chat:receive", handleReceiveMessage);
      socket.off("chat:send:success", handleSendSuccess);
      socket.off("chat:message:read", handleMessageRead);
      socket.off("chat:messages:read", handleMessagesRead);
      socket.off("chat:message:delivered", handleMessageDelivered);
      socket.off("chat:send:error");
    };
  }, [socket, opponentUserId, me?.id, isChatActive]);

  // 🔥 IMPROVED: Handle page visibility change for read status
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When user comes back to the tab, mark chat as active
        setIsChatActive(true);
        
        // Mark all messages as read if there are unread ones
        if (chatId && unreadCount > 0) {
          console.log("👀 User returned to chat, marking messages as read");
          markAllMessagesAsRead();
        }
      } else {
        setIsChatActive(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [chatId, unreadCount]);

  // 🔥 IMPROVED: Mark all messages as read function
  const markAllMessagesAsRead = useCallback(() => {
    if (!socket || !me?.id || !chatId || !opponentUserId || messages.length === 0) return;
    
    // Get unread messages from opponent
    const unreadMessages = messages.filter(msg => 
      msg.senderId === opponentUserId && !msg.isRead
    );
    
    if (unreadMessages.length === 0) return;
    
    console.log(`📚 Marking ${unreadMessages.length} messages as read`);
    
    const unreadMessageIds = unreadMessages.map(msg => msg.id);
    
    // Optimistically update UI first
    setMessages(prev => prev.map(msg => 
      unreadMessages.some(m => m.id === msg.id) 
        ? { ...msg, isRead: true, readAt: new Date().toISOString() }
        : msg
    ));
    
    setUnreadCount(0);
    
    // 1. Mark as read in database
    socket.emit("chat:mark-read", { 
      chatId,
      messageIds: unreadMessageIds
    });
    
    // 2. Send real-time notification to opponent
    socket.emit("chat:notify-messages-read", {
      chatId,
      opponentId: opponentUserId,
      messageIds: unreadMessageIds,
      count: unreadMessages.length
    });
    
    console.log(`✅ Notified opponent about ${unreadMessages.length} read messages`);
    
  }, [socket, chatId, opponentUserId, messages, me?.id]);

  // 🔥 IMPROVED: Schedule message read (for auto-marking when visible)
  const scheduleMessageRead = useCallback((messageId: string) => {
    // Clear any existing timeout for this message
    const existingTimer = pendingReadNotificationsRef.current.get(messageId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set new timeout (300ms delay to avoid too many requests)
    const timer = setTimeout(() => {
      markSingleMessageAsRead(messageId);
      pendingReadNotificationsRef.current.delete(messageId);
    }, 300);
    
    pendingReadNotificationsRef.current.set(messageId, timer as unknown as number);
  }, []);

  // 🔥 IMPROVED: Mark single message as read
  const markSingleMessageAsRead = useCallback((messageId: string) => {
    if (!socket || !chatId || !opponentUserId) return;
    
    // Find the message
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.isRead || message.senderId !== opponentUserId) return;
    
    console.log(`📖 Auto-marking message ${messageId} as read`);
    
    // Optimistic update
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
    ));
    
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Send notification to opponent
    socket.emit("chat:notify-message-read", {
      chatId,
      messageId,
      opponentId: opponentUserId
    });
  }, [socket, chatId, messages, opponentUserId]);

  // 🔥 IMPROVED: Message visibility tracking with Intersection Observer
  useEffect(() => {
    if (!socket || !me?.id || !opponentUserId || !chatId || messages.length === 0) return;

    // Setup Intersection Observer for message visibility
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageElement = entry.target;
            const messageId = messageElement.getAttribute('data-message-id');
            const senderId = messageElement.getAttribute('data-sender-id');
            
            // Mark as read if it's a message from opponent
            if (messageId && senderId && senderId === opponentUserId) {
              console.log(`👁️ Message ${messageId} is visible, marking as read`);
              scheduleMessageRead(messageId);
            }
          }
        });
      },
      {
        threshold: 0.3, // 30% visible is enough to consider "seen"
        root: messageContainerRef.current,
        rootMargin: '0px 0px -100px 0px' // Slightly above viewport
      }
    );

    // Observe all existing message elements
    messageElementsRef.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    // 🔥 NEW: Periodic check for unread messages while chat is active
    visibilityCheckRef.current = setInterval(() => {
      if (isChatActive && unreadCount > 0) {
        console.log("🔄 Periodic check: Chat is active with unread messages");
        markAllMessagesAsRead();
      }
    }, 3000); // Check every 3 seconds

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      if (visibilityCheckRef.current) {
        clearInterval(visibilityCheckRef.current);
      }
      
      // Clear all pending read notifications
      pendingReadNotificationsRef.current.forEach(timer => {
        clearTimeout(timer);
      });
      pendingReadNotificationsRef.current.clear();
    };
  }, [socket, chatId, opponentUserId, me?.id, messages, scheduleMessageRead, isChatActive, unreadCount, markAllMessagesAsRead]);

  // Handle typing
  const handleTyping = useCallback(() => {
    if (!socket || !opponentUserId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start
    if (!typing) {
      socket.emit("chat:typing", { 
        receiverId: opponentUserId, 
        isTyping: true 
      });
      setTyping(true);
    }

    // Set timeout to send typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:typing", { 
        receiverId: opponentUserId, 
        isTyping: false 
      });
      setTyping(false);
    }, 1000);
  }, [socket, opponentUserId, typing]);

// Handle file upload - UPDATED TO USE CLOUDINARY
const handleFilesSelect = async (attachments: ChatAttachment[]) => {
  if (!socket || !me?.id || attachments.length === 0 || !opponentUserId || !chatId) {
    console.error("Missing required data for file upload");
    return;
  }

  try {
    setIsUploading(true);
    const tempId = "temp-" + Date.now();

    // Prepare message text based on file type
    const fileType = attachments[0].type;
    const fileCount = attachments.length;
    
    let text = '';
    if (fileCount > 1) {
      text = `Sent ${fileCount} ${fileType}s`;
    } else {
      text = `Sent a ${fileType}`;
    }

    // 🔥 FIXED: Send the attachments in the correct format that backend expects
    // The backend expects attachments to be an array of objects with Cloudinary properties
    const formattedAttachments = attachments.map(att => ({
      url: att.url,
      type: att.type,
      name: att.name,
      size: att.size,
      duration: att.duration,
      thumbnail: att.thumbnail,
      width: att.width,
      height: att.height,
      publicId: att.publicId,
      format: att.format,
      // Include mimeType in the attachment object itself
      mimeType: att.mimeType
    }));

    // 🔥 FIXED: Create fileInfo array separately
    const fileInfo = attachments.map(att => ({
      name: att.name,
      size: att.size,
      mimeType: att.mimeType,
      duration: att.duration,
      width: att.width,
      height: att.height
    }));

    const payload = {
      chatId: chatIdRef.current,
      text: text,
      receiverId: opponentUserId,
      messageType: fileType as 'image' | 'video' | 'document',
      attachments: formattedAttachments, // 🔥 This should be array of objects with Cloudinary data
      fileInfo: fileInfo,
      tempId: tempId,
    };

    console.log("📤 Sending Cloudinary file message:", {
      receiverId: opponentUserId,
      tempId,
      fileCount: attachments.length,
      messageType: fileType,
      attachments: formattedAttachments.map(a => ({ 
        type: a.type, 
        url: a.url.substring(0, 50) + '...',
        hasMimeType: !!a.mimeType 
      }))
    });

    // Convert ChatAttachment to FileAttachment for optimistic update
    const fileAttachments: FileAttachment[] = attachments.map(att => ({
      url: att.url,
      type: att.type,
      name: att.name,
      size: att.size,
      duration: att.duration,
      thumbnail: att.thumbnail,
      width: att.width,
      height: att.height,
      mimeType: att.mimeType,
      publicId: att.publicId,
      format: att.format
    }));

    // Optimistic update
    const tempMessage: IMessage = {
      id: tempId,
      chatId: chatIdRef.current || "",
      senderId: me.id,
      receiverId: opponentUserId,
      content: text,
      messageType: fileType,
      attachments: fileAttachments,
      isRead: true,
      createdAt: new Date().toISOString(),
      senderName: me.name,
      senderImage: me.profileImage,
    };

    setMessages(prev => [...prev, tempMessage]);
    socket.emit("chat:send", payload);

    toast.success(`Uploaded ${attachments.length} file(s) to Cloudinary`);

  } catch (error: any) {
    console.error("Error handling files:", error);
    toast.error(`Failed to send files: ${error.message || "Unknown error"}`);
  } finally {
    setIsUploading(false);
  }
};

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordingTime(0);
  };


  // Update the sendAudioMessage function in Chat.tsx
const sendAudioMessage = async () => {
  if (!socket || !audioBlob || !me?.id || !opponentUserId) return;

  try {
    setIsUploading(true);
    
    // Upload audio to Cloudinary first
    console.log("🎤 Uploading audio to Cloudinary...");
    const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { 
      type: 'audio/webm' 
    });
    
    const attachments = await chatUploadService.uploadChatFiles(
      [audioFile],
      chatId || 'temp-chat',
      me.id,
      undefined // No progress callback for audio
    );

    if (attachments.length === 0) {
      throw new Error("Failed to upload audio to Cloudinary");
    }

    const audioAttachment = attachments[0];
    const tempId = "temp-" + Date.now();

    // 🔥 FIXED: Create payload with correct structure for backend
    const payload = {
      chatId: chatIdRef.current,
      text: "🎵 Audio message",
      receiverId: opponentUserId,
      messageType: 'audio' as const,
      attachments: [{
        url: audioAttachment.url,
        type: 'audio',
        name: audioAttachment.name,
        size: audioAttachment.size,
        duration: recordingTime,
        thumbnail: audioAttachment.thumbnail,
        width: audioAttachment.width,
        height: audioAttachment.height,
        publicId: audioAttachment.publicId,
        format: audioAttachment.format,
        mimeType: audioAttachment.mimeType // Include mimeType here
      }],
      fileInfo: [{
        name: audioAttachment.name,
        size: audioAttachment.size,
        mimeType: audioAttachment.mimeType,
        duration: recordingTime,
        width: audioAttachment.width,
        height: audioAttachment.height
      }],
      duration: recordingTime,
      tempId,
    };

    console.log("🎤 Sending audio message with Cloudinary URL:", {
      receiverId: opponentUserId,
      duration: recordingTime,
      attachment: {
        hasMimeType: !!audioAttachment.mimeType,
        type: audioAttachment.type
      }
    });
    
    // Optimistic update
    const tempMessage: IMessage = {
      id: tempId,
      chatId: chatIdRef.current || "",
      senderId: me.id,
      receiverId: opponentUserId,
      content: "🎵 Audio message",
      messageType: 'audio',
      attachments: [{
        url: audioAttachment.url,
        type: 'audio',
        name: audioAttachment.name,
        size: audioAttachment.size,
        duration: recordingTime,
        thumbnail: audioAttachment.thumbnail,
        width: audioAttachment.width,
        height: audioAttachment.height,
        mimeType: audioAttachment.mimeType,
        publicId: audioAttachment.publicId,
        format: audioAttachment.format
      }],
      duration: recordingTime,
      isRead: true,
      createdAt: new Date().toISOString(),
      senderName: me.name,
      senderImage: me.profileImage,
    };

    setMessages(prev => [...prev, tempMessage]);
    socket.emit("chat:send", payload);
    
    toast.success("Audio uploaded to Cloudinary and sent");
    
    setAudioBlob(null);
    setRecordingTime(0);

  } catch (error: any) {
    console.error("Error sending audio:", error);
    toast.error(`Failed to send audio: ${error.message || "Unknown error"}`);
  } finally {
    setIsUploading(false);
  }
};


  const handleSendMessage = () => {
    if ((!newMessage.trim() && !audioBlob) || !socket || !me?.id || !opponentUserId) return;

    if (audioBlob) {
      sendAudioMessage();
    } else {
      const tempId = "temp-" + Date.now();
      const payload = { 
        chatId: chatIdRef.current, 
        text: newMessage, 
        receiverId: opponentUserId,
        messageType: 'text' as const,
        tempId,
      };

      console.log("📝 Sending text message to:", opponentUserId);

      // Optimistic update
      const tempMessage: IMessage = {
        id: tempId,
        chatId: chatIdRef.current || "",
        senderId: me.id,
        receiverId: opponentUserId,
        content: newMessage,
        messageType: 'text',
        isRead: true,
        createdAt: new Date().toISOString(),
        senderName: me.name,
        senderImage: me.profileImage,
      };

      setMessages(prev => [...prev, tempMessage]);
      socket.emit("chat:send", payload);
      setNewMessage("");
    }
  };

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openFileUpload = (type: 'image' | 'video' | 'document') => {
    setUploadFileType(type);
    setShowFileUploadModal(true);
    setShowAttachmentMenu(false);
  };

  // Ref callback for message elements
  const setMessageRef = useCallback((messageId: string, senderId: string) => (element: HTMLDivElement | null) => {
    if (element) {
      messageElementsRef.current.set(messageId, element);
      element.setAttribute('data-message-id', messageId);
      element.setAttribute('data-sender-id', senderId);
      
      // If observer exists, observe this element
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    } else {
      messageElementsRef.current.delete(messageId);
    }
  }, []);

  return (
    <div 
      ref={chatContainerRef}
      className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
      onMouseMove={() => setIsChatActive(true)}
      onClick={() => setIsChatActive(true)}
      onKeyDown={() => setIsChatActive(true)}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              // Mark all as read before leaving
              if (unreadCount > 0) {
                markAllMessagesAsRead();
              }
              navigate("/chat");
            }}
            className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-700">
              <img
                className="w-full h-full object-cover"
                src={opponentUser?.profileImage || DEFAULT_PROFILE_IMAGE}
                alt={opponentUser?.name}
              />
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${isOpponentOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {opponentUser?.name || 'User'}
            </h2>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOpponentOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isOpponentOnline ? 'Online' : 'Offline'}
                {isTyping && ' • Typing...'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <div className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full animate-pulse">
              {unreadCount} new
            </div>
          )}
         <button
            onClick={handleVideoCall}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Video call"
            disabled={!opponentUser?.id}
          >
            <BsCameraVideo className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>


  <button
            onClick={handleVoiceCall}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Voice call"
            disabled={!opponentUser?.id}
          >
            <FaPhone className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          

      
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <BsThreeDotsVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={(e) => {
          // Auto-mark as read when scrolling to bottom
          const container = e.currentTarget;
          const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
          
          if (isAtBottom && unreadCount > 0) {
            markAllMessagesAsRead();
            setHasMarkedInitialRead(true);
          }
          
          // Mark chat as active on scroll
          setIsChatActive(true);
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center mb-4">
              <BsPaperclip className="w-12 h-12 text-purple-500 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Start a conversation with {opponentUser?.name || 'this user'} by sending a message
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => openFileUpload('image')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <FaImage className="w-4 h-4" />
                Share Photo
              </button>
              <button
                onClick={() => startRecording()}
                className="px-4 py-2 border-2 border-purple-500 text-purple-500 dark:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-2"
              >
                <BsMic className="w-4 h-4" />
                Voice Message
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div 
                key={msg.id || msg.tempId} 
                className="group"
                ref={setMessageRef(msg.id || msg.tempId || '', msg.senderId)}
              >
                <div className={`flex ${msg.senderId === me?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.senderId === me?.id ? 'ml-auto' : 'mr-auto'}`}>
                    <MessageBubble
                      message={msg}
                      isOwnMessage={me?.id === msg.senderId}
                    />
                    <div className={`flex items-center gap-1 mt-1 ${msg.senderId === me?.id ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-gray-400">
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </span>
                      {msg.senderId === me?.id && (
                        <span className="text-xs flex items-center gap-1">
                          {msg.isRead ? (
                            <>
                              <BsCheck2All className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] text-blue-500">
                                {msg.readAt ? format(new Date(msg.readAt), 'h:mm a') : 'Read'}
                              </span>
                            </>
                          ) : msg.isDelivered ? (
                            <>
                              <BsCheck2All className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-gray-400">Delivered</span>
                            </>
                          ) : (
                            <BsCheck className="w-3 h-3 text-gray-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Modal */}
      {showFileUploadModal && chatId && me?.id && (
        <FileUploadModal
          isOpen={showFileUploadModal}
          onClose={() => setShowFileUploadModal(false)}
          onFilesSelect={handleFilesSelect}
          messageType={uploadFileType}
          chatId={chatId}
          userId={me.id}
        />
      )}

      {/* Recording Preview */}
      {audioBlob && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 border border-purple-100 dark:border-purple-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <FaPlay className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Audio message</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatRecordingTime(recordingTime)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancelRecording}
                className="px-4 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
              >
                <FaTimes className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={sendAudioMessage}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    Uploading to Cloudinary...
                  </>
                ) : (
                  'Send Audio'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recording Indicator */}
      {isRecording && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border border-red-100 dark:border-red-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                  <BsMic className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-red-700 dark:text-red-300">Recording...</p>
                <p className="text-sm text-red-600 dark:text-red-400">{formatRecordingTime(recordingTime)}</p>
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <FaStop className="w-4 h-4" />
              Stop Recording
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center gap-2">
          {/* Attachment Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={isRecording || !!audioBlob}
            >
              <BsPaperclip className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            {showAttachmentMenu && (
              <div
                ref={attachmentMenuRef}
                className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-[260px] z-10"
              >
                <div className="p-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attach File</p>
                  
                  <button 
                    onClick={() => openFileUpload('image')}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaImage className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200">Photo & Video</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Share images and videos</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => openFileUpload('video')}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group mt-1"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaVideo className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200">Video</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Share video files</p>
                    </div>
                  </button>
                  
                  {/* <button 
                    onClick={() => openFileUpload('document')}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group mt-1"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FaFileAlt className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200">Document</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Share files and documents</p>
                    </div>
                  </button> */}
                </div>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
                setIsChatActive(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
                setIsChatActive(true);
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white placeholder-gray-500 pr-12"
              disabled={isRecording || !!audioBlob || isUploading}
            />
            
            {/* Character counter */}
            {newMessage.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className={`text-xs ${newMessage.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                  {newMessage.length}/1000
                </span>
              </div>
            )}
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full mb-2 right-0 z-10"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  previewConfig={{ showPreview: false }}
                  width={300}
                  height={400}
                />
              </div>
            )}
          </div>

          {/* Emoji Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isRecording || !!audioBlob || isUploading}
          >
            <BsEmojiSmile className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Send/Record Button */}
          {newMessage.trim() || audioBlob ? (
            <button
              onClick={handleSendMessage}
              disabled={isUploading}
              className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isUploading ? (
                <FaSpinner className="w-5 h-5 animate-spin" />
              ) : (
                <BsSend className="w-5 h-5" />
              )}
            </button>
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isUploading}
              className={`p-3 rounded-full transition-all ${
                isRecording 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
            >
              {isRecording ? (
                <BsMicMute className="w-5 h-5" />
              ) : (
                <BsMic className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Upload Status */}
        {isUploading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FaSpinner className="w-4 h-4 animate-spin" />
            <span>Uploading to Cloudinary...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;