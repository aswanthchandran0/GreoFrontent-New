// // src/components/post/CommentSection.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import { useSelector } from 'react-redux';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   FaTimes,
//   FaHeart,
//   FaRegHeart,
//   FaPaperPlane,
//   FaSmile,
//   FaEllipsisH,
//   FaReply,
//   FaEdit,
//   FaTrash
// } from 'react-icons/fa';
// import { BsThreeDotsVertical } from 'react-icons/bs';

// import toast from 'react-hot-toast';
// import moment from 'moment';

// // Services
// import {
//   getCommentsApi,
//   postCommentApi,
//   toggleLikeApi,
//   deleteCommentApi,
//   replyToCommentApi
// } from '../../services/user/api';
// import { IComment } from '../../Types/commentTypes';
// import { RootState } from '../../redux/store';
// import UserAvatar from '../ui/UserAvatar';

// // Types


// interface CommentSectionProps {
//   targetId: string;
//   targetType: 'post' | 'reel';
//   isOpen: boolean;
//   onClose: () => void;
//   comments?: IComment[];
//   onCommentSubmit?: (comment: string) => Promise<void>;
//   commentInput?: string;
//   setCommentInput?: (value: string) => void;
//   onCommentCountChange?: (count: number) => void;
// }

// const CommentSection: React.FC<CommentSectionProps> = ({
//   targetId,
//   targetType,
//   isOpen,
//   onClose,
//   comments: initialComments,
//   onCommentSubmit,
//   commentInput: externalCommentInput,
//   setCommentInput: externalSetCommentInput,
//   onCommentCountChange
// }) => {
//   const [comments, setComments] = useState<IComment[]>(initialComments || []);
//   const [commentInput, setCommentInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [replyingTo, setReplyingTo] = useState<string | null>(null);
//   const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
//   const [editContent, setEditContent] = useState('');
//   const [activeCommentMenu, setActiveCommentMenu] = useState<string | null>(null);
//   const [isLoadingComments, setIsLoadingComments] = useState(false);
  
//   const commentsEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
  
//   const loggedInUser = useSelector((state: RootState) => state.UserReducer.user);

//   // Use external or internal state for comment input
//   const actualCommentInput = externalCommentInput !== undefined ? externalCommentInput : commentInput;
//   const setActualCommentInput = externalSetCommentInput !== undefined ? externalSetCommentInput : setCommentInput;

//   useEffect(() => {
//     if (isOpen && !initialComments) {
//       fetchComments();
//       inputRef.current?.focus();
//     } else if (initialComments) {
//       setComments(initialComments);
//     }
//   }, [isOpen, initialComments]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [comments]);

//   const fetchComments = async () => {
//     try {
//       setIsLoadingComments(true);
//       const response = await getCommentsApi(targetId, targetType);
//       setComments(response.data);
//       onCommentCountChange?.(response.data.length);
//     } catch (error) {
//       toast.error('Failed to load comments');
//       console.error('Error fetching comments:', error);
//     } finally {
//       setIsLoadingComments(false);
//     }
//   };

//   const scrollToBottom = () => {
//     commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const handleSubmitComment = async () => {
//     if (!actualCommentInput.trim() || loading) return;

//     setLoading(true);
//     try {
//       if (onCommentSubmit) {
//         await onCommentSubmit(actualCommentInput);
//       } else {
//         const response = await postCommentApi(
//           targetId,
//           targetType,
//           actualCommentInput,
//           replyingTo || undefined
//         );
        
//         const commentWithUser = {
//           ...response.data,
//           user: {
//             id: loggedInUser?.id,
//             username: loggedInUser?.username,
//             profileImage: loggedInUser?.profileImage
//           },
//           replies: []
//         };
        
//         setComments(prev => [commentWithUser, ...prev]);
//         onCommentCountChange?.(comments.length + 1);
//       }
      
//       setActualCommentInput('');
//       setReplyingTo(null);
      
//       if (!onCommentSubmit) {
//         toast.success('Comment posted!');
//       }
//     } catch (error) {
//       toast.error('Failed to post comment');
//       console.error('Error posting comment:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLikeComment = async (commentId: string) => {
//     try {
//       const response = await toggleLikeApi(commentId, 'comment');
      
//       setComments(prev => prev.map(comment => 
//         comment.id === commentId 
//           ? { 
//               ...comment, 
//               isLiked: response.data.liked,
//               likeCount: response.data.totalLikes 
//             }
//           : comment
//       ));
//     } catch (error) {
//       console.error('Error liking comment:', error);
//     }
//   };

//   const handleDeleteComment = async (commentId: string) => {
//     try {
//       await deleteCommentApi(commentId);
//       setComments(prev => prev.filter(comment => comment.id !== commentId));
//       onCommentCountChange?.(comments.length - 1);
//       toast.success('Comment deleted');
//       setActiveCommentMenu(null);
//     } catch (error) {
//       toast.error('Failed to delete comment');
//       console.error('Error deleting comment:', error);
//     }
//   };

//   const handleReplyToComment = async (commentId: string, replyText: string) => {
//     try {
//       const response = await replyToCommentApi(commentId, replyText);
      
//       setComments(prev => prev.map(comment =>
//         comment.id === commentId
//           ? {
//               ...comment,
//               replies: [...(comment.replies || []), response.data]
//             }
//           : comment
//       ));
      
//       toast.success('Reply posted!');
//     } catch (error) {
//       toast.error('Failed to post reply');
//       console.error('Error posting reply:', error);
//     }
//   };

//   const handleStartEdit = (comment: IComment) => {
//     setEditingCommentId(comment.id);
//     setEditContent(comment.content);
//     setActiveCommentMenu(null);
//   };

//   const handleUpdateComment = async (commentId: string) => {
//     try {
//       // You'll need to add an updateCommentApi function
//       // await updateCommentApi(commentId, editContent);
      
//       setComments(prev => prev.map(comment =>
//         comment.id === commentId
//           ? { ...comment, content: editContent }
//           : comment
//       ));
      
//       setEditingCommentId(null);
//       toast.success('Comment updated');
//     } catch (error) {
//       toast.error('Failed to update comment');
//       console.error('Error updating comment:', error);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmitComment();
//     }
//   };

//   const formatTime = (date: string | Date) => {
//     return moment(date).fromNow();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95, y: 20 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.95, y: 20 }}
//         className="relative flex flex-col w-full max-w-2xl h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
//           <h3 className="text-xl font-bold text-gray-900 dark:text-white">
//             Comments
//           </h3>
          
//           <button
//             onClick={onClose}
//             className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//           >
//             <FaTimes className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Comments List */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-6">
//           {isLoadingComments ? (
//             <div className="flex flex-col items-center justify-center h-full">
//               <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
//               <p className="text-gray-500 dark:text-gray-400">Loading comments...</p>
//             </div>
//           ) : comments.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
//               <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
//                 <FaRegHeart className="w-8 h-8 opacity-50" />
//               </div>
//               <p className="text-lg font-medium mb-2">No comments yet</p>
//               <p className="text-sm">Be the first to comment!</p>
//             </div>
//           ) : (
//             comments.map((comment) => (
//               <div key={comment.id} className="space-y-4">
//                 {/* Main Comment */}
//                 <div className="flex gap-4">
//                   {/* Avatar */}
//                   <UserAvatar
//                     src={comment.user?.profileImage}
//                     alt={comment.user?.username || 'User'}
//                     size="md"
//                     className="flex-shrink-0"
//                   />
                  
//                   {/* Comment Content */}
//                   <div className="flex-1">
//                     <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
//                       {/* Comment Header */}
//                       <div className="flex items-start justify-between mb-2">
//                         <div>
//                           <span className="font-semibold text-gray-900 dark:text-white">
//                             {comment.user?.username || 'Unknown User'}
//                           </span>
//                           <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
//                             {formatTime(comment.createdAt)}
//                           </span>
//                         </div>
                        
//                         {/* Comment Menu */}
//                         <div className="relative">
//                           <button
//                             onClick={() => setActiveCommentMenu(
//                               activeCommentMenu === comment.id ? null : comment.id
//                             )}
//                             className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//                           >
//                             <BsThreeDotsVertical className="w-4 h-4" />
//                           </button>
                          
//                           {/* Comment Menu Dropdown */}
//                           <AnimatePresence>
//                             {activeCommentMenu === comment.id && (
//                               <motion.div
//                                 initial={{ opacity: 0, scale: 0.95 }}
//                                 animate={{ opacity: 1, scale: 1 }}
//                                 exit={{ opacity: 0, scale: 0.95 }}
//                                 className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
//                               >
//                                 {/* Reply Option */}
//                                 <button
//                                   onClick={() => {
//                                     setReplyingTo(comment.id);
//                                     inputRef.current?.focus();
//                                     setActiveCommentMenu(null);
//                                   }}
//                                   className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                                 >
//                                   <FaReply className="w-4 h-4" />
//                                   <span>Reply</span>
//                                 </button>
                                
//                                 {/* Edit Option (only for comment owner) */}
//                                 {comment.user?.id === loggedInUser?.id && (
//                                   <button
//                                     onClick={() => handleStartEdit(comment)}
//                                     className="flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                                   >
//                                     <FaEdit className="w-4 h-4" />
//                                     <span>Edit</span>
//                                   </button>
//                                 )}
                                
//                                 {/* Delete Option (only for comment owner or post owner) */}
//                                 {(comment.user?.id === loggedInUser?.id || true) && ( // Add post owner check here
//                                   <button
//                                     onClick={() => handleDeleteComment(comment.id)}
//                                     className="flex items-center gap-2 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
//                                   >
//                                     <FaTrash className="w-4 h-4" />
//                                     <span>Delete</span>
//                                   </button>
//                                 )}
//                               </motion.div>
//                             )}
//                           </AnimatePresence>
//                         </div>
//                       </div>
                      
//                       {/* Comment Content */}
//                       {editingCommentId === comment.id ? (
//                         <div className="mt-2">
//                           <input
//                             type="text"
//                             value={editContent}
//                             onChange={(e) => setEditContent(e.target.value)}
//                             className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
//                             autoFocus
//                             onKeyPress={(e) => {
//                               if (e.key === 'Enter') handleUpdateComment(comment.id);
//                               if (e.key === 'Escape') setEditingCommentId(null);
//                             }}
//                           />
//                           <div className="flex gap-2 mt-2">
//                             <button
//                               onClick={() => handleUpdateComment(comment.id)}
//                               className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                             >
//                               Save
//                             </button>
//                             <button
//                               onClick={() => setEditingCommentId(null)}
//                               className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         <p className="text-gray-700 dark:text-gray-300 mb-3">
//                           {comment.content}
//                         </p>
//                       )}
                      
//                       {/* Comment Actions */}
//                       <div className="flex items-center gap-4">
//                         <button
//                           onClick={() => handleLikeComment(comment.id)}
//                           className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400"
//                         >
//                           {comment.isLiked ? (
//                             <FaHeart className="w-3 h-3 text-red-500" />
//                           ) : (
//                             <FaRegHeart className="w-3 h-3" />
//                           )}
//                           <span>{comment.likeCount || 0}</span>
//                         </button>
                        
//                         <button
//                           onClick={() => {
//                             setReplyingTo(comment.id);
//                             inputRef.current?.focus();
//                           }}
//                           className="text-sm text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
//                         >
//                           Reply
//                         </button>
//                       </div>
//                     </div>
                    
//                     {/* Replies Section */}
//                     {comment.replies && comment.replies.length > 0 && (
//                       <div className="ml-12 mt-4 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
//                         {comment.replies.map((reply) => (
//                           <div key={reply.id} className="flex gap-3">
//                             <UserAvatar
//                               src={reply.user?.profileImage}
//                               alt={reply.user?.username || 'User'}
//                               size="sm"
//                               className="flex-shrink-0"
//                             />
//                             <div className="flex-1">
//                               <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
//                                 <div className="flex items-center gap-2 mb-1">
//                                   <span className="text-sm font-medium text-gray-900 dark:text-white">
//                                     {reply.user?.username}
//                                   </span>
//                                   <span className="text-xs text-gray-500">
//                                     {formatTime(reply.createdAt)}
//                                   </span>
//                                 </div>
//                                 <p className="text-sm text-gray-700 dark:text-gray-300">
//                                   {reply.content}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//           <div ref={commentsEndRef} />
//         </div>

//         {/* Comment Input */}
//         <div className="border-t border-gray-100 dark:border-gray-800 p-4">
//           {replyingTo && (
//             <div className="flex items-center justify-between mb-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//               <span className="text-sm text-blue-600 dark:text-blue-400">
//                 Replying to comment...
//               </span>
//               <button
//                 onClick={() => setReplyingTo(null)}
//                 className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}
          
//           <div className="flex gap-3">
//             <UserAvatar
//               src={loggedInUser?.profileImage}
//               alt={loggedInUser?.username || 'You'}
//               size="md"
//               className="flex-shrink-0"
//             />
            
//             <div className="flex-1 relative">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 value={actualCommentInput}
//                 onChange={(e) => setActualCommentInput(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
//                 className="w-full px-5 py-3 bg-gray-100 dark:bg-gray-800 rounded-full border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
//                 disabled={loading}
//               />
              
//               <button
//                 onClick={handleSubmitComment}
//                 disabled={!actualCommentInput.trim() || loading}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:scale-105"
//               >
//                 {loading ? (
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 ) : (
//                   <FaPaperPlane className="w-4 h-4" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default CommentSection;