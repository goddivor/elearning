import { useState, useEffect, useRef } from 'react';
import { Edit2, Save2, CloseSquare, Lock, Camera, Profile2User, Location, Link2, Add, Trash, Global } from 'iconsax-react';
import useTitle from '@/hooks/useTitle';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { avatarService } from '@/services/avatarService';
import { useToast } from '@/contexts/toast-context';
import { getFullFileUrl } from '@/utils/fileUtils';
import AvatarModal from '@/components/AvatarModal';

const StudentProfile = () => {
  useTitle("Mon Profil");

  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    aboutMe: user?.aboutMe || '',
    location: user?.location || '',
    socialLinks: user?.socialLinks || [],
    tags: user?.tags || [],
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newLink, setNewLink] = useState('');

  // Banner
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        aboutMe: user.aboutMe || '',
        location: user.location || '',
        socialLinks: user.socialLinks || [],
        tags: user.tags || []
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showError('Fichier trop volumineux', 'La bannière ne doit pas dépasser 10MB');
      return;
    }

    if (!file.type.match(/^image\/(jpg|jpeg|png|gif)$/)) {
      showError('Format invalide', 'Seules les images JPG, PNG et GIF sont acceptées');
      return;
    }

    setBannerFile(file);
    const previewUrl = URL.createObjectURL(file);
    setBannerPreview(previewUrl);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const response = await avatarService.uploadAvatar(file);
      updateUser({ avatar: response.avatarUrl });
      success('Avatar mis à jour', 'Votre avatar a été modifié avec succès!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showError('Erreur', 'Erreur lors de la mise à jour de l\'avatar');
      throw error;
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await avatarService.removeAvatar();
      updateUser({ avatar: '' });
      success('Avatar supprimé', 'Votre avatar a été supprimé avec succès!');
    } catch (error) {
      console.error('Error deleting avatar:', error);
      showError('Erreur', 'Erreur lors de la suppression de l\'avatar');
      throw error;
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddLink = () => {
    if (newLink.trim() && !formData.socialLinks.includes(newLink.trim())) {
      setFormData(prev => ({
        ...prev,
        socialLinks: [...prev.socialLinks, newLink.trim()]
      }));
      setNewLink('');
    }
  };

  const handleRemoveLink = (linkToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(link => link !== linkToRemove)
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        aboutMe: formData.aboutMe,
        location: formData.location,
        socialLinks: formData.socialLinks,
        tags: formData.tags
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

      // Gérer la bannière
      if (bannerFile) {
        try {
          const response = await avatarService.uploadBanner(bannerFile);
          updateData.bannerImage = response.bannerUrl;
        } catch (bannerError) {
          console.error('Erreur lors de l\'upload de la bannière:', bannerError);
        }
      }

      await userService.updateProfile(updateData);
      updateUser(updateData);

      setIsEditing(false);
      setShowPasswordFields(false);
      setBannerFile(null);
      setBannerPreview(null);
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
      aboutMe: user?.aboutMe || '',
      location: user?.location || '',
      socialLinks: user?.socialLinks || [],
      tags: user?.tags || [],
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setShowPasswordFields(false);
    setBannerFile(null);
    setBannerPreview(null);
  };

  const currentBannerUrl = bannerPreview || (user?.bannerImage ? getFullFileUrl(user.bannerImage) : null);
  const currentAvatarUrl = user?.avatar ? getFullFileUrl(user.avatar) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Card with Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner - More space */}
        <div
          className="relative h-72 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 overflow-hidden group"
          onMouseEnter={() => setIsBannerHovered(true)}
          onMouseLeave={() => setIsBannerHovered(false)}
        >
          {currentBannerUrl && (
            <img
              src={currentBannerUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}

          {/* Edit Banner Overlay on Hover */}
          {isBannerHovered && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 bg-white/95 hover:bg-white rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                <Camera size={20} color="#374151" />
                <span className="text-sm font-semibold text-gray-800">Modifier la couverture</span>
              </button>
            </div>
          )}

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerSelect}
            className="hidden"
          />
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-20 mb-6">
            <div className="flex items-end gap-6">
              {/* Avatar with hover effect */}
              <div
                className="relative cursor-pointer group"
                onClick={() => setShowAvatarModal(true)}
              >
                <div className="w-40 h-40 rounded-full border-4 border-white bg-white overflow-hidden shadow-xl">
                  {currentAvatarUrl ? (
                    <img
                      src={currentAvatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-5xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Avatar Overlay on Hover */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={32} color="#FFFFFF" />
                </div>
              </div>

              {/* User Info */}
              <div className="pb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-blue-600 font-medium flex items-center gap-2 mt-2">
                  <Profile2User size={18} color="#2563EB" />
                  Étudiant
                </p>
                {formData.location && (
                  <p className="text-gray-600 text-sm mt-2 flex items-center gap-2">
                    <Location size={16} color="#6B7280" />
                    {formData.location}
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-2">
                  Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>

            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 mb-4"
              >
                <Edit2 size={18} color="#FFFFFF" />
                Modifier le profil
              </Button>
            )}
          </div>

          {/* About Me Section */}
          {(formData.aboutMe || isEditing) && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">À propos</h3>
              {isEditing ? (
                <textarea
                  name="aboutMe"
                  value={formData.aboutMe}
                  onChange={handleInputChange}
                  placeholder="Parlez-nous de vous..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{formData.aboutMe}</p>
              )}
            </div>
          )}

          {/* Tags Section */}
          {(formData.tags.length > 0 || isEditing) && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Centres d'intérêt</h3>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {isEditing && (
                  <div className="inline-flex items-center gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Nouveau tag"
                      className="px-3 py-1.5 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleAddTag}
                      className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Add size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links Section */}
          {(formData.socialLinks.length > 0 || isEditing) && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Liens</h3>
              <div className="space-y-2">
                {formData.socialLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Link2 size={18} color="#6B7280" />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-blue-600 hover:text-blue-700 text-sm truncate"
                    >
                      {link}
                    </a>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveLink(link)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="url"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                      placeholder="https://..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleAddLink}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Add size={16} />
                      <span className="text-sm font-medium">Ajouter</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>

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
              <div>
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

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Location size={16} color="#374151" />
                    Localisation
                  </span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Ville, Pays"
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

      {/* Avatar Modal */}
      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        avatarUrl={user?.avatar}
        userName={`${user?.firstName || ''} ${user?.lastName || ''}`}
        onUpload={handleAvatarUpload}
        onDelete={handleAvatarDelete}
      />
    </div>
  );
};

export default StudentProfile;
