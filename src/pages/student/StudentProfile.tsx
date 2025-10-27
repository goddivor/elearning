import { useState, useEffect } from 'react';
import { Edit2, Save2, CloseSquare, Lock, Camera, Profile2User } from 'iconsax-react';
import useTitle from '@/hooks/useTitle';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { avatarService } from '@/services/avatarService';
import { useToast } from '@/contexts/toast-context';
import { getFullFileUrl } from '@/utils/fileUtils';

const StudentProfile = () => {
  useTitle("Mon Profil");

  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarToRemove, setAvatarToRemove] = useState(false);

  // Banner
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerToRemove, setBannerToRemove] = useState(false);
  const [bannerPosition, setBannerPosition] = useState(50); // Position verticale en %
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(50);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = avatarService.validateImageFile(file);
    if (!validation.valid) {
      showError('Fichier invalide', validation.error || 'Erreur de validation du fichier');
      return;
    }

    setAvatarFile(file);
    setAvatarToRemove(false);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider l'image de bannière (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError('Fichier trop volumineux', 'La bannière ne doit pas dépasser 10MB');
      return;
    }

    if (!file.type.match(/^image\/(jpg|jpeg|png|gif)$/)) {
      showError('Format invalide', 'Seules les images JPG, PNG et GIF sont acceptées');
      return;
    }

    setBannerFile(file);
    setBannerToRemove(false);
    setBannerPosition(50); // Reset position
    const previewUrl = URL.createObjectURL(file);
    setBannerPreview(previewUrl);
  };

  const handleBannerMouseDown = (e: React.MouseEvent) => {
    if (!isEditing || !currentBannerUrl) return;
    setIsDraggingBanner(true);
    setDragStartY(e.clientY);
    setDragStartPosition(bannerPosition);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDraggingBanner) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - dragStartY;
      const bannerHeight = 192;
      const percentChange = (deltaY / bannerHeight) * 100;
      const newPosition = Math.max(0, Math.min(100, dragStartPosition + percentChange));
      setBannerPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDraggingBanner(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingBanner, dragStartY, dragStartPosition]);

  const handleAvatarRemove = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarToRemove(true);
  };

  const handleBannerRemove = () => {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerFile(null);
    setBannerPreview(null);
    setBannerToRemove(true);
    setBannerPosition(50);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const updateData: {
        firstName: string;
        lastName: string;
        email: string;
        password?: string;
        avatar?: string;
        bannerImage?: string;
      } = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };

      // Valider et mettre à jour le mot de passe
      if (showPasswordFields && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          showError('Erreur de validation', 'Les mots de passe ne correspondent pas');
          return;
        }
        if (formData.newPassword.length < 6) {
          showError('Erreur de validation', 'Le mot de passe doit contenir au moins 6 caractères');
          return;
        }
        updateData.password = formData.newPassword;
      }

      await userService.updateProfile(updateData);

      // Gérer l'avatar
      if (avatarToRemove) {
        try {
          await avatarService.removeAvatar();
          updateData.avatar = '';
        } catch (avatarError) {
          console.error('Erreur lors de la suppression de l\'avatar:', avatarError);
        }
      } else if (avatarFile) {
        try {
          const response = await avatarService.uploadAvatar(avatarFile);
          updateData.avatar = response.avatarUrl;
        } catch (avatarError) {
          console.error('Erreur lors de l\'upload de l\'avatar:', avatarError);
        }
      }

      // Gérer la bannière
      if (bannerToRemove) {
        try {
          await avatarService.removeBanner();
          updateData.bannerImage = '';
        } catch (bannerError) {
          console.error('Erreur lors de la suppression de la bannière:', bannerError);
        }
      } else if (bannerFile) {
        try {
          const response = await avatarService.uploadBanner(bannerFile);
          updateData.bannerImage = response.bannerUrl;
        } catch (bannerError) {
          console.error('Erreur lors de l\'upload de la bannière:', bannerError);
        }
      }

      updateUser(updateData);

      setIsEditing(false);
      setShowPasswordFields(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarToRemove(false);
      setBannerFile(null);
      setBannerPreview(null);
      setBannerToRemove(false);
      setFormData(prev => ({
        ...prev,
        newPassword: '',
        confirmPassword: ''
      }));

      success('Profil mis à jour', 'Vos informations ont été mises à jour avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      showError('Erreur de mise à jour', 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setShowPasswordFields(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarToRemove(false);
    setBannerFile(null);
    setBannerPreview(null);
    setBannerToRemove(false);
  };

  const currentBannerUrl = bannerToRemove
    ? null
    : bannerPreview || (user?.bannerImage ? getFullFileUrl(user.bannerImage) : null);

  const currentAvatarUrl = avatarToRemove
    ? null
    : avatarPreview || (user?.avatar ? getFullFileUrl(user.avatar) : null);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Card with Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div
          className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden"
          style={{ cursor: isEditing && currentBannerUrl ? 'ns-resize' : 'default' }}
        >
          {currentBannerUrl && (
            <>
              <img
                src={currentBannerUrl}
                alt="Banner"
                className="w-full h-full object-cover select-none"
                style={{
                  objectPosition: `center ${bannerPosition}%`,
                  pointerEvents: isDraggingBanner ? 'none' : 'auto'
                }}
                onMouseDown={handleBannerMouseDown}
                draggable={false}
              />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/40 text-white px-4 py-2 rounded-lg text-sm font-medium opacity-0 hover:opacity-100 transition-opacity">
                    ↕ Glissez pour ajuster la position
                  </div>
                </div>
              )}
            </>
          )}

          {isEditing && (
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerSelect}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors">
                  <Camera size={16} color="#374151" />
                  <span className="text-sm font-medium text-gray-700">
                    Changer bannière
                  </span>
                </div>
              </label>

              {currentBannerUrl && (
                <button
                  onClick={handleBannerRemove}
                  className="px-3 py-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg shadow-lg transition-colors text-sm font-medium"
                >
                  Retirer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                  {currentAvatarUrl ? (
                    <img
                      src={currentAvatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="absolute bottom-0 right-0 flex gap-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                      <div className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 transition-colors">
                        <Camera size={18} color="#374151" />
                      </div>
                    </label>
                    {currentAvatarUrl && (
                      <button
                        onClick={handleAvatarRemove}
                        className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full shadow-lg flex items-center justify-center border-2 border-white transition-colors"
                        title="Supprimer l'avatar"
                      >
                        <span className="text-white text-lg font-bold">×</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-blue-600 font-medium flex items-center gap-2 mt-1">
                  <Profile2User size={16} color="#2563EB" />
                  Étudiant
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 mb-2"
              >
                <Edit2 size={16} color="#FFFFFF" />
                Modifier le profil
              </Button>
            )}
          </div>

          {/* Form */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prénom */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            {/* Password Section */}
            {isEditing && (
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Lock size={20} color="#374151" />
                    Changer le mot de passe
                  </h3>
                  <button
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showPasswordFields ? 'Annuler' : 'Modifier'}
                  </button>
                </div>

                {showPasswordFields && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Minimum 6 caractères"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Répétez le mot de passe"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {isEditing && (
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <CloseSquare size={16} color="#6B7280" />
                  Annuler
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save2 size={16} color="#FFFFFF" />
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
