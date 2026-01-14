// src/components/userComponents/Chat/MessageBubble.tsx
import React, { useState } from 'react';
import { 
  FaCheck, 
  FaCheckDouble, 
  FaPlay, 
  FaPause,
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
  FaFileArchive,
  FaDownload,
  FaExpand,
  FaTimes
} from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import SharedItemPreview from './SharedItemPreview';
import { IMessage } from '../../../Types/messageTypes';

interface FileAttachment {
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  name?: string;
  size?: number;
  duration?: number;
  thumbnail?: string;
}

interface MessageBubbleProps {
  message: IMessage;
  isOwnMessage: boolean;
  showTime?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showTime = true
}) => {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<FileAttachment | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const toggleAudioPlay = (url: string) => {
    setPlayingAudio(playingAudio === url ? null : url);
  };

  const downloadFile = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderFileAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;

    const attachments: FileAttachment[] = message.attachments.map((att, index) => ({
      url: typeof att === 'string' ? att : att.url,
      type: message.messageType === 'image' ? 'image' : 
            message.messageType === 'video' ? 'video' : 
            message.messageType === 'audio' ? 'audio' : 'document',
      name: typeof att === 'object' ? att.name : `File ${index + 1}`,
      size: typeof att === 'object' ? att.size : undefined,
      duration: typeof att === 'object' ? att.duration : message.duration,
      thumbnail: typeof att === 'object' ? att.thumbnail : undefined
    }));

    if (attachments.length === 1) {
      const attachment = attachments[0];
      
      return (
        <div className="space-y-3">
          {message.content && (
            <p className="mb-2">{message.content}</p>
          )}
          
          {/* Image */}
          {attachment.type === 'image' && (
            <div className="relative rounded-xl overflow-hidden group">
              <img
                src={attachment.url}
                alt={attachment.name}
                className="w-full max-h-80 object-cover rounded-xl cursor-pointer transition-transform hover:scale-105"
                onClick={() => setFullscreenImage(attachment.url)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-3 right-3 flex gap-2">
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

          {/* Video */}
          {attachment.type === 'video' && (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video
                src={attachment.url}
                className="w-full max-h-80 object-contain rounded-xl"
                controls
                poster={attachment.thumbnail}
              />
              {attachment.name && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white font-medium truncate">{attachment.name}</p>
                  <div className="flex items-center justify-between text-sm text-gray-300 mt-1">
                    {attachment.size && <span>{formatFileSize(attachment.size)}</span>}
                    {attachment.duration && <span>{formatDuration(attachment.duration)}</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audio */}
          {attachment.type === 'audio' && (
            <div className={`rounded-xl p-4 ${
              isOwnMessage 
                ? 'bg-white/20' 
                : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900'
            }`}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleAudioPlay(attachment.url)}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity"
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
                    <span>{attachment.size ? formatFileSize(attachment.size) : 'Audio'}</span>
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

          {/* Document */}
          {attachment.type === 'document' && (
            <div className={`rounded-xl p-4 ${
              isOwnMessage 
                ? 'bg-white/20' 
                : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(attachment.type, attachment.name || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {attachment.name || 'Document'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>{attachment.size ? formatFileSize(attachment.size) : 'Document'}</span>
                    <span className="capitalize">{attachment.type}</span>
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
        </div>
      );
    }

    // Multiple attachments
    return (
      <div className="space-y-3">
        {message.content && <p className="mb-2">{message.content}</p>}
        <div className={`grid gap-2 ${
          attachments.length === 2 ? 'grid-cols-2' : 
          attachments.length === 3 ? 'grid-cols-2' : 
          attachments.length === 4 ? 'grid-cols-2' : 'grid-cols-3'
        }`}>
          {attachments.slice(0, 9).map((attachment, index) => (
            <div
              key={index}
              className="relative rounded-lg overflow-hidden group cursor-pointer"
              onClick={() => setSelectedAttachment(attachment)}
            >
              {attachment.type === 'image' && (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-full h-32 object-cover"
                />
              )}
              
              {attachment.type === 'video' && (
                <div className="w-full h-32 bg-black relative">
                  <video
                    src={attachment.url}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <FaPlay className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              )}
              
              {attachment.type !== 'image' && attachment.type !== 'video' && (
                <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-2">
                      {getFileIcon(attachment.type, attachment.name || '')}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate px-2">
                      {attachment.name}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <FaExpand className="w-4 h-4 text-white" />
              </div>
              
              {/* File count badge for images/videos */}
              {attachments.length > 9 && index === 8 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    +{attachments.length - 9}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMessageContent = () => {
    // Handle shared items (posts/reels)
    if (message.sharedItem) {
      return (
        <div className="space-y-3">
          {message.content && message.content !== `Shared a ${message.sharedItem.itemType}` && (
            <p className="mb-2">{message.content}</p>
          )}
          <SharedItemPreview item={message.sharedItem} />
        </div>
      );
    }

    // Handle file attachments
    if (message.attachments && message.attachments.length > 0) {
      return renderFileAttachments();
    }

    // Default text message
    return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
  };

  return (
    <div className={`group flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex max-w-[85%]">
        {!isOwnMessage && (
          <div className="mr-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
              {message.senderImage ? (
                <img
                  src={message.senderImage}
                  alt={message.senderName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {message.senderName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex-1 relative">
          {/* Sender name for others' messages */}
          {!isOwnMessage && (
            <div className="mb-1 ml-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {message.senderName || 'User'}
              </span>
            </div>
          )}
          
          {/* Message bubble */}
          <div
            className={`relative rounded-2xl px-4 py-3 shadow-sm ${
              isOwnMessage
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Options button (hover only) */}
            {isOwnMessage && (
              <button
                onClick={() => setShowOptions(!showOptions)}
                className={`absolute -right-8 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                  isOwnMessage 
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <BsThreeDotsVertical className="w-3 h-3" />
              </button>
            )}

            {showOptions && isOwnMessage && (
              <div className="absolute -right-32 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-10">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Edit
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Delete
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Forward
                </button>
              </div>
            )}

            {/* Message content */}
            <div className="max-w-full overflow-hidden">
              {renderMessageContent()}
            </div>
          </div>
          
          {/* Time and read status */}
          {showTime && (
            <div className={`flex items-center gap-2 mt-1 text-xs ${isOwnMessage ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
              <span className={`${isOwnMessage ? 'text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                {formatTime(message.createdAt)}
              </span>
              {isOwnMessage && (
                <div className="flex items-center gap-1">
                  {message.isRead ? (
                    <FaCheckDouble className="w-3 h-3 text-blue-400" />
                  ) : (
                    <FaCheck className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-[90vh]">
            <img
              src={fullscreenImage}
              alt="Fullscreen"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
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
                    {selectedAttachment.size && formatFileSize(selectedAttachment.size)}
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

export default MessageBubble;