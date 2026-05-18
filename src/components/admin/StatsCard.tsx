// src/components/admin/StatsCard.tsx
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: "purple" | "green" | "red" | "blue";
}

const colorClasses = {
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
  green: "bg-green-100 dark:bg-green-900/30 text-green-600",
  red: "bg-red-100 dark:bg-red-900/30 text-red-600",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
};

const StatsCard = ({ title, value, change, icon: Icon, color }: StatsCardProps) => {
  const isPositive = change.startsWith("+");
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
        <span className="text-xs text-gray-500">from last week</span>
      </div>
    </motion.div>
  );
};

export default StatsCard;