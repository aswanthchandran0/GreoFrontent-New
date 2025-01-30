import { useState } from "react";
import { blockUserPost } from "../../../services/admin/adminApi";
import { LoaderSpinner } from "../../ui/LoadingSpinner";
import toast from "react-hot-toast";
import Modal from "react-modal";

// BlockModal.tsx
interface Props {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  currentStatus: boolean;
  onSuccess: (newStatus: boolean) => void;
}

const BlockModal: React.FC<Props> = ({
  isOpen,
  onClose,
  postId,
  currentStatus,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handlePostBlock = async () => {
    try {
      setLoading(true);
      const response = await blockUserPost(postId, !currentStatus);
      
      if (response?.data) {
        onSuccess(!currentStatus);
        toast.success(`Post ${!currentStatus ? "blocked" : "unblocked"}`);
        onClose();
      } else {
        toast.error("Failed to update post status");
      }
    } catch (error) {
      console.error("Error updating post status:", error);
      toast.error("Failed to update post status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      overlayClassName="fixed inset-0"
    >
      <div className="relative w-full max-w-md p-6 mx-4 bg-white rounded-lg">
        <h2 className="mb-4 text-xl font-bold">
          {currentStatus ? "Unblock Post" : "Block Post"}
        </h2>
        
        {loading ? (
          <LoaderSpinner loading={loading} />
        ) : (
          <>
            <p className="mb-6">
              Are you sure you want to {currentStatus ? "unblock" : "block"} this post?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePostBlock}
                className={`px-4 py-2 text-white rounded ${
                  currentStatus 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {currentStatus ? "Confirm Unblock" : "Confirm Block"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default BlockModal