// src/components/reel/ReelMenu.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTrash,
  FaEdit,
  FaCopy,
  FaLink,
  FaFlag,
  FaEyeSlash,
  FaVolumeMute,
  FaBan,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { IReel } from '../../../Types/reelTypes';

interface ReelMenuProps {
  reel: IReel;
  isOwner: boolean;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const ReelMenu: React.FC<ReelMenuProps> = ({
  reel,
  isOwner,
  onClose,
  onDelete,
  onEdit
}) => {
  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/reel/${reel.id}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
      onClose();
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const menuItems = [
    ...(isOwner ? [
      {
        icon: <FaEdit className="w-4 h-4" />,
        label: 'Edit Reel',
        onClick: onEdit,
        color: 'text-blue-600'
      },
      {
        icon: <FaTrash className="w-4 h-4" />,
        label: 'Delete Reel',
        onClick: onDelete,
        color: 'text-red-600'
      }
    ] : []),
    {
      icon: <FaLink className="w-4 h-4" />,
      label: 'Copy Link',
      onClick: handleCopyLink,
      color: 'text-gray-700 dark:text-gray-300'
    },
    ...(!isOwner ? [
      {
        icon: <FaEyeSlash className="w-4 h-4" />,
        label: 'Hide Reel',
        onClick: () => {
          toast.success('Reel hidden from your feed');
          onClose();
        },
        color: 'text-gray-700 dark:text-gray-300'
      },
      {
        icon: <FaVolumeMute className="w-4 h-4" />,
        label: 'Mute User',
        onClick: () => {
          toast.success('User muted');
          onClose();
        },
        color: 'text-gray-700 dark:text-gray-300'
      },
      {
        icon: <FaBan className="w-4 h-4" />,
        label: 'Block User',
        onClick: () => {
          toast.success('User blocked');
          onClose();
        },
        color: 'text-gray-700 dark:text-gray-300'
      },
      {
        icon: <FaFlag className="w-4 h-4" />,
        label: 'Report Reel',
        onClick: () => {
          toast.success('Reel reported');
          onClose();
        },
        color: 'text-red-600'
      }
    ] : [])
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm mx-4 overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Reel Options
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="flex items-center w-full gap-3 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className={item.color}>{item.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Cancel Button */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={onClose}
              className="w-full py-3 font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReelMenu;