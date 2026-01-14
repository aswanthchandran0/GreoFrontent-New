// PostDetails.tsx
import React, { useState } from "react";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { FaRegHeart, FaRegComment, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import UserDetails from "../userManagement/UserDetails";
import { BackendReportedPost } from "./Posts";
import { blockPostApi, unblockPostApi } from "../../../services/admin/adminApi"; // Import the new API functions

interface PostDetailsProps {
  postData: BackendReportedPost;
  onClose: () => void;
  onPostStatusChange?: (postId: string, isBlocked: boolean) => void; // Add callback for parent
}

const PostDetails: React.FC<PostDetailsProps> = ({ postData, onClose, onPostStatusChange }) => {
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPostData, setLocalPostData] = useState(postData); // Local state for updates

  console.log("postData in PostDetails:", postData);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle block/unblock action
  const handleBlockAction = async () => {
    const { postId } = localPostData;
    const isCurrentlyBlocked = localPostData.postDetails.isBlocked;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (isCurrentlyBlocked) {
        // Unblock the post
        response = await unblockPostApi(postId);
      } else {
        // Block the post - you could add a prompt for reason
        // const reason = prompt("Enter reason for blocking (optional):");
        response = await blockPostApi(postId,undefined);
      }
      
      if (response.data.success) {
        // Update local state
        const updatedPostData = {
          ...localPostData,
          postDetails: {
            ...localPostData.postDetails,
            isBlocked: !isCurrentlyBlocked
          }
        };
        
        setLocalPostData(updatedPostData);
        
        // Notify parent component if callback provided
        if (onPostStatusChange) {
          onPostStatusChange(postId, !isCurrentlyBlocked);
        }
        
      } else {
        setError(response.data.message || 'Operation failed');
      }
    } catch (error: any) {
      console.error("Error updating post status:", error);
      setError(error.response?.data?.message || 'Failed to update post status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 bg-gray-100 rounded-lg">
      <button
        onClick={onClose}
        className="flex items-center mb-6 text-gray-600 hover:text-gray-800"
        disabled={isLoading}
      >
        <FaArrowLeft className="mr-2" /> Back to Reports
      </button>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Post Section */}
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Post Details</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              localPostData.postDetails.isBlocked 
                ? "bg-red-100 text-red-800" 
                : "bg-green-100 text-green-800"
            }`}>
              {localPostData.postDetails.isBlocked ? "Blocked" : "Active"}
            </span>
          </div>
          
          {/* Post Media */}
          <div className="mb-4">
            {localPostData.postDetails.mediaUrls && localPostData.postDetails.mediaUrls.length > 0 ? (
              <img
                src={localPostData.postDetails.mediaUrls[0]}
                alt="Post content"
                className="object-cover w-full rounded-lg h-96"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-64 bg-gray-200 rounded-lg">
                <span className="text-gray-500">No media available</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-4">
            <div className="flex items-center">
              <FaRegHeart className="mr-2 text-red-500" />
              <span className="font-medium">{localPostData.postDetails.likeCount || 0} likes</span>
            </div>
            <div className="flex items-center">
              <FaRegComment className="mr-2 text-blue-500" />
              <span className="font-medium">{localPostData.postDetails.commentCount || 0} comments</span>
            </div>
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2 text-orange-500" />
              <span className="font-medium">{localPostData.reportCount || 0} reports</span>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4 mb-4 rounded bg-gray-50">
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="text-gray-700">{localPostData.postDetails.content || "No description provided"}</p>
          </div>

          {/* Post Info */}
          <div className="p-4 rounded bg-gray-50">
            <h3 className="mb-2 font-semibold">Post Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Post ID:</span>
                <p className="font-mono truncate" title={localPostData.postId}>
                  {localPostData.postId}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <p>{formatDate(localPostData.postDetails.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Reported:</span>
                <p>{formatDate(localPostData.lastReportedAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Report Reasons:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {localPostData.reasons.map((reason, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="space-y-6">
          {/* Post Author */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-bold">Post Author</h2>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
              <img
                src={localPostData.postDetails.profileImage || DEFAULT_PROFILE_IMAGE}
                alt="Author profile"
                className="w-16 h-16 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold">{localPostData.postDetails.name || "Unknown User"}</h3>
                <p className="text-gray-600">@{localPostData.postDetails.username || "unknown"}</p>
                <p className="text-sm text-gray-500">User ID: {localPostData.postDetails.userId.substring(0, 8)}...</p>
              </div>
              <button
                onClick={() => {
                  setSelectedUserId(localPostData.postDetails.userId);
                  setSelectedUsername(localPostData.postDetails.username);
                  setShowUserDetails(true);
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                disabled={isLoading}
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Report Summary */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-bold">Report Summary</h2>
            
            <div className="mb-4">
              <h3 className="mb-2 font-semibold">Report Reasons</h3>
              <div className="space-y-2">
                {localPostData.reasons.map((reason, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50">
                    <span className="flex items-center">
                      <FaExclamationTriangle className="mr-2 text-orange-500" />
                      {reason.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">Reported</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded bg-gray-50">
              <h3 className="mb-2 font-semibold">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Post Created:</span>
                  <span>{formatDate(localPostData.postDetails.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Reported:</span>
                  <span>{formatDate(localPostData.lastReportedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reports:</span>
                  <span className="font-bold text-red-600">{localPostData.reportCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-bold">Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleBlockAction}
                disabled={isLoading}
                className={`px-4 py-3 font-medium rounded-lg flex items-center justify-center gap-2 ${
                  localPostData.postDetails.isBlocked
                    ? "bg-green-100 text-green-800 hover:bg-green-200 disabled:bg-green-50"
                    : "bg-red-100 text-red-800 hover:bg-red-200 disabled:bg-red-50"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  `${localPostData.postDetails.isBlocked ? "Unblock Post" : "Block Post"}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUsername && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg">
            <UserDetails
              username={selectedUsername}
              close={() => {
                setShowUserDetails(false);
                setSelectedUsername(null);
                setSelectedUserId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;