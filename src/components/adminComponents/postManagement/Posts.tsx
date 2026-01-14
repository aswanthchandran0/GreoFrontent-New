import { useEffect, useState } from "react";
import { getReportedPostApi } from "../../../services/admin/adminApi";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import PostDetails from "./PostDetails";
import BlockModal from "./BlockModal";

// Backend response interfaces - Update to match actual response
export interface BackendReportedPost {
  postId: string;
  reportCount: number;
  reasons: string[];
  lastReportedAt: string;
  postDetails: {
    content: string;
    mediaUrls: string[];
    userId: string;
    username: string; // Already included!
    profileImage: string; // Already included!
    name: string; // Already included!
    createdAt: string;
    isBlocked: boolean;
    likeCount?: number; // Make optional if not always present
    commentCount?: number; // Make optional if not always present
  };
}

// No need for separate ReportedPost interface - use BackendReportedPost directly
// API response type
interface ReportedPostsResponse {
  success: boolean;
  message: string;
  data: {
    reportedPosts: BackendReportedPost[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const Posts = () => {
  const [reportedPosts, setReportedPosts] = useState<BackendReportedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BackendReportedPost | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [currentAction, setCurrentAction] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportedPosts = async () => {
      try {
        setLoading(true);
        const response = await getReportedPostApi();
        const data: ReportedPostsResponse = response.data;
        
        console.log("Fetched reported posts data:", data);
        
        if (data.success && data.data.reportedPosts) {
          setReportedPosts(data.data.reportedPosts);
        }
      } catch (error) {
        console.error("Error fetching reported posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportedPosts();
  }, []);

  const handleViewPost = (post: BackendReportedPost) => {
    setSelectedPost(post);
  };

  const handleBlockAction = (postId: string, isBlocked: boolean) => {
    setSelectedPostId(postId);
    setCurrentAction(isBlocked);
    setShowBlockModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading reported posts...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Reported Posts {reportedPosts.length > 0 && `(${reportedPosts.length})`}
        </h1>

        {selectedPost ? (
          <PostDetails 
            postData={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        ) : (
          <div className="overflow-hidden bg-white rounded-lg shadow">
            {reportedPosts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No reported posts found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-4 p-4 font-medium bg-gray-100">
                  <span>No</span>
                  <span>Post Preview</span>
                  <span>User</span>
                  <span>Profile</span>
                  <span>Reports</span>
                  <span>Details</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y">
                  {reportedPosts.map((post, index) => (
                    <div key={post.postId} className="grid items-center grid-cols-7 gap-4 p-4 hover:bg-gray-50">
                      <span className="text-gray-600">{index + 1}</span>
                      
                      <img
                        src={post.postDetails.mediaUrls?.[0] || DEFAULT_PROFILE_IMAGE}
                        alt="Post content"
                        className="object-cover w-16 h-16 rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
                        }}
                      />

                      <span className="font-medium" title={post.postDetails.name}>
                        {post.postDetails.name || "Unknown User"}
                      </span>
                      
                      <img
                        src={post.postDetails.profileImage || DEFAULT_PROFILE_IMAGE}
                        alt="User profile"
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
                        }}
                        title={`@${post.postDetails.username}`}
                      />

                      <div className="flex flex-col">
                        <span className="font-semibold text-red-500">
                          {post.reportCount} reports
                        </span>
                        <span className="text-xs text-gray-500 truncate" title={post.reasons.join(", ")}>
                          {post.reasons.join(", ")}
                        </span>
                      </div>

                      <button
                        onClick={() => handleViewPost(post)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => handleBlockAction(post.postId, post.postDetails.isBlocked)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          post.postDetails.isBlocked
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {post.postDetails.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {showBlockModal && (
          <BlockModal
            isOpen={showBlockModal}
            onClose={() => setShowBlockModal(false)}
            postId={selectedPostId}
            currentStatus={currentAction}
            onSuccess={(newStatus) => {
              setReportedPosts(posts =>
                posts.map(post =>
                  post.postId === selectedPostId
                    ? {
                        ...post,
                        postDetails: {
                          ...post.postDetails,
                          isBlocked: newStatus
                        }
                      }
                    : post
                )
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Posts;