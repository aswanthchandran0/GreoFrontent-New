// PostDetails.tsx
import React, { useEffect, useState } from "react";
import { DEFAULT_PROFILE_IMAGE } from "../../../assets/images";
import { FaRegHeart, FaRegComment, FaArrowLeft } from "react-icons/fa";
import UserDetails from "../userManagement/UserDetails";
import { User } from "../../../redux/slices/userSlice";
import { getStackOfUsersApi } from "../../../services/admin/adminApi";

interface ReportedPost {
  _id: string;
  postId: string;
  reportedCount: number;
  createdAt: string;
  postDetails: any;
  userDetails: User;
  users: User[];
  likeCount:number
  commentCount:number
}

interface PostDetailsProps {
  postData: ReportedPost;
  onClose: () => void;
}

const PostDetails: React.FC<PostDetailsProps> = ({ postData, onClose }) => {
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reportingUsers, setReportingUsers] = useState<{ [key: string]: User }>({}); 
 
  console.log("postData.userDetails",postData.userDetails)
  const fetchUserDetails = async () => {
    if (!postData?.users.length) return;
  
    try {
      const userIds = postData.users.map((user) => user.id); // Extract user IDs
      const response = await getStackOfUsersApi(userIds); // Fetch user details
  
      // Convert the response array into an object for easy access by ID
      const userMap = response.data.reduce((acc: { [key: string]: User }, user: User) => {
        acc[user._id || ''] = user;
        return acc;
      }, {});
  
      // Merge reason from postData.users into the fetched user details
      const mergedUsers = postData.users.reduce((acc: { [key: string]: User & { reason?: string } }, user) => {
        if (userMap[user.id]) {
          acc[user.id] = { ...userMap[user.id], reason: user.reason }; // Add reason
        } else {
          acc[user.id] = { ...user, profileImage: DEFAULT_PROFILE_IMAGE }; // Fallback if not found
        }
        return acc;
      }, {});
  
      setReportingUsers(mergedUsers);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };
  
  useEffect(() => {
    fetchUserDetails();
  }, [postData]);

  
  return (
    <div className="w-full p-6 bg-gray-100 rounded-lg">
      <button
        onClick={onClose}
        className="flex items-center mb-6 text-gray-600 hover:text-gray-800"
      >
        <FaArrowLeft className="mr-2" /> Back to Reports
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Post Section */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-xl font-bold">Post Details</h2>
          
          <div className="mb-4">
            <img
              src={postData.postDetails.mediaUrls[0] || DEFAULT_PROFILE_IMAGE}
              alt="Post content"
              className="object-cover w-full rounded-lg h-96"
            />
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex items-center">
              <FaRegHeart className="mr-2 text-red-500" />
              <span>{postData?.likeCount || 0}</span>
            </div>
            <div className="flex items-center">
              <FaRegComment className="mr-2 text-blue-500" />
              <span>{postData?.commentCount || 0}</span>
            </div>
          </div>

          <div className="p-4 rounded bg-gray-50">
            <h3 className="mb-2 font-semibold">Description</h3>
            <p>{postData.postDetails.content || "No description"}</p>
          </div>
        </div>

        {/* User and Reports Section */}
        <div className="space-y-6">
          {/* Post Author */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-bold">Post Author</h2>
            <div className="flex items-center gap-4">
              <img
                src={postData.userDetails.profileImage || DEFAULT_PROFILE_IMAGE}
                alt="Author profile"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{postData.userDetails.name}</h3>
                <p className="text-gray-600">@{postData.userDetails.user_name}</p>
                {/* <button
                  onClick={() => {
                    setSelectedUserId(postData.userDetails._id ||'');
                    setShowUserDetails(true);
                  }}
                  className="mt-2 text-sm text-blue-500 hover:underline"
                >
                  View Profile
                </button> */}
              </div>
            </div>
          </div>

          {/* Reporting Users */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-bold">
              Reports ({postData.reportedCount})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-left">Reason</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                {Object.values(reportingUsers).map((user) => (
                    <tr key={user._id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={user.profileImage || DEFAULT_PROFILE_IMAGE}
                            alt="Reporter profile"
                            className="w-8 h-8 rounded-full"
                          />
                          <span>{user.user_name}ee</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">{(user as any).reason}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => {
                            setSelectedUserId(user._id || null);
                            setShowUserDetails(true);
                          }}
                          className="text-sm text-blue-500 hover:underline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showUserDetails && selectedUserId && (
        <UserDetails
        userId={selectedUserId}
        close={setShowUserDetails}
        />
      )}
    </div>
  );
};

export default PostDetails;