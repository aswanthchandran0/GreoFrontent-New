// src/pages/admin/AdminUsers.tsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Ban,
  AlertTriangle,
  Mail,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
  Activity,
  XCircle
} from 'lucide-react';
import { getUserManagementData, suspendUserApi, unSuspendUserApi, warnUserApi } from '../../services/admin/adminApi';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage?: string | null;
  bio?: string;
  isVerified: boolean;
  isSuspended: boolean;
  isDeleted: boolean;
  lastLogin?: string;
  lastActive?: string;
  postsCount: number;
  reelsCount: number;
  reportsCount: number;
  followersCount: number;
  followingCount: number;
  commentsCount: number;
  likesReceived: number;
  createdAt: string;
  warningCount: number;
}

interface ApiResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'suspended' | 'flagged'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'unsuspend' | 'warn'>('suspend');
  const [reason, setReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUserManagementData(currentPage, itemsPerPage, debouncedSearchTerm, filter);
      
      if (response.data?.success) {
        const data: ApiResponse = response.data.data;
        setUsers(data.users);
        setTotalUsers(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filter]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearchTerm, filter]);

  // ✅ SUSPEND USER HANDLER
  const handleSuspendUser = async (userId: string) => {
    if (!reason || reason.trim() === '') {
      toast.error('Please provide a reason for suspension');
      return;
    }
    
    setIsActionLoading(true);
    try {
      await suspendUserApi(userId, reason);
      toast.success('User suspended successfully. Email notification sent.');
      await fetchUsers();
      setShowActionModal(false);
      setReason('');
    } catch (error: any) {
      console.error('Error suspending user:', error);
      toast.error(error.response?.data?.error || 'Failed to suspend user');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ✅ UNSUSPEND USER HANDLER
  const handleUnsuspendUser = async (userId: string) => {
    setIsActionLoading(true);
    try {
      await unSuspendUserApi(userId);
      toast.success('User activated successfully. Email notification sent.');
      await fetchUsers();
      setShowActionModal(false);
    } catch (error: any) {
      console.error('Error activating user:', error);
      toast.error(error.response?.data?.error || 'Failed to activate user');
    } finally {
      setIsActionLoading(false);
    }
  };

  // ✅ WARN USER HANDLER - Check for max warnings before sending
  const handleWarnUser = async (userId: string) => {
    // Check if user already has 3 warnings
    if (selectedUser && selectedUser.warningCount >= 3) {
      toast.error(`User already has ${selectedUser.warningCount}/3 warnings. Cannot send more warnings.`);
      setShowActionModal(false);
      return;
    }
    
    if (!reason || reason.trim() === '') {
      toast.error('Please provide a reason for the warning');
      return;
    }
    
    setIsActionLoading(true);
    try {
      const response = await warnUserApi(userId, reason);
      
      if (response.data.autoSuspended) {
        toast.error(`User has been automatically suspended after receiving 3 warnings.`, { duration: 5000 });
      } else {
        const warningsLeft = 3 - response.data.warningCount;
        toast.success(`Warning sent. ${response.data.warningCount}/3 warnings. ${warningsLeft} ${warningsLeft === 1 ? 'warning' : 'warnings'} remaining.`);
      }
      
      await fetchUsers();
      setShowActionModal(false);
      setReason('');
    } catch (error: any) {
      console.error('Error sending warning:', error);
      toast.error(error.response?.data?.error || 'Failed to send warning');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Function to check if warning button should be disabled
  const isWarningDisabled = (user: User) => {
    return user.isSuspended || user.warningCount >= 3;
  };

  // Function to get warning button tooltip text
  const getWarningTooltip = (user: User) => {
    if (user.isSuspended) return 'Cannot send warning to suspended user';
    if (user.warningCount >= 3) return `User already has maximum warnings (${user.warningCount}/3)`;
    return 'Send Warning';
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'suspended' && !user.isSuspended) return false;
    if (filter === 'flagged' && user.reportsCount < 3) return false;
    return true;
  });

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  const openActionModal = (user: User, action: typeof actionType) => {
    // Prevent opening warn modal if user already has 3 warnings
    if (action === 'warn' && user.warningCount >= 3) {
      toast.error(`User already has ${user.warningCount}/3 warnings. Cannot send more warnings.`);
      return;
    }
    
    // Prevent opening warn modal if user is suspended
    if (action === 'warn' && user.isSuspended) {
      toast.error('Cannot send warning to suspended user. Please unsuspend first.');
      return;
    }
    
    setSelectedUser(user);
    setActionType(action);
    setReason('');
    setShowActionModal(true);
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const getStatusColor = (user: User) => {
    if (user.isSuspended) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    return 'border-gray-200 dark:border-gray-700';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRandomGradient = (id: string) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500'
    ];
    const index = parseInt(id) % gradients.length;
    return gradients[index];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage users, review flagged accounts, and handle violations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              Total: {totalUsers}
            </span>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Suspended</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.isSuspended).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Flagged</p>
              <p className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.reportsCount >= 3).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-900"
          />
          {searchTerm !== debouncedSearchTerm && searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900"
        >
          <option value="all">All Users</option>
          <option value="suspended">Suspended</option>
          <option value="flagged">Flagged (3+ reports)</option>
        </select>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilter('all');
          }}
          className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reports</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              <AnimatePresence>
                {currentUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${getStatusColor(user)}`}
                    onClick={() => openUserDetails(user)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRandomGradient(user.id)} flex items-center justify-center text-white font-semibold`}>
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getInitials(user.name)
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {user.isSuspended && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                            <Ban className="w-3 h-3" /> Suspended
                          </span>
                        )}
                        {user.reportsCount >= 3 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Flagged
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <p>📝 Posts: {user.postsCount}</p>
                        <p>🎬 Reels: {user.reelsCount}</p>
                        <p>👥 Followers: {user.followersCount.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.reportsCount >= 3 
                          ? 'bg-red-100 text-red-700' 
                          : user.reportsCount > 0 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.reportsCount} reports
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.warningCount >= 3 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          ⚠️ Max warnings ({user.warningCount}/3)
                        </span>
                      ) : user.warningCount > 0 ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.warningCount >= 2 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.warningCount}/3 warnings
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">No warnings</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-green-500" />
                          {formatDate(user.lastActive)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {!user.isSuspended && (
                          <button
                            onClick={() => openActionModal(user, 'suspend')}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Suspend User"
                            disabled={isActionLoading}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        {user.isSuspended && (
                          <button
                            onClick={() => openActionModal(user, 'unsuspend')}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activate User"
                            disabled={isActionLoading}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {/* ✅ Warning button disabled after 3 warnings or if suspended */}
                        <button
                          onClick={() => openActionModal(user, 'warn')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isWarningDisabled(user)
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-yellow-600 hover:bg-yellow-50'
                          }`}
                          title={getWarningTooltip(user)}
                          disabled={isWarningDisabled(user) || isActionLoading}
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfFirstItem + itemsPerPage, totalUsers)} of {totalUsers} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowActionModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                {actionType === 'suspend' && 'Suspend User'}
                {actionType === 'unsuspend' && 'Activate User'}
                {actionType === 'warn' && 'Send Warning'}
              </h2>
              
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                <p className="text-xs text-gray-400">{selectedUser.email}</p>
              </div>
              
              {actionType === 'warn' && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Warning {selectedUser.warningCount + 1}/3
                    {selectedUser.warningCount + 1 === 3 && (
                      <span className="block font-semibold mt-1 text-red-600 dark:text-red-400">
                        Final warning! User will be automatically suspended after this.
                      </span>
                    )}
                  </p>
                </div>
              )}
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {actionType === 'suspend' && `This user will lose access to all features. They can be reactivated later.`}
                {actionType === 'unsuspend' && `This user will regain full access to the platform.`}
                {actionType === 'warn' && `The user will receive a warning email. ${selectedUser.warningCount + 1}/3 warnings.`}
              </p>
              
              {(actionType === 'suspend' || actionType === 'warn') && (
                <textarea
                  placeholder="Reason for this action (will be sent to the user)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  required
                />
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isActionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionType === 'suspend') handleSuspendUser(selectedUser.id);
                    if (actionType === 'unsuspend') handleUnsuspendUser(selectedUser.id);
                    if (actionType === 'warn') handleWarnUser(selectedUser.id);
                  }}
                  disabled={isActionLoading || (actionType === 'warn' && selectedUser.warningCount >= 3)}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                    actionType === 'suspend'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : actionType === 'warn'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isActionLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserDetailsModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowUserDetailsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-xl"></div>
                <div className="absolute -bottom-12 left-6">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${getRandomGradient(selectedUser.id)} flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-900`}>
                    {getInitials(selectedUser.name)}
                  </div>
                </div>
                <button
                  onClick={() => setShowUserDetailsModal(false)}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="pt-16 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                    <p className="text-gray-500">@{selectedUser.username}</p>
                    <p className="text-sm text-gray-400 mt-1">{selectedUser.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedUser.isSuspended && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.postsCount + selectedUser.reelsCount}</p>
                    <p className="text-xs text-gray-500">Total Content</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.followersCount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.followingCount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Following</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold">{selectedUser.likesReceived.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Likes Received</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Account Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Joined Date</p>
                      <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Active</p>
                      <p>{formatDate(selectedUser.lastActive)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Posts</p>
                      <p>{selectedUser.postsCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Reels</p>
                      <p>{selectedUser.reelsCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Comments Made</p>
                      <p>{selectedUser.commentsCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reports Against</p>
                      <p className={selectedUser.reportsCount >= 3 ? 'text-red-600 font-semibold' : ''}>
                        {selectedUser.reportsCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Warnings</p>
                      <p className={selectedUser.warningCount >= 3 ? 'text-red-600 font-semibold' : selectedUser.warningCount >= 2 ? 'text-orange-600 font-semibold' : ''}>
                        {selectedUser.warningCount}/3
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Account Status</p>
                      <p>{selectedUser.isSuspended ? 'Suspended' : 'Active'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;