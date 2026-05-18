// src/components/layout/SearchedUsersList.tsx

import { IoCloseOutline, IoSearchOutline } from "react-icons/io5";
import { FaUsers, FaUser } from "react-icons/fa";
import UserWithFollow from "./profile/UserWithFollow";
import { User } from "../../redux/slices/userSlice";

interface Props {
  users: User[];
  onClose: () => void;
  isLoading?: boolean;
}

const SearchedUsersList: React.FC<Props> = ({ users, onClose, isLoading = false }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <IoSearchOutline className="text-purple-500 dark:text-purple-400 text-lg" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Search Results</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({users.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <IoCloseOutline className="text-gray-500 dark:text-gray-400 text-xl" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((user) => (
              <UserWithFollow key={user.id} user={user} onClose={onClose} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
              <FaUsers className="text-gray-400 dark:text-gray-500 text-xl" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No users found
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Try searching with a different name
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchedUsersList;