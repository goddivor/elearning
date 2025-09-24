import { useState, useCallback, useRef } from "react";
import { Eye, Image, Import, Trash } from "iconsax-react";
import Button from "./Button";
import { useToast } from '@/contexts/toast-context';
import { mediaService } from "@/services/mediaService";

// Interface pour une image locale (avant upload)
export interface LocalImage {
  file: File;
  name: string;
  type: string;
  size: number;
  preview: string; // URL locale pour preview
}

// Interface pour une image déjà uploadée
export interface UploadedImage {
  url: string;
  name: string;
  type?: string;
  size?: number;
}

interface ImageUploadProps {
  onImageSelect: (localImage: LocalImage | null) => void;
  onRemove?: () => void;
  existingImage?: LocalImage | UploadedImage | null;
  disabled?: boolean;
  className?: string;
  aspectRatio?: "video" | "square" | "auto"; // 16:9, 1:1, ou auto
}

const ImageUpload = ({
  onImageSelect,
  onRemove,
  existingImage,
  disabled,
  className = "",
  aspectRatio = "video",
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: showError } = useToast();

  // Helper pour déterminer si c'est une image locale ou uploadée
  const isLocalImage = (
    image: LocalImage | UploadedImage
  ): image is LocalImage => {
    return "file" in image && "preview" in image;
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "video":
        return "aspect-video"; // 16:9
      case "square":
        return "aspect-square"; // 1:1
      default:
        return "aspect-auto";
    }
  };

  const handleFiles = useCallback(
    (files: FileList) => {
      if (files.length === 0 || disabled) return;

      const file = files[0];

      // Validate image
      const validation = mediaService.validateFile(
        file,
        mediaService.getValidationOptions("image")
      );
      if (!validation.valid) {
        showError("Image invalide", validation.error || "Fichier image invalide");
        return;
      }

      // Créer un objet URL pour la preview locale
      const preview = URL.createObjectURL(file);

      const localImage: LocalImage = {
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        preview,
      };

      onImageSelect(localImage);
      success("Image sélectionnée", "L'image sera uploadée à la sauvegarde");
    },
    [onImageSelect, disabled, success, showError]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        !disabled &&
        e.dataTransfer.items &&
        e.dataTransfer.items.length > 0
      ) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || !e.dataTransfer.files) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && files[0].type.startsWith("image/")) {
        handleFiles(e.dataTransfer.files);
      } else {
        showError("Fichier invalide", "Veuillez déposer un fichier image valide");
      }
    },
    [handleFiles, disabled, showError]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  if (existingImage) {
    const isLocal = isLocalImage(existingImage);
    const imageUrl = isLocal ? existingImage.preview : existingImage.url;
    const imageName = existingImage.name;
    const imageSize = isLocal
      ? mediaService.formatFileSize(existingImage.size)
      : "Taille inconnue";

    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}
      >
        <div className={`${getAspectRatioClass()} relative bg-gray-100`}>
          <img
            src={imageUrl}
            alt={imageName}
            className="w-full h-full object-cover"
            onError={() => {
              showError("Erreur d'image", "Impossible de charger l'image");
            }}
          />

          {/* Overlay avec actions */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white text-gray-800 rounded-md text-sm hover:bg-gray-100 transition-colors"
            >
                <Eye size="16" color="#FF8A65" />
            </a>
            {onRemove && !disabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Nettoyer l'URL locale si c'est une image locale
                  if (isLocal) {
                    URL.revokeObjectURL(existingImage.preview);
                  }
                  onRemove();
                }}
                className="bg-white text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash color="red" size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Info sur l'image */}
        <div className="p-3 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-900 truncate">
            {imageName}
          </p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">{imageSize}</p>
            {isLocal && (
              <p className="text-xs text-orange-600">
                📁 Image locale (à uploader)
              </p>
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
          relative border-2 border-dashed rounded-lg text-center transition-colors ${getAspectRatioClass()}
          ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
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
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="inset-0 flex items-center justify-center px-4 py-6">
          <div className="space-y-6 w-full">
            <Image color="#3B82F6" size={48} className="mx-auto" />

            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                {isDragging
                  ? "Relâchez pour télécharger"
                  : "Télécharger une image"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Glissez-déposez une image ici ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Formats supportés: JPG, PNG, GIF, WebP (max 10MB)
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                disabled={disabled}
              >
                <Import color="#2563EB" size={16} className="mr-2" />
                Choisir une image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
