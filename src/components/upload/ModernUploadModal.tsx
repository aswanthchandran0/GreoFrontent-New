// src/components/upload/ModernUploadModal.tsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  FaTimes, 
  FaImage, 
  FaVideo, 
  FaCloudUploadAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCrop,
  FaEdit,
  FaArrowLeft
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import UploadProgress from './UploadProgress';
import cloudinaryService, { UploadProgress as ProgressType } from '../../services/CloudinaryService';
import toast from 'react-hot-toast';
import ImageCropper from '../ui/ImageCropper';
import { createPostApi, createReelApi } from '../../services/user/api';

interface ModernUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (result: any) => void;
  uploadType?: 'image' | 'video' | 'multiple';
  title?: string;
  userId?: string;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'complete' | 'caption';

const ModernUploadModal: React.FC<ModernUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  uploadType = 'image',
  title = 'Create New Post',
  userId,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState<ProgressType | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isCaptionFocused, setIsCaptionFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Validate userId when modal opens
  useEffect(() => {
    if (isOpen && !userId) {
      toast.error('Please log in to create posts');
      onClose();
    }
  }, [isOpen, userId, onClose]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  const reset = () => {
    setSelectedFiles([]);
    setUploadState('idle');
    setProgress(null);
    setUploadResults([]);
    setError(null);
    setImageToCrop(null);
    setCroppedImage(null);
    setIsCropping(false);
    setCaption('');
    setIsCaptionFocused(false);
    setIsSubmitting(false);
    setIsValidating(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, []);

  // Validate video duration for reels - Changed minimum duration from 15 to 5 seconds
  const validateVideoDuration = (file: File): Promise<{ isValid: boolean; duration?: number; error?: string }> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('video/')) {
        resolve({ isValid: false, error: 'Not a video file' });
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const duration = video.duration;
        
        // Changed minimum duration from 15 to 5 seconds
        if (duration < 5) {
          resolve({ 
            isValid: false, 
            duration, 
            error: 'Video must be at least 5 seconds long' 
          });
        } else if (duration > 60) {
          resolve({ 
            isValid: false, 
            duration, 
            error: 'Video cannot exceed 60 seconds' 
          });
        } else {
          resolve({ isValid: true, duration });
        }
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve({ isValid: false, error: 'Failed to load video' });
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = async (files: File[]) => {
    console.log('handleFiles called with uploadType:', uploadType);
    console.log('Files:', files.map(f => ({ name: f.name, type: f.type })));
    
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Check file type based on uploadType
      if (uploadType === 'image') {
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 20 * 1024 * 1024) {
          errors.push(`${file.name} exceeds 20MB limit`);
          continue;
        }
        validFiles.push(file);
      } 
      else if (uploadType === 'video') {
        if (!file.type.startsWith('video/')) {
          errors.push(`${file.name} is not a video`);
          continue;
        }
        if (file.size > 100 * 1024 * 1024) {
          errors.push(`${file.name} exceeds 100MB limit`);
          continue;
        }
        
        // Validate video duration for reels
        setIsValidating(true);
        const validation = await validateVideoDuration(file);
        setIsValidating(false);
        
        if (!validation.isValid) {
          errors.push(`${file.name}: ${validation.error}`);
          continue;
        }
        
        validFiles.push(file);
      }
    }

    // Show errors
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      // Only show cropping for IMAGES when uploadType is image
      if (uploadType === 'image') {
        if (validFiles[0] && selectedFiles.length === 0) {
          const reader = new FileReader();
          reader.onload = () => {
            setImageToCrop(reader.result as string);
            setIsCropping(true);
          };
          reader.readAsDataURL(validFiles[0]);
        }
      } else {
        // For videos, just show success message
        toast.success(`Selected ${validFiles.length} video(s) for reel`);
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (selectedFiles.length === 1 && uploadType === 'image') {
      setCroppedImage(null);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setIsCropping(false);
    toast.success('Image cropped successfully!');
  };

  const handleCancelCrop = () => {
    setImageToCrop(null);
    setIsCropping(false);
    if (selectedFiles.length === 1 && uploadType === 'image') {
      setSelectedFiles([]);
    }
  };

  // Upload files to Cloudinary first
  const uploadToCloudinary = async () => {
    setUploadState('uploading');
    setUploadResults([]);
    setError(null);

    const results: any[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      setCurrentFileIndex(i);
      const file = selectedFiles[i];
      const isVideo = file.type.startsWith('video/');

      try {
        let fileToUpload = file;
        
        // Use cropped image for first image if available
        if (!isVideo && croppedImage && i === 0) {
          const response = await fetch(croppedImage);
          const blob = await response.blob();
          fileToUpload = new File([blob], file.name, { type: file.type });
        }

        const result = await cloudinaryService.uploadFile(
          fileToUpload,
          {
            folder: isVideo ? 'reels' : 'posts',
            tags: [isVideo ? 'reel' : 'post'],
          },
          (progressData) => {
            setProgress(progressData);
          },
          isVideo ? 'video' : 'image'
        );

        if (result.success && result.data) {
          results.push({
            type: isVideo ? 'video' : 'image',
            url: result.data.secure_url,
            thumbnailUrl: result.data.thumbnail_url,
            publicId: result.data.public_id,
            metadata: {
              width: result.data.width,
              height: result.data.height,
              duration: result.data.duration,
              size: result.data.bytes,
              format: result.data.format,
            }
          });
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error: any) {
        setError(`Failed to upload ${file.name}: ${error.message}`);
        setUploadState('idle');
        return null;
      }
    }

    setUploadResults(results);
    return results;
  };

  // Create content in backend
  const createContent = async (cloudinaryUrls: string[]) => {
    setIsSubmitting(true);
    try {
      if (!userId) {
        throw new Error('User ID is required. Please log in again.');
      }

      const isVideo = uploadType === 'video';
      
      if (isVideo) {
        // Create reel
        const reelData = {
          userId: userId,
          mediaUrl: cloudinaryUrls[0],
          thumbnail: uploadResults[0]?.thumbnailUrl || '',
          content: caption.trim() || '',
          metadata: uploadResults[0]?.metadata || {}
        };
        
        console.log('Creating reel with data:', reelData);
        const response = await createReelApi(reelData);
        
        if (response.data) {
          toast.success('Reel created successfully!');
          if (onUploadComplete) {
            onUploadComplete(response.data);
          }
          setUploadState('complete');
        }
      } else {
        // Create post
        const postData = {
          userId: userId,
          mediaUrls: cloudinaryUrls,
          content: caption.trim() || '',
        };
        
        console.log('Creating post with data:', postData);
        const response = await createPostApi(postData);
        
        if (response.data) {
          toast.success('Post created successfully!');
          if (onUploadComplete) {
            onUploadComplete(response.data);
          }
          setUploadState('complete');
        }
      }
    } catch (error: any) {
      console.error('Error creating content:', error);
      setError(error.response?.data?.message || error.message || `Failed to create ${uploadType === 'video' ? 'reel' : 'post'}`);
      setUploadState('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startUpload = async () => {
    if (!userId) {
      setError('Please log in to create posts');
      return;
    }
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    // For videos, limit to single file
    if (uploadType === 'video' && selectedFiles.length > 1) {
      setError('Only one video can be uploaded for a reel');
      return;
    }

    // Go to caption screen first
    setUploadState('caption');
    setTimeout(() => {
      captionTextareaRef.current?.focus();
    }, 100);
  };

  const handleCaptionSubmit = async () => {
    if (!userId) {
      setError('User not found. Please log in again.');
      return;
    }

    if (!selectedFiles.length) {
      setError('No files selected.');
      return;
    }

    setUploadState('processing');
    
    // Step 1: Upload to Cloudinary
    const uploadResultsData = await uploadToCloudinary();
    
    if (!uploadResultsData || uploadResultsData.length === 0) {
      setUploadState('caption');
      return;
    }
    
    // Step 2: Extract URLs from Cloudinary results
    const cloudinaryUrls = uploadResultsData.map(result => result.url);
    
    // Step 3: Create content in backend
    await createContent(cloudinaryUrls);
  };

  const handleFinish = () => {
    reset();
    onClose();
  };

  const handleClose = () => {
    if (uploadState === 'uploading' || isSubmitting) {
      if (confirm('Upload in progress. Are you sure you want to close?')) {
        reset();
        onClose();
      }
    } else {
      reset();
      onClose();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getAllowedTypes = () => {
    if (uploadType === 'image') {
      return 'image/jpeg,image/png,image/webp,image/gif';
    }
    if (uploadType === 'video') {
      return 'video/mp4,video/webm,video/quicktime,video/x-msvideo';
    }
    return 'image/*,video/*';
  };

  if (!isOpen) return null;

  // Image Cropping View - Only show for images
  if (isCropping && imageToCrop && uploadType === 'image') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Crop Image
            </h2>
            <button
              onClick={handleCancelCrop}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
            <ImageCropper
              image={imageToCrop}
              onCropDone={handleCropComplete}
              onCropCancel={handleCancelCrop}
              isAspectRatios={true}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              {uploadState === 'caption' && (
                <button
                  onClick={() => setUploadState('idle')}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {uploadState === 'caption' ? 'Add Caption' : title}
                </h2>
                {uploadState !== 'caption' && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {uploadType === 'image' ? 'Upload photos to share' : 
                     uploadType === 'video' ? 'Upload a video to share' : 
                     'Upload photos or videos to share'}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {uploadState === 'idle' ? (
              <div className="space-y-6">
                {/* File Selection Area */}
                <div
                  className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="p-4 mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl">
                      {uploadType === 'image' ? (
                        <FaImage className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                      ) : uploadType === 'video' ? (
                        <FaVideo className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <FaCloudUploadAlt className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {uploadType === 'image' ? 'Drop images here' :
                       uploadType === 'video' ? 'Drop video here' :
                       'Drag & drop files here'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {uploadType === 'image' ? 'PNG, JPG, GIF up to 20MB' :
                       uploadType === 'video' ? 'MP4, MOV, AVI up to 100MB, 5-60 seconds' :
                       'Images and videos up to 100MB'}
                    </p>
                    <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                      Browse {uploadType === 'image' ? 'Images' : 
                             uploadType === 'video' ? 'Videos' : 'Files'}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple={uploadType === 'image'}
                      accept={getAllowedTypes()}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Validation Loading */}
                {isValidating && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-gray-500">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Validating video...</span>
                    </div>
                  </div>
                )}

                {/* File Preview */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Selected ({selectedFiles.length})
                      </h4>
                      {uploadType === 'image' && selectedFiles[0] && !croppedImage && (
                        <button
                          onClick={() => {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setImageToCrop(reader.result as string);
                              setIsCropping(true);
                            };
                            reader.readAsDataURL(selectedFiles[0]);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90"
                        >
                          <FaCrop className="w-4 h-4" />
                          <span>Crop Image</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedFiles.map((file, index) => {
                        const isImage = file.type.startsWith('image/');
                        const previewUrl = isImage && index === 0 && croppedImage 
                          ? croppedImage 
                          : URL.createObjectURL(file);

                        return (
                          <div
                            key={`${file.name}-${index}`}
                            className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                          >
                            {isImage ? (
                              <img
                                src={previewUrl}
                                alt={file.name}
                                className="w-full h-32 object-cover"
                              />
                            ) : (
                              <div className="relative w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <FaVideo className="w-8 h-8 text-white" />
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                                  {Math.round(file.size / (1024 * 1024))}MB
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => removeFile(index)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                              >
                                <FaTimes className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={startUpload}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-all"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : uploadState === 'caption' ? (
              <div className="space-y-6">
                {/* Media Preview */}
                <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {selectedFiles[0]?.type.startsWith('image/') ? (
                    <img
                      src={croppedImage || URL.createObjectURL(selectedFiles[0])}
                      alt="Preview"
                      className="w-full max-h-64 object-contain"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(selectedFiles[0])}
                      className="w-full max-h-64 object-contain"
                      controls
                    />
                  )}
                  {selectedFiles.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      +{selectedFiles.length - 1} more
                    </div>
                  )}
                </div>

                {/* Caption Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FaEdit className="w-5 h-5 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Add a caption
                    </label>
                  </div>
                  <textarea
                    ref={captionTextareaRef}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onFocus={() => setIsCaptionFocused(true)}
                    onBlur={() => setIsCaptionFocused(false)}
                    placeholder="Write a caption..."
                    className={`w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all ${
                      isCaptionFocused
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-gray-300 dark:border-gray-700'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                    rows={4}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{caption.length} characters</span>
                    <span>2200 max</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setUploadState('idle')}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCaptionSubmit}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
                  >
                    Share Now
                  </button>
                </div>
              </div>
            ) : uploadState === 'uploading' ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Uploading to Cloudinary...
                </h3>
                {progress && (
                  <UploadProgress
                    progress={progress}
                    fileName={selectedFiles[currentFileIndex]?.name}
                    fileSize={selectedFiles[currentFileIndex]?.size}
                    status="uploading"
                  />
                )}
              </div>
            ) : uploadState === 'processing' ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">
                  Creating your {uploadType === 'video' ? 'reel' : 'post'}...
                </h3>
                <div className="flex justify-center py-8">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            ) : uploadState === 'complete' ? (
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {uploadType === 'video' ? 'Reel Created!' : 'Post Created!'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your {uploadType === 'video' ? 'reel' : 'post'} has been shared successfully
                  </p>
                  {caption && (
                    <p className="text-gray-500 mt-2 text-sm">
                      "{caption.substring(0, 50)}{caption.length > 50 ? '...' : ''}"
                    </p>
                  )}
                </div>
                <button
                  onClick={handleFinish}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
                >
                  Done
                </button>
              </div>
            ) : null}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <FaTimesCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ModernUploadModal;