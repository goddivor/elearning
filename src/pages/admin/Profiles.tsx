import { useState, useEffect, useCallback, useRef } from 'react';
import { Profile2User, Edit, Trash, ToggleOff, ToggleOn, Add } from 'iconsax-react';
import useTitle from '@/hooks/useTitle';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import roleBasedProfileService from '@/services/roleBasedProfileService';
import type { RoleBasedProfile, CreateRoleBasedProfileDto } from '@/types/role-permissions';
import type { ModalRef } from '@/types/modal-ref';
import RoleBasedProfileForm from '@/components/admin/RoleBasedProfileForm';
import ConfirmationModal from '@/components/modals/confirmation-modal';
import { useToast } from '@/contexts/toast-context';

const AdminProfiles = () => {
  useTitle("Gestion des Profils");

  const [profiles, setProfiles] = useState<RoleBasedProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<RoleBasedProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<RoleBasedProfile | null>(null);
  const confirmModalRef = useRef<ModalRef>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const profilesData = await roleBasedProfileService.getAllProfiles();
      setProfiles(profilesData);
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error);
      showToast('Erreur lors du chargement des profils', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProfile = () => {
    setSelectedProfile(null);
    setShowProfileModal(true);
  };

  const handleEditProfile = (profile: RoleBasedProfile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const handleDeleteProfile = (profile: RoleBasedProfile) => {
    if (profile.isSystemProfile) {
      showToast('Impossible de supprimer un profil système', 'error');
      return;
    }
    setProfileToDelete(profile);
    confirmModalRef.current?.open();
  };

  const confirmDelete = async () => {
    if (!profileToDelete) return;

    try {
      await roleBasedProfileService.deleteProfile(profileToDelete._id!);
      showToast('Profil supprimé avec succès', 'success');
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('Erreur lors de la suppression du profil', 'error');
    } finally {
      setProfileToDelete(null);
      confirmModalRef.current?.close();
    }
  };

  const handleToggleStatus = async (profile: RoleBasedProfile) => {
    try {
      await roleBasedProfileService.toggleProfileStatus(profile._id!);
      showToast(
        `Profil ${profile.isActive ? 'désactivé' : 'activé'} avec succès`,
        'success'
      );
      loadData();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      showToast('Erreur lors de la modification du statut', 'error');
    }
  };

  const handleSaveProfile = async (profileData: CreateRoleBasedProfileDto) => {
    try {
      if (selectedProfile) {
        await roleBasedProfileService.updateProfile(selectedProfile._id!, profileData);
        showToast('Profil mis à jour avec succès', 'success');
      } else {
        await roleBasedProfileService.createProfile(profileData);
        showToast('Profil créé avec succès', 'success');
      }
      setShowProfileModal(false);
      loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showToast('Erreur lors de la sauvegarde du profil', 'error');
    }
  };

  const profileColumns: Column<RoleBasedProfile>[] = [
    {
      key: 'name',
      title: 'Nom du profil',
      render: (_, profile) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full mr-3 flex items-center justify-center bg-blue-100">
            <span className="text-sm font-semibold text-blue-600">
              {profile.usersCount || 0}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {profile.name}
            </div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {profile.description}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'baseRole',
      title: 'Rôle de base',
      render: (baseRole) => (
        <Badge
          variant={baseRole === 'instructor' ? 'primary' : 'success'}
          size="sm"
        >
          {baseRole === 'instructor' ? 'Instructeur' : 'Étudiant'}
        </Badge>
      )
    },
    {
      key: 'permissions',
      title: 'Permissions',
      render: (_, profile) => {
        const enabledPages = profile.permissions.filter(p => p.enabled);
        return (
          <div className="flex flex-wrap gap-1">
            {enabledPages.slice(0, 3).map((perm, index) => (
              <Badge key={index} variant="default" size="sm">
                {perm.pageName}
              </Badge>
            ))}
            {enabledPages.length > 3 && (
              <Badge variant="default" size="sm">
                +{enabledPages.length - 3}
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'isSystemProfile',
      title: 'Type',
      render: (isSystemProfile) => (
        <Badge
          variant={isSystemProfile ? 'danger' : 'primary'}
          size="sm"
        >
          {isSystemProfile ? 'Système' : 'Personnalisé'}
        </Badge>
      )
    },
    {
      key: 'isActive',
      title: 'Statut',
      render: (isActive, profile) => (
        <Button
          onClick={() => handleToggleStatus(profile)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          {isActive ? (
            <ToggleOn size={20} color="#059669" />
          ) : (
            <ToggleOff size={20} color="#DC2626" />
          )}
          <Badge
            variant={isActive ? 'success' : 'default'}
            size="sm"
          >
            {isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </Button>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, profile) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleEditProfile(profile)}
            variant="ghost"
            size="sm"
          >
            <Edit size={16} color="#6B7280" />
          </Button>
          {!profile.isSystemProfile && (
            <Button
              onClick={() => handleDeleteProfile(profile)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash size={16} color="#DC2626" />
            </Button>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Créé le',
      render: (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '-'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Profile2User size={32} color="#7C3AED" variant="Bold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion des Profils
            </h1>
            <p className="text-gray-600 mt-1">
              Créez et gérez les profils d'autorisation
            </p>
          </div>
        </div>

        <Button
          onClick={handleCreateProfile}
          className="flex items-center gap-2"
          style={{ backgroundColor: '#7C3AED' }}
        >
          <Add size={20} color="white" />
          Nouveau Profil
        </Button>
      </div>

      {/* Profiles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Liste des Profils</h2>
              <p className="text-sm text-gray-500 mt-1">
                Gérez les profils et leurs permissions
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {profiles.length} profil{profiles.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <DataTable
          columns={profileColumns}
          data={profiles}
          loading={loading}
          emptyState={
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Profile2User size={32} color="#7C3AED" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun profil trouvé
              </h3>
              <p className="text-gray-500 mb-6">
                Créez votre premier profil pour commencer à gérer les permissions
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={handleCreateProfile}
                  className="flex items-center gap-2"
                  style={{ backgroundColor: '#7C3AED' }}
                >
                  <Add size={20} color="white" />
                  Créer un profil
                </Button>
              </div>
            </div>
          }
        />
      </div>

      {/* Profile Form Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title={selectedProfile ? 'Modifier le Profil' : 'Nouveau Profil'}
        size="lg"
      >
        <RoleBasedProfileForm
          profile={selectedProfile}
          onSave={handleSaveProfile}
          onCancel={() => setShowProfileModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        ref={confirmModalRef}
        onConfirm={confirmDelete}
        onCancel={() => setProfileToDelete(null)}
        title="Supprimer le Profil"
        message={`Êtes-vous sûr de vouloir supprimer le profil "${profileToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
};

export default AdminProfiles;