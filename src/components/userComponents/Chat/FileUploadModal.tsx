// src/components/userComponents/Chat/FileUploadModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  FaTimes,
  FaImage,
  FaVideo,
  FaFileAlt,
  FaUpload,
  FaTrash,
  FaPlay,
  FaPause,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileArchive,
  FaFile,
  FaSpinner,
  FaCloudUploadAlt,
  FaCheck
} from 'react-icons/fa';
import { RiGalleryUploadLine } from 'react-icons/ri';
import chatUploadService from '../../../services/ChatUploadService';
import { ChatAttachment } from '../../../Types/messageTypes'; // Import from messageTypes
import toast from 'react-hot-toast';

interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video' | 'document' | 'audio';
  name: string;
  size: number;
  duration?: number;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'failed';
  attachment?: ChatAttachment;
  metadata?: {
    width?: number;
    height?: number;
  };
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelect: (attachments: ChatAttachment[]) => void;
  messageType: 'image' | 'video' | 'document';
  chatId: string;
  userId: string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onFilesSelect,
  messageType,
  chatId,
  userId
}) => {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // File type configurations
  const fileTypeConfig = {
    image: {
      title: 'Upload Images',
      icon: <FaImage className="w-8 h-8 text-pink-500" />,
      accept: 'image/*',
      description: 'Upload JPG, PNG, GIF, WEBP up to 20MB',
      maxFiles: 10,
      maxSize: 20 * 1024 * 1024 // 20MB
    },
    video: {
      title: 'Upload Videos',
      icon: <FaVideo className="w-8 h-8 text-purple-500" />,
      accept: 'video/*',
      description: 'Upload MP4, MOV, AVI up to 100MB',
      maxFiles: 5,
      maxSize: 100 * 1024 * 1024 // 100MB
    },
    document: {
      title: 'Upload Documents',
      icon: <FaFileAlt className="w-8 h-8 text-blue-500" />,
      accept: '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z',
      description: 'Upload PDF, DOC, TXT, ZIP up to 10MB',
      maxFiles: 5,
      maxSize: 10 * 1024 * 1024 // 10MB
    }
  };

  const config = fileTypeConfig[messageType];

  const getFileIcon = (fileName: string, mimeType?: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    // Check mimeType first
    if (mimeType) {
      if (mimeType.startsWith('image/')) return <FaImage className="w-6 h-6 text-pink-500" />;
      if (mimeType.startsWith('video/')) return <FaVideo className="w-6 h-6 text-purple-500" />;
      if (mimeType.startsWith('audio/')) return <FaFile className="w-6 h-6 text-purple-500" />;
      if (mimeType === 'application/pdf') return <FaFilePdf className="w-6 h-6 text-red-500" />;
      if (mimeType.includes('word') || mimeType.includes('document')) return <FaFileWord className="w-6 h-6 text-blue-600" />;
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FaFileExcel className="w-6 h-6 text-green-600" />;
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return <FaFilePowerpoint className="w-6 h-6 text-orange-500" />;
      if (mimeType.includes('zip') || mimeType.includes('compressed')) return <FaFileArchive className="w-6 h-6 text-yellow-600" />;
    }
    
    // Fallback to file extension
    switch (ext) {
      case 'pdf':
        return <FaFilePdf className="w-6 h-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="w-6 h-6 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="w-6 h-6 text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="w-6 h-6 text-orange-500" />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return <FaFileArchive className="w-6 h-6 text-yellow-600" />;
      case 'txt':
      case 'rtf':
        return <FaFileAlt className="w-6 h-6 text-gray-500" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'm4a':
        return <FaFile className="w-6 h-6 text-purple-500" />;
      default:
        return <FaFile className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FilePreview[] = [];
    const existingCount = files.length;
    const maxFiles = config.maxFiles;

    const filesArray = Array.from(selectedFiles).slice(0, maxFiles - existingCount);
    
    for (const file of filesArray) {
      // Check file size
      if (file.size > config.maxSize) {
        toast.error(`File ${file.name} exceeds maximum size of ${formatFileSize(config.maxSize)}`);
        continue;
      }

      // Validate file type
      const validation = chatUploadService.validateFile(file);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid file type');
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const id = Date.now() + Math.random().toString(36).substr(2, 9);
      
      // Extract metadata for images/videos
      let metadata = {};
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        try {
          metadata = await chatUploadService.extractFileMetadata(file);
        } catch (error) {
          console.error('Failed to extract metadata:', error);
        }
      }

      newFiles.push({
        id,
        file,
        previewUrl,
        type: validation.type || 'document',
        name: file.name,
        size: file.size,
        duration: 'duration' in metadata ? (metadata as any).duration : undefined,
        metadata: metadata,
        uploadProgress: 0,
        uploadStatus: 'pending'
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      toast.success(`Added ${newFiles.length} file(s)`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropAreaRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    try {
      setIsUploading(true);
      setUploadedCount(0);
      
      // Filter only pending files
      const pendingFiles = files.filter(f => f.uploadStatus !== 'completed');
      
      if (pendingFiles.length === 0) {
        // All files already uploaded, just pass them
        const completedAttachments = files
          .filter(f => f.uploadStatus === 'completed' && f.attachment)
          .map(f => f.attachment!);
        
        if (completedAttachments.length > 0) {
          onFilesSelect(completedAttachments);
          onClose();
        }
        return;
      }

      // Update status to uploading
      setFiles(prev => prev.map(f => ({
        ...f,
        uploadStatus: pendingFiles.some(pf => pf.id === f.id) ? 'uploading' : f.uploadStatus
      })));

      // Upload to Cloudinary
      const attachments: ChatAttachment[] = await chatUploadService.uploadChatFiles(
        pendingFiles.map(f => f.file),
        chatId,
        userId,
        (progressEvent) => {
          // Update progress for specific file
          setFiles(prev => prev.map((f, index) => 
            index === progressEvent.fileIndex 
              ? { ...f, uploadProgress: progressEvent.percent }
              : f
          ));
        }
      );

      // Update files with Cloudinary URLs and mimeType
      setFiles(prev => {
        const updated = [...prev];
        let attachmentIndex = 0;
        
        return updated.map(f => {
          if (f.uploadStatus === 'uploading' && attachments[attachmentIndex]) {
            const attachment = attachments[attachmentIndex];
            const updatedFile = {
              ...f,
              uploadProgress: 100,
              uploadStatus: 'completed' as const,
              attachment: attachment
            };
            attachmentIndex++;
            return updatedFile;
          }
          return f;
        });
      });

      setUploadedCount(attachments.length);
      
      // Pass Cloudinary attachments directly to parent
      onFilesSelect(attachments);
      
      toast.success(`Uploaded ${attachments.length} file(s) to Cloudinary`);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error.message || 'Please try again'}`);
      
      // Mark files as failed
      setFiles(prev => prev.map(f => ({
        ...f,
        uploadStatus: f.uploadStatus === 'uploading' ? 'failed' : f.uploadStatus
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const toggleVideoPlay = (id: string) => {
    setPlayingVideo(playingVideo === id ? null : id);
  };

  // Get file type display name
  const getFileTypeDisplay = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType === 'application/pdf') return 'PDF Document';
    if (mimeType.includes('word')) return 'Word Document';
    if (mimeType.includes('excel')) return 'Excel Spreadsheet';
    if (mimeType.includes('powerpoint')) return 'PowerPoint Presentation';
    if (mimeType.includes('zip')) return 'Compressed Archive';
    if (mimeType === 'text/plain') return 'Text File';
    return 'Document';
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      files.forEach(file => {
        URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, [files]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFiles([]);
        setIsUploading(false);
        setUploadedCount(0);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              {config.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {config.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {config.description}
              </p>
             
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={isUploading}
          >
            <FaTimes className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Drop Area */}
          <div
            ref={dropAreaRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                <RiGalleryUploadLine className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isUploading ? 'Uploading files...' : 'Drop files here or click to browse'}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  {isUploading 
                    ? 'Please wait while files are uploaded to Cloudinary'
                    : `Supports ${config.accept.replace(/\*/g, 'all')} files`}
                </p>
              </div>
              {!isUploading && (
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full hover:opacity-90 transition-opacity">
                  Browse Files
                </button>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Maximum {config.maxFiles} files, {formatFileSize(config.maxSize)} each
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={config.accept}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Selected Files Preview */}
          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Selected Files ({files.length}/{config.maxFiles})
                  {uploadedCount > 0 && (
                    <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                      ({uploadedCount} uploaded)
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2"
                  disabled={isUploading}
                >
                  <FaTrash className="w-4 h-4" />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`group relative bg-white dark:bg-gray-800 rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                      file.uploadStatus === 'completed'
                        ? 'border-green-500 dark:border-green-600'
                        : file.uploadStatus === 'failed'
                        ? 'border-red-500 dark:border-red-600'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    {/* Remove button */}
                    {!isUploading && file.uploadStatus !== 'uploading' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                      >
                        <FaTimes className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </button>
                    )}

                    {/* Status badge */}
                    {file.uploadStatus === 'completed' && file.attachment && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                        <FaCheck className="w-2 h-2" />
                        Cloudinary
                      </div>
                    )}

                    {/* File Preview */}
                    <div className="p-4">
                      {file.type === 'image' && (
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <img
                            src={file.previewUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {file.type === 'video' && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
                          <video
                            src={file.previewUrl}
                            className="w-full h-full object-cover"
                            controls={playingVideo === file.id}
                          />
                          {playingVideo !== file.id && !isUploading && (
                            <button
                              onClick={() => toggleVideoPlay(file.id)}
                              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40"
                              disabled={isUploading}
                            >
                              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
                                <FaPlay className="w-5 h-5 text-white" />
                              </div>
                            </button>
                          )}
                        </div>
                      )}

                      {(file.type === 'document' || file.type === 'audio') && (
                        <div className="flex items-center justify-center p-6">
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                            {file.attachment?.mimeType 
                              ? getFileIcon(file.name, file.attachment.mimeType)
                              : getFileIcon(file.name, file.file.type)}
                          </div>
                        </div>
                      )}

                      {/* File Info */}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </span>
                            {file.attachment?.mimeType && (
                              <span className="text-xs text-purple-600 dark:text-purple-400">
                                {getFileTypeDisplay(file.attachment.mimeType)}
                              </span>
                            )}
                          </div>
                          {file.duration && file.duration > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.floor(file.duration / 60)}:{(file.duration % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                          {file.metadata?.width && file.metadata?.height && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {file.metadata.width}×{file.metadata.height}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Upload Progress */}
                      {file.uploadStatus === 'uploading' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Uploading to Cloudinary...</span>
                            <span>{file.uploadProgress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                              style={{ width: `${file.uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {file.uploadStatus === 'completed' && file.attachment && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs">
                              <FaCloudUploadAlt className="w-3 h-3" />
                              <span>Uploaded to Cloudinary</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                              {file.attachment.publicId?.substring(0, 10)}...
                            </span>
                          </div>
                          {file.attachment.mimeType && (
                            <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded">
                              MIME: {file.attachment.mimeType}
                            </div>
                          )}
                        </div>
                      )}

                      {file.uploadStatus === 'failed' && (
                        <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                          <FaTimes className="w-3 h-3" />
                          <span>Upload failed</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <div>
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </div>
              {isUploading && (
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Uploading to Cloudinary...
                </div>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : files.some(f => f.uploadStatus === 'completed') ? (
                <>
                  <FaCheck className="w-4 h-4" />
                  {`Send ${files.filter(f => f.uploadStatus === 'completed').length} File${files.filter(f => f.uploadStatus === 'completed').length !== 1 ? 's' : ''}`}
                </>
              ) : (
                <>
                  <FaCloudUploadAlt className="w-4 h-4" />
                  {`Upload & Send ${files.length} File${files.length !== 1 ? 's' : ''}`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;