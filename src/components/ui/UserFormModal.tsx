import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Profile, Save2, UserAdd} from 'iconsax-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { X } from "@phosphor-icons/react";
import type { ModalRef } from '@/types/modal-ref';

interface UserFormModalProps {
  user?: User | null;
  onSave: (userData: UserFormData) => void;
  onCancel?: () => void;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'admin' | 'instructor' | 'student';
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


const UserFormModal = forwardRef<ModalRef, UserFormModalProps>(
  ({ user, onSave, onCancel }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'student',
    });
    const [errors, setErrors] = useState<Partial<UserFormData>>({});

    const isEditMode = !!user;

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    // Reset form when modal opens/closes or user changes
    useEffect(() => {
      if (isOpen) {
        if (user) {
          // Edit mode - populate form with user data
          setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          });
        } else {
          // Create mode - reset form
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'student',
          });
        }
        setErrors({});
      }
    }, [isOpen, user]);

    const handleInputChange = (field: keyof UserFormData, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
      
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

    const validateForm = (): boolean => {
      const newErrors: Partial<UserFormData> = {};

      if (!formData.firstName.trim()) {
        newErrors.firstName = 'Le prénom est requis';
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Le nom est requis';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Format d\'email invalide';
      }

      if (!isEditMode && !formData.password?.trim()) {
        newErrors.password = 'Le mot de passe est requis';
      }

      if (!isEditMode && formData.password && formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSave(formData);
        setIsOpen(false);
      } catch (error) {
        console.error('Error saving user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleCancel = () => {
      onCancel?.();
      setIsOpen(false);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleCancel();
      }
    };

    if (!isOpen) return null;

    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/20 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {isEditMode ? (
          <Profile size={24} color="#1D4ED8" variant="Bold" />
            ) : (
          <UserAdd size={24} color="#1D4ED8" variant="Bold" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
          {isEditMode ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}
            </h2>
            <p className="text-sm text-gray-500">
          {isEditMode 
            ? "Modifiez les informations de l'utilisateur" 
            : "Ajoutez un nouvel utilisateur au système"
          }
            </p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} color="#6B7280" />
        </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Prénom *"
              placeholder="Entrez le prénom"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <Input
              label="Nom *"
              placeholder="Entrez le nom"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informations de connexion
            </h3>
            <div className="space-y-4">
          <div>
            <Input
              type="email"
              label="Email *"
              placeholder="exemple@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          {!isEditMode && (
            <div>
              <Input
            type="password"
            label="Mot de passe *"
            placeholder="Mot de passe (min 6 caractères)"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
              />
              {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
          )}
            </div>
          </div>

          {/* Role Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
          Rôle et permissions
            </h3>
            <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rôle *
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value as 'admin' | 'instructor' | 'student')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="student">Étudiant</option>
            <option value="instructor">Instructeur</option>
            <option value="admin">Administrateur</option>
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.role === 'admin' && (
              <Badge variant="danger" size="sm">
            Accès complet au système
              </Badge>
            )}
            {formData.role === 'instructor' && (
              <Badge variant="primary" size="sm">
            Gestion des cours et étudiants
              </Badge>
            )}
            {formData.role === 'student' && (
              <Badge variant="success" size="sm">
            Accès aux cours assignés
              </Badge>
            )}
          </div>
            </div>
          </div>

          {/* Information notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
          <div className="flex-shrink-0">
            <Profile size={20} color="#3B82F6" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">
              Informations importantes
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              {isEditMode 
            ? "Les modifications seront appliquées immédiatement après la sauvegarde."
            : "Un compte sera créé avec les informations saisies. L'utilisateur pourra se connecter avec ces identifiants."
              }
            </p>
          </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Enregistrement...</span>
          </>
            ) : (
          <>
            <Save2 size={16} color="white" />
            <span>{isEditMode ? "Modifier" : "Créer"}</span>
          </>
            )}
          </Button>
        </div>
          </form>
        </div>
      </div>
    );
  }
);

UserFormModal.displayName = 'UserFormModal';

export default UserFormModal;