// src/components/userComponents/Chat/FileAttachmentPreview.tsx
import React, { useState } from 'react';
import {
  FaPlay,
  FaPause,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
  FaFileArchive,
  FaFile,
  FaDownload,
  FaExpand,
  FaTimes
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';

interface FileAttachment {
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name?: string;
  size?: number;
  duration?: number;
  thumbnail?: string;
}

interface FileAttachmentPreviewProps {
  attachments: FileAttachment[];
  isOwnMessage: boolean;
  onClose?: () => void;
}

const FileAttachmentPreview: React.FC<FileAttachmentPreviewProps> = ({
  attachments,
  isOwnMessage,
  onClose
}) => {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<FileAttachment | null>(null);

  const getFileIcon = (type: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    
    switch (type) {
      case 'image':
        return <FaFileImage className="w-5 h-5 text-pink-500" />;
      case 'video':
        return <FaFileVideo className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <FaFileAudio className="w-5 h-5 text-blue-500" />;
      default:
        switch (ext) {
          case 'pdf':
            return <FaFilePdf className="w-5 h-5 text-red-500" />;
          case 'doc':
          case 'docx':
            return <FaFileWord className="w-5 h-5 text-blue-600" />;
          case 'xls':
          case 'xlsx':
            return <FaFileExcel className="w-5 h-5 text-green-600" />;
          case 'ppt':
          case 'pptx':
            return <FaFilePowerpoint className="w-5 h-5 text-orange-500" />;
          case 'zip':
          case 'rar':
          case '7z':
            return <FaFileArchive className="w-5 h-5 text-yellow-600" />;
          default:
            return <FaFile className="w-5 h-5 text-gray-500" />;
        }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudioPlay = (url: string) => {
    setPlayingAudio(playingAudio === url ? null : url);
  };

  const downloadFile = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (attachments.length === 0) return null;

  // If only one attachment, show expanded preview
  if (attachments.length === 1) {
    const attachment = attachments[0];
    
    return (
      <div className="relative">
        {/* Image Preview */}
        {attachment.type === 'image' && (
          <div className="relative rounded-2xl overflow-hidden group">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full max-h-96 object-cover cursor-pointer"
              onClick={() => setFullscreenImage(attachment.url)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => downloadFile(attachment.url, attachment.name || 'image')}
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <FaDownload className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => setFullscreenImage(attachment.url)}
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <FaExpand className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Preview */}
        {attachment.type === 'video' && (
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video
              src={attachment.url}
              className="w-full max-h-96 object-contain"
              controls
              poster={attachment.thumbnail}
            />
            {attachment.name && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white font-medium truncate">{attachment.name}</p>
                <div className="flex items-center justify-between text-sm text-gray-300 mt-1">
                  <span>{formatFileSize(attachment.size || 0)}</span>
                  {attachment.duration && <span>{formatDuration(attachment.duration)}</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audio Preview */}
        {attachment.type === 'audio' && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleAudioPlay(attachment.url)}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0"
              >
                {playingAudio === attachment.url ? (
                  <FaPause className="w-5 h-5 text-white" />
                ) : (
                  <FaPlay className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {attachment.name || 'Audio message'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span>{formatFileSize(attachment.size || 0)}</span>
                  {attachment.duration && <span>{formatDuration(attachment.duration)}</span>}
                </div>
              </div>
              <button
                onClick={() => downloadFile(attachment.url, attachment.name || 'audio')}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FaDownload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            {playingAudio === attachment.url && (
              <audio
                src={attachment.url}
                autoPlay
                onEnded={() => setPlayingAudio(null)}
                className="w-full mt-3"
              />
            )}
          </div>
        )}

        {/* Document Preview */}
        {attachment.type === 'document' && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                {getFileIcon(attachment.type, attachment.name || '')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {attachment.name || 'Document'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span>{formatFileSize(attachment.size || 0)}</span>
                  <span>Document</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(attachment.url, '_blank')}
                  className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => downloadFile(attachment.url, attachment.name || 'document')}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Image Modal */}
        {fullscreenImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-7xl max-h-[90vh]">
              <img
                src={fullscreenImage}
                alt="Fullscreen"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                onClick={() => setFullscreenImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <FaTimes className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Multiple attachments grid
  return (
    <div className="grid grid-cols-2 gap-2">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className={`rounded-xl overflow-hidden group cursor-pointer ${
            index === 0 && attachments.length % 2 === 1 ? 'col-span-2' : ''
          }`}
          onClick={() => setSelectedAttachment(attachment)}
        >
          {attachment.type === 'image' && (
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <FaExpand className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          {attachment.type === 'video' && (
            <div className="relative aspect-video bg-black">
              <video
                src={attachment.url}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FaPlay className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          )}

          {attachment.type === 'document' && (
            <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center">
                  {getFileIcon(attachment.type, attachment.name || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachment.size || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Attachment Detail Modal */}
      {selectedAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedAttachment.type, selectedAttachment.name || '')}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedAttachment.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(selectedAttachment.size || 0)}
                    {selectedAttachment.duration && ` • ${formatDuration(selectedAttachment.duration)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadFile(selectedAttachment.url, selectedAttachment.name || 'file')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <FaDownload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setSelectedAttachment(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <FaTimes className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedAttachment.type === 'image' && (
                <img
                  src={selectedAttachment.url}
                  alt={selectedAttachment.name}
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
              )}

              {selectedAttachment.type === 'video' && (
                <video
                  src={selectedAttachment.url}
                  className="w-full max-h-[60vh] rounded-lg"
                  controls
                  autoPlay
                />
              )}

              {selectedAttachment.type === 'audio' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                    <FaPlay className="w-8 h-8 text-white" />
                  </div>
                  <audio
                    src={selectedAttachment.url}
                    controls
                    className="w-full max-w-md"
                    autoPlay
                  />
                </div>
              )}

              {selectedAttachment.type === 'document' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mb-6">
                    {getFileIcon(selectedAttachment.type, selectedAttachment.name || '')}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    This document can be downloaded or viewed in a new tab.
                  </p>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => window.open(selectedAttachment.url, '_blank')}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Open in New Tab
                    </button>
                    <button
                      onClick={() => downloadFile(selectedAttachment.url, selectedAttachment.name || 'document')}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileAttachmentPreview;