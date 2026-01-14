// src/components/userComponents/Chat/SharedItemPreview.tsx
import React from 'react';
import { FaPlay, FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { SharedItem } from '../../../Types/messageTypes';

interface SharedItemPreviewProps {
  item: SharedItem;
  compact?: boolean;
  onClick?: () => void;
}

const SharedItemPreview: React.FC<SharedItemPreviewProps> = ({ 
  item, 
  compact = false,
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to the item
      if (item.itemType === 'post') {
        navigate(`/p/${item.itemId}`);
      } else if (item.itemType === 'reel') {
        // You might want to open reel in a modal
        navigate(`/roll?reel=${item.itemId}`);
      }
    }
  };

  if (compact) {
    return (
      <div 
        onClick={handleClick}
        className="relative cursor-pointer group rounded-lg overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-3 hover:shadow-lg transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            {item.thumbnail ? (
              <img 
                src={item.thumbnail} 
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : item.itemType === 'reel' ? (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-600 to-pink-600">
                <FaPlay className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600">
                <FaImage className="w-6 h-6 text-white" />
              </div>
            )}
            {item.itemType === 'reel' && (
              <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1">
                <FaPlay className="w-2 h-2 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.itemType === 'reel' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                {item.itemType === 'reel' ? 'Reel' : 'Post'}
              </span>
            </div>
            {item.contentPreview && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {item.contentPreview}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="relative cursor-pointer group rounded-xl overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 border border-purple-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Preview Image/Video */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
        {item.thumbnail ? (
          <img 
            src={item.thumbnail} 
            alt="Preview"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-500 to-pink-500">
            {item.itemType === 'reel' ? (
              <div className="text-center">
                <FaPlay className="w-16 h-16 text-white/80 mx-auto mb-4" />
                <span className="text-white/90 font-medium">Click to view reel</span>
              </div>
            ) : (
              <div className="text-center">
                <FaImage className="w-16 h-16 text-white/80 mx-auto mb-4" />
                <span className="text-white/90 font-medium">Click to view post</span>
              </div>
            )}
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.itemType === 'reel' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
            {item.itemType === 'reel' ? 'REEL' : 'POST'}
          </span>
        </div>
        
        {/* Play button for reels */}
        {item.itemType === 'reel' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600/90 to-pink-600/90 rounded-full flex items-center justify-center backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
              <FaPlay className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {item.contentPreview && (
          <p className="text-gray-800 dark:text-gray-200 line-clamp-3 mb-3">
            {item.contentPreview}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Shared {item.itemType === 'reel' ? 'reel' : 'post'}
          </span>
          <button className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity">
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedItemPreview;