// src/pages/admin/AdminDashboard.tsx

import { motion } from "framer-motion";
import { Users, UserCheck, AlertTriangle, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import StatsCard from "../../components/admin/StatsCard";
import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/admin/adminApi";
import { useNavigate } from "react-router-dom";

interface DashboardData {
  stats: {
    totalUsers: string;
    activeToday: number;
    pendingReports: number;
    totalPosts: string;
    changes: {
      users: string;
      activeToday: string;
      pendingReports: string;
      posts: string;
    };
  };
  charts: {
    userGrowth: Array<{ month: string; users: number }>;
    contentDistribution: Array<{ name: string; value: number; color: string }>;
  };
  recentReports: Array<{
    id: string;
    content: string;
    reporter: string;
    reason: string;
    time: string;
  }>;
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      
      if (response.data.success) {
        setDashboardData(response.data.data);
        console.log("dashboard data", response.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleViewAllReports = () => {
    navigate('/admin/reports');
  };

  const handleReviewReports = () => {
    navigate('/admin/reports?status=pending');
  };

  const handleReviewUsers = () => {
    navigate('/admin/users?filter=flagged');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  // ✅ Fix: Type assertion for color to match StatsCardProps
  const stats: {
    title: string;
    value: string;
    change: string;
    icon: any;
    color: "purple" | "green" | "red" | "blue";
  }[] = [
    { title: "Total Users", value: dashboardData.stats.totalUsers, change: dashboardData.stats.changes.users, icon: Users, color: "purple" },
    { title: "Active Today", value: dashboardData.stats.activeToday.toString(), change: dashboardData.stats.changes.activeToday, icon: UserCheck, color: "green" },
    { title: "Pending Reports", value: dashboardData.stats.pendingReports.toString(), change: dashboardData.stats.changes.pendingReports, icon: AlertTriangle, color: "red" },
    { title: "Total Posts", value: dashboardData.stats.totalPosts, change: dashboardData.stats.changes.posts, icon: FileText, color: "blue" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, Admin! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your platform today.
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-lg font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.charts.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Content Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <h3 className="text-lg font-semibold mb-4">Content Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.charts.contentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.charts.contentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Reports & Priority Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold">Recent Reports</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
            {dashboardData.recentReports.map((report) => (
              <div key={report.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{report.content}</p>
                    <p className="text-sm text-gray-500 mt-1">Reported by {report.reporter}</p>
                    <p className="text-xs text-gray-400 mt-1">Reason: {report.reason}</p>
                  </div>
                  <span className="text-xs text-gray-400">{report.time}</span>
                </div>
              </div>
            ))}
            {dashboardData.recentReports.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No pending reports. Good job! 🎉
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={handleViewAllReports}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View all reports →
            </button>
          </div>
        </motion.div>

        {/* Priority Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-red-600">⚠️ Priority Actions Needed</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <p className="font-medium text-red-900 dark:text-red-300">
                  {dashboardData.stats.pendingReports} pending reports
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">Need review and action</p>
              </div>
              <button 
                onClick={handleReviewReports}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Review Now
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-300">Review flagged users</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">Check suspicious activity</p>
              </div>
              <button 
                onClick={handleReviewUsers}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                Review Users
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;