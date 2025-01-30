import { useEffect, useState } from "react";
import { getReportedPostApi } from "../../../services/admin/adminApi";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import PostDetails from "./PostDetails";
import BlockModal from "./BlockModal";
import { IPost } from "../../../Types/postTypes"; // Adjust import path
import { User } from "../../../redux/slices/userSlice";

interface ReportedPost {
  _id: string;
  postId: string;
  reportedCount: number;
  createdAt: string;
  postDetails: IPost;
  userDetails: User;
  users: User[];
  likeCount:number
  commentCount:number
}

const Posts = () => {
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ReportedPost | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState("");
  const [currentAction, setCurrentAction] = useState(false);

  useEffect(() => {
    const fetchReportedPosts = async () => {
      try {
        const response = await getReportedPostApi();
        setReportedPosts(response.data);
      } catch (error) {
        console.error("Error fetching reported posts:", error);
      }
    };
    fetchReportedPosts();
  }, []);

  const handleViewPost = (post: ReportedPost) => {
    setSelectedPost(post);
  };

  const handleBlockAction = (postId: string, isBlocked: boolean) => {
    setSelectedPostId(postId);
    setCurrentAction(isBlocked);
    setShowBlockModal(true);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Reported Posts</h1>

        {selectedPost ? (
  <PostDetails 
    postData={selectedPost}
    onClose={() => setSelectedPost(null)}
  />
) : (

          <div className="overflow-hidden bg-white rounded-lg shadow">
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
                    src={post.postDetails.mediaUrls[0] || DEFAULT_PROFILE_IMAGE}
                    alt="Post content"
                    className="object-cover w-16 h-16 rounded"
                  />

                  <span className="font-medium">{post.userDetails.name}</span>
                  
                  <img
                    src={post.userDetails.profileImage || DEFAULT_PROFILE_IMAGE}
                    alt="User profile"
                    className="w-10 h-10 rounded-full"
                  />

                  <span className="font-semibold text-red-500">
                    {post.reportedCount}
                  </span>

                  <button
                    onClick={() => handleViewPost(post)}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleBlockAction(post.postId, post.postDetails.isBlocked)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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