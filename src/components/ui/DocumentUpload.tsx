import { useState, useCallback, useRef } from 'react';
import { DocumentText, Import, Trash } from 'iconsax-react';
import Button from './Button';
import { useToast } from '@/contexts/toast-context';
import { mediaService } from '@/services/mediaService';

// Interface pour un fichier local (avant upload)
export interface LocalFile {
  file: File;
  name: string;
  type: string;
  size: number;
  preview: string; // URL locale pour preview
}

// Interface pour un fichier déjà uploadé
export interface UploadedFile {
  url: string;
  name: string;
  type?: string;
  size?: number;
}

interface DocumentUploadProps {
  onFileSelect: (localFile: LocalFile | null) => void;
  onRemove?: () => void;
  existingFile?: LocalFile | UploadedFile | null;
  disabled?: boolean;
  className?: string;
}

const DocumentUpload = ({ 
  onFileSelect, 
  onRemove, 
  existingFile, 
  disabled, 
  className = '' 
}: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Helper pour déterminer si c'est un fichier local ou uploadé
  const isLocalFile = (file: LocalFile | UploadedFile): file is LocalFile => {
    return 'file' in file && 'preview' in file;
  };

  const handleFiles = useCallback((files: FileList) => {
    // console.log('📄 DocumentUpload - handleFiles appelé avec:', files.length, 'fichier(s)');
    // console.log('📄 DocumentUpload - disabled:', disabled);
    
    if (files.length === 0 || disabled) {
      // console.log('📄 DocumentUpload - Arrêt: pas de fichiers ou composant désactivé');
      return;
    }

    const file = files[0];
    // console.log('📄 DocumentUpload - Fichier sélectionné:', {
    //   name: file.name,
    //   type: file.type,
    //   size: file.size
    // });

    // Validate file
    const validation = mediaService.validateFile(file, mediaService.getValidationOptions('document'));
    // console.log('📄 DocumentUpload - Validation:', validation);
    
    if (!validation.valid) {
      // console.log('📄 DocumentUpload - Fichier invalide:', validation.error);
      showError('Fichier invalide', validation.error || 'Fichier invalide');
      return;
    }

    // Créer un objet URL pour la preview locale
    const preview = URL.createObjectURL(file);
    // console.log('📄 DocumentUpload - Preview URL créée:', preview);
    
    const localFile: LocalFile = {
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      preview
    };

    // console.log('📄 DocumentUpload - Appel de onFileSelect avec:', localFile);
    onFileSelect(localFile);
    success('Document sélectionné', 'Le document sera uploadé à la sauvegarde');
  }, [onFileSelect, disabled, success, showError]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    // console.log('📄 DocumentUpload - handleDrop appelé');
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || !e.dataTransfer.files) {
      // console.log('📄 DocumentUpload - Drop ignoré: disabled =', disabled, ', files =', e.dataTransfer.files);
      return;
    }

    // console.log('📄 DocumentUpload - Fichiers droppés:', e.dataTransfer.files.length);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log('📄 DocumentUpload - handleFileInput appelé');
    // console.log('📄 DocumentUpload - Input files:', e.target.files?.length || 0);
    
    if (e.target.files && e.target.files.length > 0) {
      // console.log('📄 DocumentUpload - Appel de handleFiles depuis input');
      handleFiles(e.target.files);
    } else {
      // console.log('📄 DocumentUpload - Pas de fichiers dans input');
    }
  }, [handleFiles]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <DocumentText color="#EF4444" size={32} />;
      case 'doc':
      case 'docx':
        return <DocumentText color="#2563EB" size={32} />;
      case 'ppt':
      case 'pptx':
        return <DocumentText color="#EA580C" size={32} />;
      case 'xls':
      case 'xlsx':
        return <DocumentText color="#10B981" size={32} />;
      case 'txt':
        return <DocumentText color="#6B7280" size={32} />;
      default:
        return <DocumentText color="#6B7280" size={32} />;
    }
  };

  if (existingFile) {
    const isLocal = isLocalFile(existingFile);
    const fileUrl = isLocal ? existingFile.preview : existingFile.url;
    const fileName = existingFile.name;
    const fileSize = isLocal ? mediaService.formatFileSize(existingFile.size) : 'Taille inconnue';
    
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon(fileName)}
            <div>
              <p className="font-medium text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-500">{fileSize}</p>
              {isLocal && (
                <p className="text-xs text-orange-600">📁 Fichier local (à uploader)</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Voir
            </a>
            {onRemove && !disabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Nettoyer l'URL locale si c'est un fichier local
                  if (isLocal) {
                    URL.revokeObjectURL(existingFile.preview);
                  }
                  onRemove();
                }}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash color='red' size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-green-400 bg-green-50' 
            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-4">
          <DocumentText color="#10B981" size={48} className="mx-auto" />
          
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              {isDragging ? 'Relâchez pour télécharger' : 'Télécharger un document'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Glissez-déposez un fichier ici ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Formats supportés: PDF, Word, PowerPoint, Excel, TXT (max 50MB)
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              className="border-green-300 text-green-600 hover:bg-green-50"
              disabled={disabled}
            >
              <Import color="#10B981" size={16} className="mr-2" />
              Choisir un fichier
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;