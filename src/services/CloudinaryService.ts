// src/services/upload/CloudinaryUploadService.ts
import axios, { AxiosProgressEvent } from 'axios';

export interface UploadOptions {
  folder?: string;
  tags?: string[];
  context?: Record<string, any>;
  transformations?: string;
  eager?: string;
  resourceType?: 'image' | 'video' | 'auto';
}

export interface UploadResult {
  success: boolean;
  data?: {
    asset_id: string;
    public_id: string;
    secure_url: string;
    url: string;
    format: string;
    resource_type: string;
    bytes: number;
    width?: number;
    height?: number;
    duration?: number;
    created_at: string;
    thumbnail_url?: string;
    original_filename: string;
  };
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
  speed: number;
  estimatedTime: number;
}

export interface UploadConfig {
  maxFileSize: {
    image: number;
    video: number;
  };
  allowedTypes: {
    image: string[];
    video: string[];
  };
  uploadTimeout: number;
}

class CloudinaryUploadService {
  private cloudName: string;
  private uploadPreset: string;
  private baseUrl: string;
  private config: UploadConfig;

  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
    this.baseUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}`;

    this.config = {
      maxFileSize: {
        image: 20 * 1024 * 1024, // 20MB
        video: 100 * 1024 * 1024, // 100MB
      },
      allowedTypes: {
        image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
      },
      uploadTimeout: 300000, // 5 minutes
    };

    if (!this.cloudName || !this.uploadPreset) {
      console.warn('Cloudinary configuration missing!');
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, requiredType?: 'image' | 'video'): { isValid: boolean; error?: string } {
    const fileType = file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : null;
    
    if (!fileType) {
      return {
        isValid: false,
        error: `${file.name} is not a valid image or video`,
      };
    }

    // Check if file type matches required type
    if (requiredType && fileType !== requiredType) {
      return {
        isValid: false,
        error: `Please select ${requiredType} files only`,
      };
    }

    // Check file size
    const maxSize = this.config.maxFileSize[fileType];
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return {
        isValid: false,
        error: `File too large. Maximum ${fileType} size is ${maxSizeMB}MB`,
      };
    }

    // Check file type
    const allowedTypes = this.config.allowedTypes[fileType];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid ${fileType} type. Allowed: ${allowedTypes.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Upload single file with progress tracking
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {},
    onProgress?: (progress: UploadProgress) => void,
    requiredType?: 'image' | 'video'
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, requiredType);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const startTime = Date.now();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);

      // Add optional parameters
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }
      if (options.context) {
        formData.append('context', JSON.stringify(options.context));
      }
      if (options.transformations) {
        formData.append('transformations', options.transformations);
      }
      if (options.eager) {
        formData.append('eager', options.eager);
      }

      // Determine resource type
      const resourceType = file.type.startsWith('image/') ? 'image' : 'video';
      const uploadUrl = `${this.baseUrl}/${resourceType}/upload`;

      console.log('Starting Cloudinary upload:', {
        name: file.name,
        type: file.type,
        size: this.formatBytes(file.size),
        folder: options.folder,
      });

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const elapsedTime = (Date.now() - startTime) / 1000;
            const loaded = progressEvent.loaded;
            const total = progressEvent.total;
            const percent = Math.round((loaded * 100) / total);
            const speed = loaded / elapsedTime;
            const remainingBytes = total - loaded;
            const estimatedTime = speed > 0 ? remainingBytes / speed : 0;

            onProgress({
              loaded,
              total,
              percent,
              speed,
              estimatedTime,
            });
          }
        },
        timeout: this.config.uploadTimeout,
      });

      console.log('Upload completed:', response.data);

      // Generate thumbnail URL for videos
      let thumbnail_url;
      if (resourceType === 'video' && response.data.public_id) {
        thumbnail_url = this.generateVideoThumbnail(response.data.public_id);
      }

      return {
        success: true,
        data: {
          ...response.data,
          thumbnail_url,
          original_filename: file.name,
        },
      };

    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      
      let errorMessage = 'Upload failed';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Upload multiple files sequentially
   */
  async uploadMultipleFiles(
    files: File[],
    options: UploadOptions = {},
    onFileProgress?: (index: number, progress: UploadProgress) => void,
    requiredType?: 'image' | 'video'
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);
      
      const result = await this.uploadFile(
        file,
        options,
        (progress) => onFileProgress?.(i, progress),
        requiredType
      );
      
      results.push(result);
      
      if (!result.success) {
        console.warn(`File ${file.name} upload failed:`, result.error);
      }
    }
    
    return results;
  }

  /**
   * Generate video thumbnail URL
   */
  generateVideoThumbnail(publicId: string, timeInSeconds: number = 1): string {
    return `https://res.cloudinary.com/${this.cloudName}/video/upload/so_${timeInSeconds},c_fill,w_320,h_240/${publicId}.jpg`;
  }

  /**
   * Generate optimized image URL
   */
  generateOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpg' | 'png';
    } = {}
  ): string {
    const transformations = [];
    
    if (options.width || options.height) {
      transformations.push(`c_fill,w_${options.width || 'auto'},h_${options.height || 'auto'}`);
    }
    
    transformations.push('q_auto:good');
    
    if (options.format) {
      transformations.push(`f_${options.format}`);
    } else {
      transformations.push('f_auto');
    }
    
    const transformationString = transformations.join(',');
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformationString}/${publicId}`;
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Get upload configuration
   */
  getConfig(): UploadConfig {
    return this.config;
  }

  /**
   * Get allowed file types for input
   */
  getAllowedTypes(requiredType?: 'image' | 'video' | 'both'): string {
    let types: string[] = [];
    
    if (requiredType === 'image') {
      types = this.config.allowedTypes.image;
    } else if (requiredType === 'video') {
      types = this.config.allowedTypes.video;
    } else {
      types = [...this.config.allowedTypes.image, ...this.config.allowedTypes.video];
    }
    
    return types.join(',');
  }

  /**
   * Get file extension string for input accept attribute
   */
  getAcceptExtensions(requiredType?: 'image' | 'video' | 'both'): string {
    const types = requiredType === 'image' ? this.config.allowedTypes.image :
                 requiredType === 'video' ? this.config.allowedTypes.video :
                 [...this.config.allowedTypes.image, ...this.config.allowedTypes.video];
    
    const extensions = types.map(type => {
      const parts = type.split('/');
      if (parts.length === 2) {
        return `.${parts[1]}`;
      }
      return '';
    }).filter(ext => ext.length > 0);
    
    return extensions.join(',');
  }

  /**
   * Convert File to Base64 (useful for cropping)
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Convert Base64 to File
   */
  base64ToFile(base64: string, filename: string): File {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Validate video duration for reels (15-60 seconds)
   */
  async validateVideoDuration(file: File): Promise<{ isValid: boolean; duration?: number; error?: string }> {
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
        
        if (duration < 15 || duration > 60) {
          resolve({ 
            isValid: false, 
            duration, 
            error: 'Video duration must be between 15 and 60 seconds' 
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
  }

  /**
   * Get video dimensions
   */
  async getVideoDimensions(file: File): Promise<{ width: number; height: number; ratio: string }> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('video/')) {
        reject(new Error('Not a video file'));
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const width = video.videoWidth;
        const height = video.videoHeight;
        const ratio = width > height ? 'landscape' : width < height ? 'portrait' : 'square';
        
        resolve({ width, height, ratio });
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }
}

// Create singleton instance
export const cloudinaryUploadService = new CloudinaryUploadService();
export default cloudinaryUploadService;