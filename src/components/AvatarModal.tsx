import { useState, useRef } from 'react';
import { Edit2, Trash, } from 'iconsax-react';
import { avatarService } from '@/services/avatarService';
import { X } from '@phosphor-icons/react';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl?: string;
  userName: string;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}

const AvatarModal = ({ isOpen, onClose, avatarUrl, userName, onUpload, onDelete }: AvatarModalProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      setIsUploading(true);
      try {
        await onUpload(imageFile);
        onClose();
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      try {
        await onUpload(file);
        onClose();
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre avatar ?')) {
      setIsUploading(true);
      try {
        await onDelete();
        onClose();
      } catch (error) {
        console.error('Error deleting avatar:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Avatar</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isUploading}
          >
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar Display */}
          <div
            className={`relative mb-6 ${isDragging ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {avatarUrl ? (
              <img
                src={avatarService.getAvatarUrl(avatarUrl)}
                alt={userName}
                className="w-full aspect-square object-cover rounded-xl"
              />
            ) : (
              <div className="w-full aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-6xl font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Drag Overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500/20 rounded-xl flex items-center justify-center border-4 border-blue-500 border-dashed">
                <p className="text-blue-700 font-medium">Déposer l'image ici</p>
              </div>
            )}
          </div>

          {/* Drag & Drop Info */}
          <p className="text-sm text-gray-500 text-center mb-6">
            Glissez-déposez une image ou utilisez les boutons ci-dessous
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit2 size={18} color="#FFFFFF" />
              <span className="font-medium">
                {isUploading ? 'Chargement...' : avatarUrl ? 'Modifier' : 'Ajouter'}
              </span>
            </button>

            {avatarUrl && (
              <button
                onClick={handleDelete}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash size={18} color="#FFFFFF" />
                <span className="font-medium">Supprimer</span>
              </button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
