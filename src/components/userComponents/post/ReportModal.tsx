// src/components/post/ReportModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaFlag, 
  FaHeartBroken, 
  FaUserFriends, 
  FaExclamationTriangle,
  FaEye,
  FaMoneyBillWave,
  FaNewspaper,
  FaCommentDots,
  FaCheckCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { reportContentApi } from '../../../services/user/api';

interface ReportModalProps {
  postId: string;
  postType?: 'POST' | 'REEL';
  onClose: () => void;
  onReportComplete?: () => void;
}

interface ReportOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const reportOptions: ReportOption[] = [
  {
    id: 'dislike',
    label: 'I don\'t like this',
    icon: <FaHeartBroken className="w-5 h-5" />,
    description: 'Content that doesn\'t interest you',
    color: 'text-gray-600'
  },
  {
    id: 'bullying',
    label: 'Bullying or harassment',
    icon: <FaUserFriends className="w-5 h-5" />,
    description: 'Targeting someone with harmful behavior',
    color: 'text-red-500'
  },
  {
    id: 'violence',
    label: 'Violent content',
    icon: <FaExclamationTriangle className="w-5 h-5" />,
    description: 'Graphic violence or threats',
    color: 'text-red-600'
  },
  {
    id: 'nudity',
    label: 'Nudity or sexual content',
    icon: <FaEye className="w-5 h-5" />,
    description: 'Inappropriate sexual content',
    color: 'text-pink-500'
  },
  {
    id: 'fraud',
    label: 'Scam or fraud',
    icon: <FaMoneyBillWave className="w-5 h-5" />,
    description: 'Misleading or fraudulent content',
    color: 'text-yellow-600'
  },
  {
    id: 'false_info',
    label: 'False information',
    icon: <FaNewspaper className="w-5 h-5" />,
    description: 'Misleading or fake news',
    color: 'text-orange-500'
  },
  {
    id: 'spam',
    label: 'Spam',
    icon: <FaCommentDots className="w-5 h-5" />,
    description: 'Repetitive or unwanted content',
    color: 'text-gray-500'
  },
  {
    id: 'hate_speech',
    label: 'Hate speech',
    icon: <FaFlag className="w-5 h-5" />,
    description: 'Attacks based on identity or beliefs',
    color: 'text-red-600'
  }
];

const ReportModal: React.FC<ReportModalProps> = ({ 
  postId, 
  postType = 'POST', 
  onClose, 
  onReportComplete 
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    setSelectedReason(null);
    setDescription('');
    setIsSubmitting(false);
    setIsSubmitted(false);
  }, []);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportContentApi(postId, postType, selectedReason, description);
      setIsSubmitted(true);
      
      // Wait 2 seconds to show success message, then close
      setTimeout(() => {
        onReportComplete?.();
        onClose();
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit report');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 w-full max-w-md text-center"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <FaCheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Report Submitted
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Thank you for helping keep our community safe. We'll review your report.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FaFlag className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Report {postType === 'POST' ? 'Post' : 'Reel'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Why are you reporting this {postType.toLowerCase()}? Your feedback helps us improve.
          </p>

          {/* Report Options */}
          <div className="space-y-2">
            {reportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => !isSubmitting && setSelectedReason(option.id)}
                disabled={isSubmitting}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                  selectedReason === option.id
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`mt-0.5 ${option.color}`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    selectedReason === option.id
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
                {selectedReason === option.id && (
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Additional Details */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => !isSubmitting && setDescription(e.target.value)}
              disabled={isSubmitting}
              placeholder="Tell us more about why you're reporting this..."
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none resize-none ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {description.length}/500
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`flex-1 px-4 py-3 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="flex-1 px-4 py-3 font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReportModal;