// src/pages/Profiles.tsx - Add state management for follower counts

import { ArrowLeft, Search, Users, Sparkles, ChevronDown, X, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "../../../redux/slices/userSlice";
import { getUsers } from "../../../services/user/api";

import { useDebounce } from "../../../hooks/useDebounce";
import { GetUsersParams } from "../../../interface/getUsersParams";
import ProfileCard from "./ProfileCard";

const Profiles = () => {
  const [userProfiles, setUserProfiles] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "mostActive">("recent");
  const [filterBy, setFilterBy] = useState<"all" | "active">("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  // Handle follow/unfollow changes
  const handleFollowChange = (userId: string, isFollowing: boolean, newFollowersCount?: number) => {
    setUserProfiles(prevProfiles => 
      prevProfiles.map(profile => {
        if (profile.id === userId) {
          return {
            ...profile,
            isFollowing,
            followersCount: newFollowersCount !== undefined ? newFollowersCount : 
              isFollowing ? (profile.followersCount || 0) + 1 : Math.max(0, (profile.followersCount || 0) - 1)
          };
        }
        return profile;
      })
    );
  };

  // Fetch profiles with filters
  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetUsersParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        sortBy: sortBy,
        filterBy: filterBy
      };
      
      const response = await getUsers(params);
      
      if (response.data.success) {
        setUserProfiles(response.data.data.users);
        setTotalPages(response.data.data.totalPages);
        setTotalUsers(response.data.data.total);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [currentPage, debouncedSearch, sortBy, filterBy]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortBy, filterBy]);

  // Loading spinner
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
        Discovering amazing people...
      </p>
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative w-32 h-32 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
        <Users className="w-32 h-32 text-gray-300 dark:text-gray-700" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
        No users found
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {debouncedSearch
          ? `No results found for "${debouncedSearch}". Try a different search term.`
          : filterBy !== "all"
          ? `No active users found. Try changing your filters.`
          : "There are no users to display at the moment. Check back later!"}
      </p>
      {(debouncedSearch || filterBy !== "all") && (
        <button
          onClick={() => {
            setSearchQuery("");
            setFilterBy("all");
          }}
          className="mt-4 px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </motion.div>
  );

  // Sort Menu Component
  const SortMenu = () => (
    <AnimatePresence>
      {showSortMenu && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setShowSortMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {[
              { value: "recent", label: "Recently joined", icon: "✨", description: "Newest members first" },
              { value: "name", label: "Name A-Z", icon: "📝", description: "Alphabetical order" },
              { value: "mostActive", label: "Most active", icon: "⚡", description: "Recently active users" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value as any);
                  setShowSortMenu(false);
                }}
                className={`w-full px-4 py-3 text-left transition-colors group ${
                  sortBy === option.value
                    ? "bg-purple-50 dark:bg-purple-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      sortBy === option.value
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {option.description}
                    </div>
                  </div>
                  {sortBy === option.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Filter Menu Component
  const FilterMenu = () => (
    <AnimatePresence>
      {showFilterMenu && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setShowFilterMenu(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {[
              { value: "all", label: "All users", icon: "🌍", description: "Show everyone" },
              { value: "active", label: "Active users", icon: "🔥", description: "Recently active" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilterBy(option.value as any);
                  setShowFilterMenu(false);
                }}
                className={`w-full px-4 py-3 text-left transition-colors group ${
                  filterBy === option.value
                    ? "bg-purple-50 dark:bg-purple-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.icon}</span>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      filterBy === option.value
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {option.description}
                    </div>
                  </div>
                  {filterBy === option.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Pagination Component
  const PaginationComponent = () => {
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-all duration-300 ${
            currentPage === 1
              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              : "text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600"
          }`}
        >
          <ChevronDown className="w-5 h-5 rotate-90" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <motion.button
              key={index}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              whileHover={page !== '...' ? { scale: 1.05 } : {}}
              whileTap={page !== '...' ? { scale: 0.95 } : {}}
              className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                page === currentPage
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                  : page === '...'
                  ? "text-gray-400 dark:text-gray-600 cursor-default"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              }`}
            >
              {page}
            </motion.button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-all duration-300 ${
            currentPage === totalPages
              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
              : "text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600"
          }`}
        >
          <ChevronDown className="w-5 h-5 -rotate-90" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Home</span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden sm:flex items-center gap-2"
            >
              <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {totalUsers} People
                </span>
              </div>
            </motion.div>
          </div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Connect with Amazing People
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover and connect with like-minded individuals. Build your network and grow together.
            </p>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, username, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                </button>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 transition-all duration-300 text-gray-700 dark:text-gray-300"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sort</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
              </button>
              <SortMenu />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 transition-all duration-300 text-gray-700 dark:text-gray-300"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                {filterBy !== "all" && (
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
              </button>
              <FilterMenu />
            </div>
          </motion.div>

          {/* Active Filters Display */}
          {(searchQuery || filterBy !== "all") && (
            <div className="flex flex-wrap gap-2 mt-3 mb-4">
              {searchQuery && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm">
                  <span className="text-purple-600 dark:text-purple-400">Search: {searchQuery}</span>
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3 ml-1 text-purple-600 dark:text-purple-400" />
                  </button>
                </div>
              )}
              {filterBy !== "all" && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm">
                  <span className="text-purple-600 dark:text-purple-400">
                    Filter: Active users
                  </span>
                  <button onClick={() => setFilterBy("all")}>
                    <X className="w-3 h-3 ml-1 text-purple-600 dark:text-purple-400" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profiles Grid */}
        {loading && isInitialLoad ? (
          <LoadingSpinner />
        ) : userProfiles.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {userProfiles.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <ProfileCard 
                      user={user} 
                      onFollowChange={handleFollowChange}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            <PaginationComponent />

            {/* Loading More Indicator */}
            {loading && !isInitialLoad && (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState />
        )}

        {/* Stats Footer */}
        {userProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {userProfiles.length} of {totalUsers} users
              {filterBy !== "all" && ` • Filtered by active users`}
              {searchQuery && ` • Matching "${searchQuery}"`}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profiles;