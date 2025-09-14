import api from './api';

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  path: string;
  type: 'course' | 'avatar' | 'document' | 'video' | '3d' | 'other';
}

class MediaService {
  // Upload d'un seul fichier
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async uploadFile(file: File, _type: 'course' | 'avatar' | 'document' = 'course'): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Upload de plusieurs fichiers
  async uploadMultipleFiles(files: File[]): Promise<UploadedFile[]> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/media/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Upload spécifique pour les documents
  async uploadDocument(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('document', file);

    const response = await api.post('/media/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Upload avec suivi de progression
  async uploadFileWithProgress(
    file: File,
    onProgress?: (progress: number) => void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _type: 'course' | 'avatar' | 'document' = 'course'
  ): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Construire l'URL complète pour accéder à un fichier
  getFileUrl(filePath: string): string {
    return `${api.defaults.baseURL}/media/file/${filePath}`;
  }

  // Valider le type de fichier
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  // Valider la taille du fichier (en MB)
  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // Types de fichiers autorisés par catégorie
  getAllowedFileTypes(category: 'image' | 'video' | 'document' | 'audio' | '3d'): string[] {
    const allowedTypes = {
      image: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
      ],
      video: [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/avi',
        'video/mov',
        'video/wmv'
      ],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown'
      ],
      audio: [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/m4a'
      ],
      '3d': [
        'model/gltf-binary',
        'model/gltf+json',
        'application/octet-stream'
      ]
    };

    return allowedTypes[category] || [];
  }

  // Formater la taille de fichier
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Options de validation par catégorie
  getValidationOptions(category: 'image' | 'video' | 'document' | 'audio' | '3d') {
    const options = {
      image: {
        maxSizeMB: 10,
        allowedTypes: this.getAllowedFileTypes('image')
      },
      video: {
        maxSizeMB: 100,
        allowedTypes: this.getAllowedFileTypes('video')
      },
      document: {
        maxSizeMB: 25,
        allowedTypes: this.getAllowedFileTypes('document')
      },
      audio: {
        maxSizeMB: 50,
        allowedTypes: this.getAllowedFileTypes('audio')
      },
      '3d': {
        maxSizeMB: 50,
        allowedTypes: this.getAllowedFileTypes('3d')
      }
    };

    return options[category];
  }

  // Valider un fichier selon ses options
  validateFile(file: File, options: { maxSizeMB: number; allowedTypes: string[] }) {
    // Vérifier le type
    if (!this.validateFileType(file, options.allowedTypes)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé. Types acceptés: ${options.allowedTypes.join(', ')}`
      };
    }

    // Vérifier la taille
    if (!this.validateFileSize(file, options.maxSizeMB)) {
      return {
        valid: false,
        error: `Fichier trop volumineux. Taille maximum: ${options.maxSizeMB}MB`
      };
    }

    return { valid: true };
  }
}

export const mediaService = new MediaService();
export default mediaService;