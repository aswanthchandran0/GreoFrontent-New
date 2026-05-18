// src/components/upload/UploadProgress.tsx
import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaCloudUploadAlt } from 'react-icons/fa';
import { UploadProgress as ProgressType } from '../../services/CloudinaryService';

interface UploadProgressProps {
  progress: ProgressType;
  fileName: string;
  fileSize: number;
  status: 'uploading' | 'success' | 'error' | 'processing';
  error?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  fileName,
  fileSize,
  status,
  error,
  onRetry,
  onCancel,
}) => {
  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
            status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
            'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            {status === 'success' ? (
              <FaCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : status === 'error' ? (
              <FaTimesCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            ) : (
              <FaCloudUploadAlt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {fileName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(fileSize)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {status === 'uploading' && onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
          {status === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {status === 'uploading' && (
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>{progress.percent}%</span>
            <span>{formatSpeed(progress.speed)}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>
              {formatFileSize(progress.loaded)} of {formatFileSize(progress.total)}
            </span>
            <span>
              {progress.estimatedTime > 0 && (
                <>ETA: {formatTime(progress.estimatedTime)}</>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status === 'processing' && (
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Processing...</span>
        </div>
      )}

      {status === 'success' && (
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <FaCheckCircle className="w-4 h-4" />
          <span className="text-sm">Upload completed successfully</span>
        </div>
      )}

      {status === 'error' && error && (
        <div className="flex items-start space-x-2 text-red-600 dark:text-red-400">
          <FaTimesCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm flex-1">{error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;