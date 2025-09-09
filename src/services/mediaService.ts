import api from './api';

export interface UploadedFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  type: 'image' | 'video' | 'document' | '3d' | 'other';
}

export interface UploadProgress {
  progress: number;
  filename?: string;
}

class MediaService {
  /**
   * Upload a single file
   */
  async uploadFile(
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress({ progress, filename: file.name });
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Erreur lors du téléchargement du fichier');
    }
  }

  /**
   * Upload document specifically
   */
  async uploadDocument(
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await api.post('/media/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress({ progress, filename: file.name });
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Erreur lors du téléchargement du document');
    }
  }

  /**
   * Upload image specifically
   */
  async uploadImage(
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/media/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress({ progress, filename: file.name });
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Erreur lors du téléchargement de l\'image');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[], 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile[]> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await api.post('/media/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress({ progress });
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Erreur lors du téléchargement des fichiers');
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filename: string): Promise<boolean> {
    try {
      await api.delete(`/media/${filename}`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Erreur lors de la suppression du fichier');
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(filename: string): Promise<UploadedFile> {
    try {
      const response = await api.get(`/media/info/${filename}`);
      return response.data;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Erreur lors de la récupération des informations du fichier');
    }
  }

  /**
   * Get file URL for serving
   */
  getFileUrl(filename: string): string {
    return `/api/media/file/${filename}`;
  }

  /**
   * Validate file type and size
   */
  validateFile(file: File, options: {
    maxSize?: number; // in MB
    allowedTypes?: string[];
  } = {}): { valid: boolean; error?: string } {
    const { maxSize = 100, allowedTypes } = options;
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return {
        valid: false,
        error: `Le fichier est trop volumineux (${fileSizeMB.toFixed(1)}MB). Taille maximum: ${maxSize}MB`
      };
    }

    // Check file type if specified
    if (allowedTypes && allowedTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const isAllowed = allowedTypes.some(type => 
        file.type.includes(type) || fileExtension === type.replace('.', '')
      );
      
      if (!isAllowed) {
        return {
          valid: false,
          error: `Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(', ')}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Get file type category
   */
  getFileType(file: File): 'image' | 'video' | 'document' | '3d' | 'other' {
    const type = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (type.startsWith('image/')) {
      return 'image';
    }
    
    if (type.startsWith('video/')) {
      return 'video';
    }
    
    if (type.includes('pdf') || 
        type.includes('document') || 
        type.includes('presentation') ||
        type.includes('text')) {
      return 'document';
    }
    
    // Check for 3D file extensions
    if (['obj', 'fbx', 'gltf', 'glb'].includes(extension)) {
      return '3d';
    }
    
    return 'other';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get appropriate validation options by content type
   */
  getValidationOptions(contentType: 'video' | 'image' | 'document' | '3d'): {
    maxSize: number;
    allowedTypes: string[];
  } {
    switch (contentType) {
      case 'image':
        return {
          maxSize: 10, // 10MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        };
      
      case 'video':
        return {
          maxSize: 500, // 500MB
          allowedTypes: ['video/mp4', 'video/webm', 'video/avi', 'video/quicktime']
        };
      
      case 'document':
        return {
          maxSize: 50, // 50MB
          allowedTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
          ]
        };
      
      case '3d':
        return {
          maxSize: 100, // 100MB
          allowedTypes: ['obj', 'fbx', 'gltf', 'glb']
        };
      
      default:
        return {
          maxSize: 100,
          allowedTypes: []
        };
    }
  }
}

export const mediaService = new MediaService();
export default mediaService;