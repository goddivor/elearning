import React, { useState, useRef, useCallback } from 'react';
import { Camera, DocumentUpload, CloseSquare, User } from 'iconsax-react';
import Button from './Button';

interface AvatarUploadProps {
  currentAvatar?: string;
  userInitials?: string;
  onAvatarSelect: (file: File) => void;
  onAvatarRemove?: () => void;
  className?: string;
  size?: number;
  disabled?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userInitials = '',
  onAvatarSelect,
  onAvatarRemove,
  className = '',
  size = 96,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    // Valider le fichier
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      alert('Le fichier doit faire moins de 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }

    // Créer une prévisualisation locale
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Appeler le callback parent
    onAvatarSelect(file);
  }, [onAvatarSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file);
      } else {
        alert('Veuillez sélectionner un fichier image');
      }
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveAvatar = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onAvatarRemove?.();
  };

  const displayImage = previewUrl || currentAvatar;

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          rounded-full border-2 border-dashed relative overflow-hidden transition-all duration-200 group
          ${dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{ width: size, height: size }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {displayImage ? (
          <>
            {/* Avatar image */}
            <img
              src={displayImage}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />

            {/* Overlay au survol */}
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Camera size={20} color="#FFFFFF" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {userInitials ? (
              /* Initiales par défaut */
              <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
                <span
                  className="text-white font-bold"
                  style={{ fontSize: Math.max(size * 0.3, 16) }}
                >
                  {userInitials}
                </span>
              </div>
            ) : (
              /* Zone de drop par défaut */
              <>
                <User size={Math.max(size * 0.4, 24)} color="#9CA3AF" />
                {size >= 80 && (
                  <span className="text-xs mt-1 text-center text-gray-500">
                    {dragActive ? 'Déposez ici' : 'Avatar'}
                  </span>
                )}
              </>
            )}

            {/* Overlay pour les initiales */}
            {userInitials && !disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Camera size={20} color="#FFFFFF" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bouton de suppression */}
      {(displayImage || currentAvatar) && onAvatarRemove && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveAvatar();
          }}
          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
        >
          <CloseSquare size={14} color="#FFFFFF" />
        </button>
      )}

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Instructions pour les gros avatars */}
      {size >= 120 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 mb-2">
            JPG, PNG ou GIF (max. 5MB)
          </p>
          <div className="flex justify-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClick}
              disabled={disabled}
              className="text-xs"
            >
              <DocumentUpload size={14} color="#6B7280" className="mr-1" />
              Changer l'avatar
            </Button>
            {(displayImage || currentAvatar) && onAvatarRemove && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveAvatar}
                disabled={disabled}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                Supprimer
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;