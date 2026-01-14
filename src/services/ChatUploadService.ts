// src/services/ChatUploadService.ts
import cloudinaryService, { UploadResult } from './CloudinaryService';
import { ChatAttachment } from '../Types/messageTypes';

export interface ChatFileUpload {
  file: File;
  type: 'image' | 'video' | 'document' | 'audio';
  metadata: {
    name: string;
    size: number;
    mimeType: string;
    duration?: number;
    width?: number;
    height?: number;
  };
}

export interface UploadProgressEvent {
  fileIndex: number;
  loaded: number;
  total: number;
  percent: number;
}

class ChatUploadService {
  private readonly chatFolder = 'chat_attachments';
  
  /**
   * Upload files for chat with proper folder structure
   */
  async uploadChatFiles(
    files: File[],
    chatId: string,
    userId: string,
    onProgress?: (event: UploadProgressEvent) => void
  ): Promise<ChatAttachment[]> {
    try {
      const chatFolder = `${this.chatFolder}/${chatId}/${userId}/${Date.now()}`;
      const attachments: ChatAttachment[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          // Detect resource type for Cloudinary
          const resourceType = this.getCloudinaryResourceType(file);
          
          // Upload to Cloudinary
          const result = await cloudinaryService.uploadFile(file, {
            folder: chatFolder,
            resourceType: resourceType,
            tags: ['chat', `chat_${chatId}`, `user_${userId}`]
          }, (progress) => {
            onProgress?.({
              fileIndex: i,
              ...progress
            });
          });
          
          // Create chat attachment object
          const attachment = this.createChatAttachment(result, file);
          attachments.push(attachment);
          
        } catch (error) {
          console.error(`Failed to upload file ${i + 1}:`, error);
          // Continue with other files
        }
      }
      
      return attachments;
    } catch (error) {
      console.error('Chat file upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Upload single file for chat
   */
  async uploadChatFile(
    file: File,
    chatId: string,
    userId: string,
    onProgress?: (loaded: number, total: number, percent: number) => void
  ): Promise<ChatAttachment> {
    const chatFolder = `${this.chatFolder}/${chatId}/${userId}/${Date.now()}`;
    const resourceType = this.getCloudinaryResourceType(file);
    
    const result = await cloudinaryService.uploadFile(file, {
      folder: chatFolder,
      resourceType: resourceType,
      tags: ['chat', `chat_${chatId}`, `user_${userId}`]
    }, (progress) => {
      onProgress?.(progress.loaded, progress.total, progress.percent);
    });
    
    return this.createChatAttachment(result, file);
  }
  
  /**
   * Delete chat attachment
   */
  async deleteChatAttachment(publicId: string, type: 'image' | 'video' | 'document' | 'audio'): Promise<void> {
    // Map chat type to Cloudinary resource type
    const resourceType = this.mapToCloudinaryResourceType(type);
    await cloudinaryService.deleteFile(publicId, resourceType);
  }
  
  /**
   * Get optimized chat attachment URL
   */
  getChatAttachmentUrl(
    publicId: string,
    type: 'image' | 'video' | 'document' | 'audio',
    options: {
      thumbnail?: boolean;
      width?: number;
      height?: number;
    } = {}
  ): string {
    if (options.thumbnail && type === 'video') {
      return cloudinaryService.getVideoThumbnailUrl(publicId);
    }
    
    if (options.thumbnail && type === 'image') {
      return cloudinaryService.getOptimizedUrl(publicId, {
        width: options.width || 320,
        height: options.height || 240,
        quality: 80
      });
    }
    
    return cloudinaryService.getOptimizedUrl(publicId, {
      width: options.width,
      height: options.height,
      quality: type === 'image' ? 90 : 80,
      resourceType: type === 'video' ? 'video' : 'image'
    });
  }
  
  /**
   * Get MIME type from Cloudinary URL and file type
   */
  getMimeTypeFromCloudinaryUrl(url: string, type: 'image' | 'video' | 'document' | 'audio'): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (type) {
      case 'image':
        switch (extension) {
          case 'jpg':
          case 'jpeg':
            return 'image/jpeg';
          case 'png':
            return 'image/png';
          case 'gif':
            return 'image/gif';
          case 'webp':
            return 'image/webp';
          default:
            return 'image/jpeg';
        }
      case 'video':
        switch (extension) {
          case 'mp4':
            return 'video/mp4';
          case 'mov':
            return 'video/quicktime';
          case 'avi':
            return 'video/x-msvideo';
          case 'webm':
            return 'video/webm';
          default:
            return 'video/mp4';
        }
      case 'audio':
        switch (extension) {
          case 'mp3':
            return 'audio/mpeg';
          case 'wav':
            return 'audio/wav';
          case 'ogg':
            return 'audio/ogg';
          case 'm4a':
            return 'audio/mp4';
          case 'webm':
            return 'audio/webm';
          default:
            return 'audio/mpeg';
        }
      case 'document':
        switch (extension) {
          case 'pdf':
            return 'application/pdf';
          case 'doc':
            return 'application/msword';
          case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          case 'txt':
            return 'text/plain';
          case 'xls':
            return 'application/vnd.ms-excel';
          case 'xlsx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          case 'ppt':
            return 'application/vnd.ms-powerpoint';
          case 'pptx':
            return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          case 'zip':
            return 'application/zip';
          default:
            return 'application/octet-stream';
        }
      default:
        return 'application/octet-stream';
    }
  }
  
  /**
   * Extract file metadata
   */
  async extractFileMetadata(file: File): Promise<{
    duration?: number;
    width?: number;
    height?: number;
  }> {
    return new Promise((resolve) => {
      const metadata: any = {};
      
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
          metadata.duration = Math.round(video.duration);
          metadata.width = video.videoWidth;
          metadata.height = video.videoHeight;
          URL.revokeObjectURL(video.src);
          resolve(metadata);
        };
        
        video.onerror = () => {
          URL.revokeObjectURL(video.src);
          resolve(metadata);
        };
        
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.preload = 'metadata';
        
        audio.onloadedmetadata = () => {
          metadata.duration = Math.round(audio.duration);
          URL.revokeObjectURL(audio.src);
          resolve(metadata);
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audio.src);
          resolve(metadata);
        };
        
        audio.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          metadata.width = img.width;
          metadata.height = img.height;
          URL.revokeObjectURL(img.src);
          resolve(metadata);
        };
        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          resolve(metadata);
        };
        img.src = URL.createObjectURL(file);
      } else {
        resolve(metadata);
      }
    });
  }
  
  /**
   * Validate file before upload
   */
  validateFile(file: File): {
    isValid: boolean;
    error?: string;
    type?: 'image' | 'video' | 'document' | 'audio';
  } {
    // Check file size
    const maxSizes = {
      image: 20 * 1024 * 1024, // 20MB
      video: 100 * 1024 * 1024, // 100MB
      audio: 20 * 1024 * 1024, // 20MB
      document: 10 * 1024 * 1024, // 10MB
    };
    
    // Detect file type
    let type: 'image' | 'video' | 'document' | 'audio' = 'document';
    
    if (file.type.startsWith('image/')) {
      type = 'image';
    } else if (file.type.startsWith('video/')) {
      type = 'video';
    } else if (file.type.startsWith('audio/')) {
      type = 'audio';
    } else if (
      file.type === 'application/pdf' ||
      file.type.includes('document') ||
      file.type.includes('sheet') ||
      file.type.includes('presentation') ||
      file.type === 'text/plain' ||
      file.type.includes('zip') ||
      file.type.includes('compressed')
    ) {
      type = 'document';
    }
    
    const maxSize = maxSizes[type];
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large. Maximum size for ${type} is ${maxSize / (1024 * 1024)}MB`,
        type
      };
    }
    
    // Video duration check (optional)
    if (type === 'video' && file.size > 50 * 1024 * 1024) {
      return {
        isValid: true,
        type,
        error: 'Large video file detected. Upload may take longer.'
      };
    }
    
    return { isValid: true, type };
  }
  
  /**
   * Get Cloudinary resource type from file
   */
  private getCloudinaryResourceType(file: File): 'image' | 'video' | 'raw' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'video'; // Cloudinary treats audio as video
    return 'raw';
  }
  
  /**
   * Map chat type to Cloudinary resource type
   */
  private mapToCloudinaryResourceType(type: 'image' | 'video' | 'document' | 'audio'): 'image' | 'video' | 'raw' {
    switch (type) {
      case 'image': return 'image';
      case 'video': return 'video';
      case 'audio': return 'video'; // Audio is treated as video in Cloudinary
      case 'document': return 'raw';
      default: return 'raw';
    }
  }
  
  /**
   * Create chat attachment from upload result
   */
  private createChatAttachment(result: UploadResult, file: File): ChatAttachment {
    // Determine type
    let type: 'image' | 'video' | 'document' | 'audio';
    
    if (result.resource_type === 'image') {
      type = 'image';
    } else if (result.resource_type === 'video') {
      // Check if it's audio based on file type
      type = file.type.startsWith('audio/') ? 'audio' : 'video';
    } else {
      type = 'document';
    }
    
    // Get MIME type
    let mimeType = file.type;
    if (!mimeType || mimeType === '') {
      // Fallback: derive MIME type from extension or Cloudinary format
      mimeType = this.getMimeTypeFromCloudinaryUrl(result.secure_url, type);
    }
    
    return {
      url: result.secure_url,
      type,
      name: file.name,
      size: file.size,
      duration: result.duration || undefined,
      thumbnail: result.thumbnail_url,
      width: result.width || undefined,
      height: result.height || undefined,
      publicId: result.public_id,
      format: result.format,
      mimeType: mimeType, // Ensure mimeType is always included
      createdAt: new Date().toISOString()
    };
  }
}

// Create singleton instance
const chatUploadService = new ChatUploadService();
export default chatUploadService;