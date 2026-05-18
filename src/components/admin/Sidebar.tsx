// src/components/admin/Sidebar.tsx
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  History,
  Settings,
  Megaphone,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile?: boolean;
}

const Sidebar = ({ isOpen, setIsOpen, isMobile = false }: SidebarProps) => {
  const menuItems = [
    { path: "/admin/dashboard", name: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", name: "Users", icon: Users },
    { path: "/admin/content", name: "Content", icon: FileText },
    { path: "/admin/reports", name: "Reports", icon: AlertTriangle },
    { path: "/admin/activity", name: "Activity Log", icon: History },
    { path: "/admin/settings", name: "Settings", icon: Settings },
    { path: "/admin/announce", name: "Announcements", icon: Megaphone },
    { path: "/admin/profile", name: "My Profile", icon: UserCircle },
  ];

  return (
    <div className={`h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col ${isMobile ? 'w-64' : ''}`}>
      {/* Logo Section */}
      <div className={`p-6 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} border-b border-gray-200 dark:border-gray-800`}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-60"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </motion.div>
        )}
        {!isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`
            }
          >
            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${!isOpen && 'mx-auto'}`} />
            {isOpen && (
              <span className="text-sm font-medium">{item.name}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => {/* Handle logout */}}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${
            !isOpen && 'justify-center'
          }`}
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;