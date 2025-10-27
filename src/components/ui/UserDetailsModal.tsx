import { forwardRef, useImperativeHandle, useState } from 'react';
import { Profile, Calendar, UserTag, Status, StatusUp, Message } from 'iconsax-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { ModalRef } from '@/types/modal-ref';
import { X } from '@phosphor-icons/react';
import { getFullFileUrl } from '@/utils/fileUtils';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'instructor' | 'student' | 'organization';
  isActive: boolean;
  avatar?: string;
  bannerImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserDetailsModalProps {
  user?: User | null;
  onEdit?: (user: User) => void;
  onClose?: () => void;
}

const UserDetailsModal = forwardRef<ModalRef, UserDetailsModalProps>(
  ({ user, onEdit, onClose }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    const handleClose = () => {
      onClose?.();
      setIsOpen(false);
    };

    const handleEdit = () => {
      if (user && onEdit) {
        onEdit(user);
        handleClose();
      }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const getRoleLabel = (role: string) => {
      switch (role) {
        case 'admin': return 'Administrateur';
        case 'instructor': return 'Instructeur';
        case 'student': return 'Étudiant';
        default: return role;
      }
    };

    const getRoleBadge = (role: string) => {
      switch (role) {
        case 'admin': return <Badge variant="danger" size="sm">Administrateur</Badge>;
        case 'instructor': return <Badge variant="primary" size="sm">Instructeur</Badge>;
        case 'student': return <Badge variant="success" size="sm">Étudiant</Badge>;
        default: return <Badge variant="default" size="sm">{role}</Badge>;
      }
    };

    if (!isOpen || !user) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 my-8 max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Profile size={24} color="#1D4ED8" variant="Bold" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Détails de l'utilisateur
                </h2>
                <p className="text-sm text-gray-500">
                  Informations complètes du profil utilisateur
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} color="#6B7280" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Banner Image */}
            {user.bannerImage && (
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                <img
                  src={getFullFileUrl(user.bannerImage)}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Avatar and Basic Info */}
              <div className={`flex items-center space-x-6 ${user.bannerImage ? '-mt-16' : ''}`}>
                <div className="flex-shrink-0 relative z-10">
                  {user.avatar ? (
                    <img
                      src={getFullFileUrl(user.avatar)}
                      alt={`${user.firstName} ${user.lastName}`}
                      className={`w-20 h-20 rounded-full object-cover ${user.bannerImage ? 'border-4 border-white shadow-lg' : 'border-4 border-blue-100'}`}
                    />
                  ) : (
                    <div className={`w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center ${user.bannerImage ? 'border-4 border-white shadow-lg' : 'border-4 border-blue-200'}`}>
                      <span className="text-2xl font-semibold text-blue-600">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 relative z-10">
                  <h3 className={`text-2xl font-bold text-gray-900 ${user.bannerImage ? 'bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-md inline-block' : ''}`}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <div className="flex items-center space-x-3 mt-2">
                    {getRoleBadge(user.role)}
                    <Badge
                      variant={user.isActive ? 'success' : 'default'}
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      {user.isActive ? (
                        <StatusUp size={12} color="currentColor" />
                      ) : (
                        <Status size={12} color="currentColor" />
                      )}
                      <span>{user.isActive ? 'Actif' : 'Inactif'}</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations de contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Message size={16} color="#1D4ED8" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <UserTag size={16} color="#059669" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Rôle
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {getRoleLabel(user.role)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations du compte
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar size={16} color="#7C3AED" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Créé le
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar size={16} color="#F59E0B" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Dernière modification
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(user.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User ID for admin reference */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations techniques
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Identifiant utilisateur
                  </p>
                  <code className="text-sm font-mono text-gray-700 bg-white px-2 py-1 rounded border">
                    {user.id}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Fermer
            </Button>
            <Button
              onClick={handleEdit}
              className="flex items-center space-x-2"
            >
              <Profile size={16} color="white" />
              <span>Modifier</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

UserDetailsModal.displayName = 'UserDetailsModal';

export default UserDetailsModal;