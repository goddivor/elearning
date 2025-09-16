import { useState, useEffect } from 'react';
import { User, Edit2, Save2, CloseSquare, Lock } from 'iconsax-react';
import useTitle from '@/hooks/useTitle';
import Button from '@/components/ui/Button';
import AvatarUpload from '@/components/ui/AvatarUpload';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { avatarService } from '@/services/avatarService';
import { useToast } from '@/context/toast-context';

const Profile = () => {
  useTitle("Mon Profil");

  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarToRemove, setAvatarToRemove] = useState(false);

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
      } = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };

      // Si l'utilisateur veut changer le mot de passe
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
          showError('Erreur avatar', 'Erreur lors de la suppression de l\'avatar');
        }
      } else if (avatarFile) {
        try {
          const response = await avatarService.uploadAvatar(avatarFile);
          updateData.avatar = response.avatarUrl;
        } catch (avatarError) {
          console.error('Erreur lors de l\'upload de l\'avatar:', avatarError);
          showError('Erreur avatar', 'Erreur lors de l\'upload de l\'avatar');
        }
      }

      // Mettre à jour le contexte d'authentification
      updateUser(updateData);

      setIsEditing(false);
      setShowPasswordFields(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarToRemove(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
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
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setShowPasswordFields(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarToRemove(false);
  };

  const handleAvatarSelect = (file: File) => {
    const validation = avatarService.validateImageFile(file);
    if (!validation.valid) {
      showError('Fichier invalide', validation.error || 'Erreur de validation du fichier');
      return;
    }

    setAvatarFile(file);
    setAvatarToRemove(false);

    // Créer une prévisualisation locale
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleAvatarRemove = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarToRemove(true);
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'instructor': return 'Instructeur';
      case 'student': return 'Étudiant';
      default: return 'Utilisateur';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <User size={32} color="#1D4ED8" variant="Bold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos informations personnelles
            </p>
          </div>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2"
          >
            <Edit2 size={16} color="#FFFFFF" />
            <span>Modifier</span>
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header with Avatar */}
        <div className="relative p-6 pb-0">
          <div className="flex items-center space-x-6">
            <AvatarUpload
              currentAvatar={
                avatarToRemove ? undefined :
                avatarPreview ||
                (user?.avatar ? avatarService.getAvatarUrl(user.avatar) : undefined)
              }
              userInitials={user?.firstName?.charAt(0) + (user?.lastName?.charAt(0) || '')}
              onAvatarSelect={handleAvatarSelect}
              onAvatarRemove={isEditing ? handleAvatarRemove : undefined}
              size={96}
              disabled={!isEditing}
            />

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-blue-600 font-medium">
                {getRoleDisplayName(user?.role)}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                }`}
              />
            </div>

            {/* Rôle (lecture seule) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <input
                type="text"
                value={getRoleDisplayName(user?.role)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            {/* Statut (lecture seule) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <div className="flex items-center space-x-2">
                <span className={`inline-block w-3 h-3 rounded-full ${user?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm font-medium">
                  {user?.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>

          {/* Password Section */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Lock size={20} color="#374151" />
                  <span>Changer le mot de passe</span>
                </h3>
                <button
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showPasswordFields ? 'Annuler' : 'Modifier le mot de passe'}
                </button>
              </div>

              {showPasswordFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Répétez le nouveau mot de passe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <CloseSquare size={16} color="#6B7280" />
                <span>Annuler</span>
              </Button>

              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save2 size={16} color="#FFFFFF" />
                <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;