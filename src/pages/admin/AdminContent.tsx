// src/pages/admin/AdminContent.tsx

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid3x3,
  List,
  Eye,
  Ban,
  Trash2,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Image,
  Video,
  MessageCircle,
  ThumbsUp,
  Flag,
  Clock,
  Filter,
  XCircle,
  Loader2
} from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';
import {
  getAdminPosts,
  getAdminReels,
  getAdminComments,
  blockPost,
  unblockPost,
  deletePost,
  blockReel,
  deleteComment,
} from '../../services/admin/adminApi';
import { AdminComment, AdminPost, AdminReel } from '../../Types/admin/contentTypes';

type ContentType = 'posts' | 'reels' | 'comments';
type FilterStatus = 'all' | 'blocked' | 'active' | 'reported';
type SortBy = 'newest' | 'oldest' | 'most_reported' | 'most_liked';

interface ApiResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
  };
}

const AdminContent = () => {
  // State
  const [activeTab, setActiveTab] = useState<ContentType>('posts');
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [reels, setReels] = useState<AdminReel[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'block' | 'unblock' | 'delete'>('block');
  const [actionReason, setActionReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const itemsPerPage = 12;

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch data based on active tab
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'posts') {
        const response = await getAdminPosts({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm,
          filterBy: filterStatus,
          sortBy
        });
        if (response.data.success) {
          setPosts(response.data.data.posts);
          setTotalItems(response.data.data.total);
          setTotalPages(response.data.data.totalPages);
        }
      } else if (activeTab === 'reels') {
        const response = await getAdminReels({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm,
          filterBy: filterStatus,
          sortBy
        });
        if (response.data.success) {
          setReels(response.data.data.items);
          setTotalItems(response.data.data.total);
          setTotalPages(response.data.data.totalPages);
        }
      } else if (activeTab === 'comments') {
        const response = await getAdminComments({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm,
          filterBy: filterStatus === 'reported' ? 'reported' : 'all'
        });
        if (response.data.success) {
          setComments(response.data.data.items);
          setTotalItems(response.data.data.total);
          setTotalPages(response.data.data.totalPages);
        }
      }
    } catch (error: any) {
      console.error('Error fetching content:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, debouncedSearchTerm, filterStatus, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, sortBy, activeTab]);

  // Handlers
  const handleBlock = async (id: string) => {
    setIsActionLoading(true);
    try {
      if (activeTab === 'posts') {
        await blockPost(id, actionReason);
        toast.success('Post blocked successfully');
      } else if (activeTab === 'reels') {
        await blockReel(id, actionReason);
        toast.success('Reel blocked successfully');
      }
      await fetchData();
      setShowActionModal(false);
      setActionReason('');
    } catch (error: any) {
      console.error('Error blocking content:', error);
      toast.error(error.response?.data?.error || 'Failed to block content');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnblock = async (id: string) => {
    setIsActionLoading(true);
    try {
      await unblockPost(id);
      toast.success('Content unblocked successfully');
      await fetchData();
      setShowActionModal(false);
    } catch (error: any) {
      console.error('Error unblocking content:', error);
      toast.error(error.response?.data?.error || 'Failed to unblock content');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsActionLoading(true);
    try {
      if (activeTab === 'posts') {
        await deletePost(id, actionReason);
        toast.success('Post deleted permanently');
      } else if (activeTab === 'comments') {
        const comment = comments.find(c => c.id === id);
        if (comment) {
          await deleteComment(id, comment.targetId, comment.targetType, actionReason);
          toast.success('Comment deleted permanently');
        }
      }
      await fetchData();
      setShowActionModal(false);
      setActionReason('');
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toast.error(error.response?.data?.error || 'Failed to delete content');
    } finally {
      setIsActionLoading(false);
    }
  };

  const getReportSeverity = (count: number) => {
    if (count >= 5) return { level: 'severe', color: 'red', text: 'Severe' };
    if (count >= 3) return { level: 'high', color: 'orange', text: 'High' };
    if (count >= 1) return { level: 'medium', color: 'yellow', text: 'Medium' };
    return { level: 'none', color: 'green', text: 'None' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderPostCard = (post: AdminPost) => {
    const severity = getReportSeverity(post.reports.count);
    
    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className={`bg-white dark:bg-gray-900 rounded-xl border overflow-hidden transition-all ${
          post.isBlocked 
            ? 'border-red-200 dark:border-red-800 bg-red-50/10' 
            : post.reports.count > 0 
            ? 'border-yellow-200 dark:border-yellow-800' 
            : 'border-gray-200 dark:border-gray-800'
        }`}
      >
        {/* Media Preview */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
            <img 
              src={post.mediaUrls[0]} 
              alt="Post preview"
              className="w-full h-full object-cover"
            />
            {post.mediaUrls.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                +{post.mediaUrls.length - 1}
              </div>
            )}
            {post.isBlocked && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Blocked
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          {/* Author Info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
              {post.author.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {post.author.name}
              </p>
              <p className="text-xs text-gray-500">@{post.author.username}</p>
            </div>
            {post.author.isSuspended && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                Suspended
              </span>
            )}
          </div>

          {/* Content */}
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
            {post.content}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" /> {post.stats.likes.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> {post.stats.comments.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDate(post.createdAt)}
            </span>
          </div>

          {/* Report Badge */}
          {post.reports.count > 0 && (
            <div className={`mb-3 p-2 rounded-lg text-xs ${
              severity.level === 'severe' 
                ? 'bg-red-100 dark:bg-red-900/20 text-red-700'
                : severity.level === 'high'
                ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700'
                : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Flag className="w-3 h-3" />
                  {post.reports.count} report{post.reports.count !== 1 ? 's' : ''}
                </span>
                <span className="font-medium">{severity.text}</span>
              </div>
              {post.reports.reasons.length > 0 && (
                <div className="mt-1 text-xs opacity-75">
                  Reasons: {post.reports.reasons.slice(0, 2).join(', ')}
                  {post.reports.reasons.length > 2 && ` +${post.reports.reasons.length - 2}`}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => {
                setSelectedContent(post);
                setShowDetailsModal(true);
              }}
              className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Eye className="w-4 h-4" /> View
            </button>
            {!post.isBlocked ? (
              <button
                onClick={() => {
                  setSelectedContent(post);
                  setActionType('block');
                  setShowActionModal(true);
                }}
                className="flex-1 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Ban className="w-4 h-4" /> Block
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedContent(post);
                  setActionType('unblock');
                  setShowActionModal(true);
                }}
                className="flex-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-4 h-4" /> Unblock
              </button>
            )}
            <button
              onClick={() => {
                setSelectedContent(post);
                setActionType('delete');
                setShowActionModal(true);
              }}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderReelCard = (reel: AdminReel) => {
    const severity = getReportSeverity(reel.reports.count);
    
    return (
      <motion.div
        key={reel.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className={`bg-white dark:bg-gray-900 rounded-xl border overflow-hidden transition-all ${
          reel.isBlocked 
            ? 'border-red-200 dark:border-red-800 bg-red-50/10' 
            : reel.reports.count > 0 
            ? 'border-yellow-200 dark:border-yellow-800' 
            : 'border-gray-200 dark:border-gray-800'
        }`}
      >
        <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800">
          <img 
            src={reel.thumbnail} 
            alt="Reel thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {reel.duration}s
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            📹 Reel
          </div>
          {reel.isBlocked && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Blocked
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
              {reel.author.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{reel.author.name}</p>
              <p className="text-xs text-gray-500">@{reel.author.username}</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
            {reel.caption}
          </p>

          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
            <span>👁️ {reel.stats.views.toLocaleString()}</span>
            <span>❤️ {reel.stats.likes.toLocaleString()}</span>
            <span>💬 {reel.stats.comments.toLocaleString()}</span>
          </div>

          {reel.reports.count > 0 && (
            <div className={`mb-3 p-2 rounded-lg text-xs ${
              severity.level === 'severe' ? 'bg-red-100 text-red-700' :
              severity.level === 'high' ? 'bg-orange-100 text-orange-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              <span className="flex items-center gap-1">
                <Flag className="w-3 h-3" /> {reel.reports.count} reports
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                setSelectedContent(reel);
                setShowDetailsModal(true);
              }}
              className="flex-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1"
            >
              <Eye className="w-4 h-4" /> View
            </button>
            {!reel.isBlocked ? (
              <button
                onClick={() => {
                  setSelectedContent(reel);
                  setActionType('block');
                  setShowActionModal(true);
                }}
                className="flex-1 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg flex items-center justify-center gap-1"
              >
                <Ban className="w-4 h-4" /> Block
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedContent(reel);
                  setActionType('unblock');
                  setShowActionModal(true);
                }}
                className="flex-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-4 h-4" /> Unblock
              </button>
            )}
            <button
              onClick={() => {
                setSelectedContent(reel);
                setActionType('delete');
                setShowActionModal(true);
              }}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCommentCard = (comment: AdminComment) => {
    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium flex-shrink-0">
            {comment.author.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {comment.author.name}
              </p>
              <p className="text-xs text-gray-500">@{comment.author.username}</p>
              <span className="text-xs text-gray-400">• {formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>
            
            <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              On: {comment.targetPreview}
            </div>

            {comment.reports.count > 0 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs mb-3">
                <Flag className="w-3 h-3" /> {comment.reports.count} reports
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedContent(comment);
                  setActionType('delete');
                  setShowActionModal(true);
                }}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete Comment
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const currentItems = activeTab === 'posts' ? posts : activeTab === 'reels' ? reels : comments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Content Moderation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and moderate user-generated content across the platform
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Posts</p>
              <p className="text-2xl font-bold">{posts.length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reels</p>
              <p className="text-2xl font-bold">{reels.length}</p>
            </div>
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-pink-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Blocked Content</p>
              <p className="text-2xl font-bold text-red-600">
                {posts.filter(p => p.isBlocked).length + reels.filter(r => r.isBlocked).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Reports</p>
              <p className="text-2xl font-bold text-yellow-600">
                {posts.filter(p => p.reports.count > 0).length + reels.filter(r => r.reports.count > 0).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Flag className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-6">
          {[
            { key: 'posts', label: 'Posts', icon: Image, count: posts.length },
            { key: 'reels', label: 'Reels', icon: Video, count: reels.length },
            { key: 'comments', label: 'Comments', icon: MessageCircle, count: comments.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as ContentType);
                setCurrentPage(1);
              }}
              className={`px-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </div>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by content or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Content</option>
          <option value="active">Active Only</option>
          <option value="blocked">Blocked Only</option>
          <option value="reported">Has Reports</option>
        </select>
        {activeTab !== 'comments' && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_reported">Most Reported</option>
            <option value="most_liked">Most Liked</option>
          </select>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
            <p className="mt-4 text-gray-500">Loading content...</p>
          </div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Filter className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No content found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filters to find content
          </p>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {currentItems.map((item: any) => (
              activeTab === 'posts' ? renderPostCard(item) :
              activeTab === 'reels' ? renderReelCard(item) :
              renderCommentCard(item)
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Content Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(selectedContent, null, 2)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Modal */}
      <AnimatePresence>
        {showActionModal && selectedContent && (
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
                {actionType === 'block' && 'Block Content'}
                {actionType === 'unblock' && 'Unblock Content'}
                {actionType === 'delete' && 'Delete Content'}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {actionType === 'block' && 'Are you sure you want to block this content? It will be hidden from all users.'}
                {actionType === 'unblock' && 'Are you sure you want to unblock this content? It will become visible to users again.'}
                {actionType === 'delete' && 'Are you sure you want to delete this content? This action cannot be undone.'}
              </p>
              
              {(actionType === 'block' || actionType === 'delete') && (
                <textarea
                  placeholder="Reason for this action (optional)"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionType === 'block') handleBlock(selectedContent.id);
                    if (actionType === 'unblock') handleUnblock(selectedContent.id);
                    if (actionType === 'delete') handleDelete(selectedContent.id);
                  }}
                  disabled={isActionLoading}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                    actionType === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : actionType === 'block'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminContent;