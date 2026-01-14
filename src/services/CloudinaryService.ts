// src/services/CloudinaryService.ts
import axios from 'axios';

export interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw';
  publicId?: string;
  tags?: string[];
  context?: Record<string, any>;
  // Remove transformation from options for unsigned uploads
}

export interface UploadResult {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
  api_key: string;
  thumbnail_url?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  duration?: number;
  width?: number;
  height?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

class CloudinaryService {
  private readonly cloudName: string;
  private readonly uploadPreset: string;

  constructor() {
    // Use import.meta.env for Vite
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
    
    if (!this.cloudName || !this.uploadPreset) {
      console.error('Cloudinary configuration missing. Please set:');
      console.error('- VITE_CLOUDINARY_CLOUD_NAME');
      console.error('- VITE_CLOUDINARY_UPLOAD_PRESET');
      console.error('in your .env file');
    }
  }

  /**
   * Upload file directly to Cloudinary from frontend using unsigned upload
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file);

      // Create form data - ONLY ALLOWED PARAMETERS FOR UNSIGNED UPLOAD
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      
      // Add only allowed parameters for unsigned upload
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }
      
      if (options.context) {
        formData.append('context', JSON.stringify(options.context));
      }
      
      // For unsigned uploads, we CANNOT set resource_type directly
      // Cloudinary will auto-detect it from the file
      // Also CANNOT set transformation, public_id, etc.
      
      // Upload URL - use auto for resource type detection
      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`;

      console.log('Uploading to Cloudinary:', {
        file: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        type: file.type,
        uploadPreset: this.uploadPreset,
        folder: options.folder
      });

      // Upload with progress
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percent: Math.round((progressEvent.loaded * 100) / progressEvent.total)
            });
          }
        },
        timeout: 180000, // 3 minutes for large files
      });

      console.log('Cloudinary upload successful:', response.data);
      return this.formatResult(response.data, file);
      
    } catch (error: any) {
      console.error('Cloudinary upload failed:', error);
      
      // Detailed error logging
      if (error.response) {
        console.error('Response error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw new Error(`Upload failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    options: UploadOptions = {},
    onFileProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    // Upload files sequentially to avoid rate limiting
    for (let i = 0; i < files.length; i++) {
      try {
        console.log(`Uploading file ${i + 1}/${files.length}: ${files[i].name}`);
        const result = await this.uploadFile(
          files[i], 
          options, 
          (progress) => onFileProgress?.(i, progress)
        );
        results.push(result);
        console.log(`File ${i + 1} uploaded successfully`);
      } catch (error) {
        console.error(`Failed to upload file ${i + 1}:`, error);
        // Continue with other files
      }
    }
    
    return results;
  }

  /**
   * Delete file from Cloudinary (Note: This requires server-side signature)
   * For frontend, use a server endpoint instead
   */
  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<any> {
    // Note: Frontend shouldn't handle deletion directly due to API secret requirement
    // This should be done through a server endpoint
    console.warn('Frontend deletion not recommended. Use server endpoint instead.');
    throw new Error('Use server endpoint for deletion');
  }

  /**
   * Generate optimized URL for display (after upload)
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    resourceType?: 'image' | 'video';
  } = {}): string {
    const transformations = [];
    
    if (options.width || options.height) {
      transformations.push(`c_fill,w_${options.width || 'auto'},h_${options.height || 'auto'}`);
    }
    
    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    } else {
      transformations.push('q_auto:good');
    }
    
    if (options.format) {
      transformations.push(`f_${options.format}`);
    } else {
      transformations.push('f_auto');
    }
    
    const transformationString = transformations.join(',');
    
    return `https://res.cloudinary.com/${this.cloudName}/${options.resourceType || 'image'}/upload/${
      transformationString ? transformationString + '/' : ''
    }${publicId}`;
  }

  /**
   * Generate video thumbnail URL
   */
  getVideoThumbnailUrl(publicId: string, timeInSeconds: number = 1): string {
    return `https://res.cloudinary.com/${this.cloudName}/video/upload/so_${timeInSeconds},c_fill,w_320,h_240/${publicId}.jpg`;
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    try {
      const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
      return matches ? matches[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if URL is from Cloudinary
   */
  isCloudinaryUrl(url: string): boolean {
    return url.includes('res.cloudinary.com') || url.includes('cloudinary.com/upload');
  }

  // Private helper methods
  private validateFile(file: File): void {
    const maxSizes = {
      image: 20 * 1024 * 1024, // 20MB
      video: 100 * 1024 * 1024, // 100MB
      raw: 10 * 1024 * 1024, // 10MB
    };

    const resourceType = this.detectResourceType(file);
    const maxSize = maxSizes[resourceType] || maxSizes.raw;

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size for ${resourceType} is ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
    }
  }

  private detectResourceType(file: File): 'image' | 'video' | 'raw' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'video'; // Cloudinary treats audio as video
    return 'raw';
  }

  private formatResult(data: any, file: File): UploadResult {
    console.log('Formatting Cloudinary result:', data);
    
    // Generate thumbnail URL for videos
    let thumbnailUrl: string | undefined;
    if (data.resource_type === 'video') {
      // If eager transformations exist, use the first one
      if (data.eager && data.eager.length > 0) {
        thumbnailUrl = data.eager[0].secure_url;
      } else {
        // Fallback: generate thumbnail URL manually
        thumbnailUrl = `https://res.cloudinary.com/${this.cloudName}/video/upload/so_1,c_fill,w_320,h_240/${data.public_id}.jpg`;
      }
    }

    return {
      asset_id: data.asset_id,
      public_id: data.public_id,
      version: data.version,
      version_id: data.version_id,
      signature: data.signature,
      width: data.width || 0,
      height: data.height || 0,
      format: data.format,
      resource_type: data.resource_type,
      created_at: data.created_at,
      tags: data.tags || [],
      bytes: data.bytes,
      type: data.type,
      etag: data.etag,
      placeholder: data.placeholder || false,
      url: data.url,
      secure_url: data.secure_url,
      folder: data.folder || '',
      original_filename: data.original_filename || file.name,
      api_key: data.api_key,
      thumbnail_url: thumbnailUrl,
      duration: data.duration,
      metadata: data.metadata || {
        originalName: file.name,
        originalType: file.type,
        originalSize: file.size,
        uploadedAt: new Date().toISOString(),
      }
    };
  }
}

// Create singleton instance
const cloudinaryService = new CloudinaryService();
export default cloudinaryService;