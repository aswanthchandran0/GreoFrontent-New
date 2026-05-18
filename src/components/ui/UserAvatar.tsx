// src/components/ui/UserAvatar.tsx - Update the component
import React from 'react';

interface UserAvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean; // Make this optional
  isOnline?: boolean;
  className?: string;
  borderColor?: string; // Optional border color
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt,
  size = 'md',
  showStatus = false, // Default to false
  isOnline = false,
  className = '',
  borderColor = 'border-white dark:border-gray-800' // Default border color
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&color=fff&size=128`;

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 ${borderColor} shadow-sm`}>
        <img
          src={src || defaultAvatar}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = defaultAvatar;
          }}
        />
      </div>
      
      {showStatus && (
        <div className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} rounded-full border-2 ${borderColor} ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      )}
    </div>
  );
};

export default UserAvatar;