import Modal from "react-modal";
import { blockUserPost } from "../../../services/admin/adminApi";
import toast from "react-hot-toast";
import { useState } from "react";
import { LoaderSpinner } from "../../ui/LoadingSpinner";
import { IReportedPost } from "./Posts";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  setReportedPosts: React.Dispatch<React.SetStateAction<IReportedPost[]>>;
  postId: string;
  action: boolean;
}

const BlockModal: React.FC<Props> = ({
  isOpen,
  onClose,
  setReportedPosts,
  postId,
  action,
}) => {
  const [loading, setLoading] = useState(false);
  // handle user post Block
  const handlePostBlock = async () => {
    try {
      setLoading(true);
      const response = await blockUserPost(postId, action);
      console.log("response from bloack user", response.data);
      if (response?.data === true) {
        setReportedPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.postId === postId
              ? {
                  ...post,
                  postDetails: {
                    ...post.postDetails,
                    isBlocked: action,
                  },
                }
              : post
          )
        );

        console.log("the request was reaching inside the ");
        toast.success(`post ${action ? "blocked" : "unblocked"}`);
        onClose();
      } else {
        toast.error("Failed to block/unblock post");
        console.error("Failed to block/unblock the post.");
      }
      onClose();
    } catch (error) {
      console.error("Error while blocking/unblocking the post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      overlayClassName="fixed inset-0  bg-opacity-50"
    >
      <div className="fixed inset-0 flex items-center justify-center ">
        <div className="flex flex-col items-center justify-center w-full h-full max-w-md p-4 rounded shadow bg-background-light max-h-72">
          <span className="text-xl font-bold text-text-black font-golos">{`${
            action ? "Block" : "Unblock"
          } Post`}</span>
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            {loading ? (
              <LoaderSpinner loading={loading} />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full ">
                <span className="text-text-black font-golos text-md">
                  {`Are you sure you want to ${
                    action ? "Block" : "Unblock"
                  } the post?`}
                </span>

                <div className="flex flex-row space-x-3 ">
                  <button
                    onClick={onClose}
                    className="p-1 px-2 bg-blue-500 rounded text-text-white hover:bg-blue-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePostBlock}
                    className="p-1 px-2 bg-red-500 rounded text-text-white hover:bg-red-600"
                  >{`${action ? "Block" : "Unblock"}`}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BlockModal;
