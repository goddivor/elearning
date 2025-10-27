/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { People, Eye, Edit, StatusUp, Status, Trash, Buildings2 } from 'iconsax-react';
import useTitle from '@/hooks/useTitle';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import UsersOverviewCards from '@/components/ui/UsersOverviewCards';
import UsersRoleTabs from '@/components/ui/UsersRoleTabs';
import UsersFilters from '@/components/ui/UsersFilters';
import UserFormModal, { type UserFormData } from '@/components/ui/UserFormModal';
import UserDetailsModal from '@/components/ui/UserDetailsModal';
import ConfirmationModal from '@/components/modals/confirmation-modal';
import CsvImportModal from '@/components/modals/CsvImportModal';
import CsvExportModal from '@/components/modals/CsvExportModal';
import type { ModalRef } from '@/types/modal-ref';
import { userService, type User, type UpdateUserDto, type CreateUserDto } from '@/services/userService';
import { useToast } from '@/contexts/toast-context';
import { useAuth } from '@/contexts/AuthContext';
import { avatarService } from '@/services/avatarService';

const AdminUsers = () => {
  useTitle("Gestion des Utilisateurs");

  const toast = useToast();
  const { user: currentUser } = useAuth();


  // Fonction utilitaire pour obtenir l'ID du currentUser
  const getCurrentUserId = () => {
    return currentUser?._id || (currentUser as any)?.id;
  };

  // Fonction utilitaire pour vérifier si un utilisateur est l'admin connecté
  const isCurrentUser = (userId: string) => {
    const currentUserId = getCurrentUserId();
    return userId === currentUserId;
  };

  // Fonction utilitaire pour vérifier si un utilisateur a un rôle spécifique
  const userHasRole = (user: User, roleToCheck: string) => {
    if (roleToCheck === 'organization') {
      // Pour le rôle organisation, vérifier dans le tableau roles
      return user.roles && user.roles.includes('organization');
    }
    // Pour les autres rôles, vérifier le rôle principal
    return user.role === roleToCheck;
  };
  const userFormModalRef = useRef<ModalRef>(null);
  const userDetailsModalRef = useRef<ModalRef>(null);
  const confirmationModalRef = useRef<ModalRef>(null);
  const csvImportModalRef = useRef<ModalRef>(null);
  const csvExportModalRef = useRef<ModalRef>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToView, setUserToView] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [bulkDeleteUsers, setBulkDeleteUsers] = useState<User[]>([]);
  
  // Role tabs state
  const [activeRole, setActiveRole] = useState<'admin' | 'instructor' | 'student' | 'organization' | 'all'>('all');
  
  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    createdAfter: '',
    createdBefore: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);

    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    // Empêcher l'admin de modifier son propre statut
    if (isCurrentUser(userId)) {
      toast.warning(
        'Action non autorisée',
        'Vous ne pouvez pas modifier le statut de votre propre compte'
      );
      return;
    }

    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (isActive) {
        await userService.deactivateUser(userId);
        toast.success(
          'Utilisateur désactivé',
          `${user.firstName} ${user.lastName} a été désactivé`
        );
      } else {
        await userService.activateUser(userId);
        toast.success(
          'Utilisateur activé',
          `${user.firstName} ${user.lastName} a été activé`
        );
      }
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inattendue s\'est produite';
      toast.error('Erreur lors de la modification du statut', errorMessage);
      console.error('Erreur lors de la modification du statut:', error);
    }
  };


  const handleDeleteUser = (userId: string) => {
    // Empêcher l'admin de supprimer son propre compte
    if (isCurrentUser(userId)) {
      toast.warning(
        'Action non autorisée',
        'Vous ne pouvez pas supprimer votre propre compte'
      );
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUserToDelete(user);
    confirmationModalRef.current?.open();
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await userService.deleteUser(userToDelete.id);
      toast.success(
        'Utilisateur supprimé',
        `${userToDelete.firstName} ${userToDelete.lastName} a été supprimé avec succès`
      );
      loadUsers();
      setUserToDelete(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inattendue s\'est produite';
      toast.error('Erreur lors de la suppression', errorMessage);
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const cancelDeleteUser = () => {
    setUserToDelete(null);
  };

  const handleUserSave = async (userData: UserFormData) => {
    try {
      if (userToEdit) {
        // Edit existing user
        const updateData: UpdateUserDto = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          profiles: userData.profileId ? [userData.profileId] : [],
        };

        // Include password if resetPassword is true
        if (userData.resetPassword && userData.password) {
          updateData.password = userData.password;
        }
        await userService.updateUser(userToEdit.id, updateData);
        toast.success(
          'Utilisateur modifié',
          `${userData.firstName} ${userData.lastName} a été modifié avec succès`
        );
      } else {
        // Create new user
        if (!userData.password) {
          toast.error('Erreur de validation', 'Le mot de passe est requis pour créer un nouvel utilisateur');
          return;
        }
        const createData: CreateUserDto = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          profiles: userData.profileId ? [userData.profileId] : [],
        };
        await userService.createUser(createData);
        toast.success(
          'Utilisateur créé',
          `${userData.firstName} ${userData.lastName} a été créé avec succès`
        );
      }
      loadUsers();
      setUserToEdit(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inattendue s\'est produite';
      toast.error(
        userToEdit ? 'Erreur lors de la modification' : 'Erreur lors de la création',
        errorMessage
      );
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleUserFormCancel = () => {
    setUserToEdit(null);
  };

  const handleViewUser = (user: User) => {
    setUserToView(user);
    userDetailsModalRef.current?.open();
  };

  const handleUserDetailsClose = () => {
    setUserToView(null);
  };

  const handleEditFromDetails = (user: User) => {
    setUserToEdit(user);
    userFormModalRef.current?.open();
  };

  // Filter functions
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      role: '',
      status: '',
      createdAfter: '',
      createdBefore: ''
    });
    toast.info(
      'Filtres réinitialisés',
      'Tous les filtres ont été effacés',
      { duration: 2000 }
    );
  };

  // Handler functions for role tabs
  const handleCreateUser = () => {
    setUserToEdit(null);
    userFormModalRef.current?.open();
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    userFormModalRef.current?.open();
  };

  const handleImportUsers = () => {
    csvImportModalRef.current?.open();
  };

  const handleExportUsers = () => {
    csvExportModalRef.current?.open();
  };

  // Bulk actions handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableUsers = filteredUsers
        .filter(user => !isCurrentUser(user.id))
        .map(user => user.id);
      setSelectedUsers(selectableUsers);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkActivate = async () => {
    try {
      const promises = selectedUsers.map(userId => userService.activateUser(userId));
      await Promise.all(promises);
      
      toast.success(
        'Utilisateurs activés',
        `${selectedUsers.length} utilisateur${selectedUsers.length > 1 ? 's ont été activés' : ' a été activé'}`
      );
      
      setSelectedUsers([]);
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inattendue s\'est produite';
      toast.error('Erreur lors de l\'activation', errorMessage);
      console.error('Erreur lors de l\'activation en lot:', error);
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const promises = selectedUsers.map(userId => userService.deactivateUser(userId));
      await Promise.all(promises);
      
      toast.success(
        'Utilisateurs désactivés',
        `${selectedUsers.length} utilisateur${selectedUsers.length > 1 ? 's ont été désactivés' : ' a été désactivé'}`
      );
      
      setSelectedUsers([]);
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inattendue s\'est produite';
      toast.error('Erreur lors de la désactivation', errorMessage);
      console.error('Erreur lors de la désactivation en lot:', error);
    }
  };

  const handleBulkDelete = () => {
    const usersToDelete = users.filter(user => selectedUsers.includes(user.id));
    setBulkDeleteUsers(usersToDelete);
    confirmationModalRef.current?.open();
  };

  const handleAssignOrganizationRole = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      await userService.assignOrganizationRole(userId);
      toast.success(
        'Rôle organisation assigné',
        `Le rôle organisation a été assigné à ${user.firstName} ${user.lastName}`
      );
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inattendue s\'est produite';
      toast.error('Erreur lors de l\'assignation du rôle', errorMessage);
      console.error('Erreur lors de l\'assignation du rôle organisation:', error);
    }
  };

  const handleRemoveOrganizationRole = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      await userService.removeOrganizationRole(userId);
      toast.success(
        'Rôle organisation retiré',
        `Le rôle organisation a été retiré de ${user.firstName} ${user.lastName}`
      );
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inattendue s\'est produite';
      toast.error('Erreur lors du retrait du rôle', errorMessage);
      console.error('Erreur lors du retrait du rôle organisation:', error);
    }
  };

  const confirmBulkDelete = async () => {
    if (bulkDeleteUsers.length === 0) return;

    try {
      const promises = bulkDeleteUsers.map(user => userService.deleteUser(user.id));
      await Promise.all(promises);
      
      toast.success(
        'Utilisateurs supprimés',
        `${bulkDeleteUsers.length} utilisateur${bulkDeleteUsers.length > 1 ? 's ont été supprimés' : ' a été supprimé'}`
      );
      
      setBulkDeleteUsers([]);
      setSelectedUsers([]);
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inattendue s\'est produite';
      toast.error('Erreur lors de la suppression', errorMessage);
      console.error('Erreur lors de la suppression en lot:', error);
    }
  };

  const cancelBulkDelete = () => {
    setBulkDeleteUsers([]);
  };

  // CSV Import handler
  const handleCsvImport = async (importedUsers: any[]) => {
    try {
      // Nettoyer les données en supprimant les propriétés de validation côté client
      const cleanUsers = importedUsers
        .filter(user => user.isValid) // Ne garder que les utilisateurs valides
        .map(user => {
          const { isValid, errors, ...cleanUser } = user;
          return cleanUser;
        });
      
      const result = await userService.bulkImportUsers(cleanUsers);
      
      // Show detailed results
      if (result.details.duplicates.length > 0) {
        toast.warning(
          'Importation partielle',
          `${result.summary.created} utilisateurs créés, ${result.details.duplicates.length} doublons ignorés`
        );
      }
      
      if (result.details.errors.length > 0) {
        toast.error(
          'Erreurs d\'importation',
          `${result.details.errors.length} erreurs détectées`
        );
      }
      
      // Reload users list
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inattendue s\'est produite';
      toast.error('Erreur d\'importation', errorMessage);
      console.error('Erreur lors de l\'importation:', error);
    }
  };

  // Calculate role counts
  const roleCounts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    instructor: users.filter(u => u.role === 'instructor').length,
    student: users.filter(u => u.role === 'student').length,
    organization: users.filter(u => userHasRole(u, 'organization')).length,
  };

  // Calculate statistics for overview cards
  const userStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalInstructors: users.filter(u => u.role === 'instructor').length,
    totalStudents: users.filter(u => u.role === 'student').length,
    inactiveUsers: users.filter(u => !u.isActive).length,
    newUsersThisMonth: users.filter(u => {
      const createdDate = new Date(u.createdAt);
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return createdDate >= firstDayOfMonth;
    }).length,
  };

  // Apply filters to users
  const filteredUsers = users.filter(user => {
    // Active role filter
    if (activeRole !== 'all' && !userHasRole(user, activeRole)) {
      return false;
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Role filter (from advanced filters)
    if (filters.role && !userHasRole(user, filters.role)) {
      return false;
    }

    // Status filter  
    if (filters.status) {
      const isActive = user.isActive;
      if (filters.status === 'active' && !isActive) return false;
      if (filters.status === 'inactive' && isActive) return false;
    }

    // Date filters
    if (filters.createdAfter) {
      const createdDate = new Date(user.createdAt);
      const afterDate = new Date(filters.createdAfter);
      if (createdDate < afterDate) return false;
    }

    if (filters.createdBefore) {
      const createdDate = new Date(user.createdAt);
      const beforeDate = new Date(filters.createdBefore);
      if (createdDate > beforeDate) return false;
    }

    return true;
  });

  const userColumns: Column<User>[] = [
    {
      key: 'select',
      title: (
        <input
          type="checkbox"
          checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.filter(u => !isCurrentUser(u.id)).length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      width: '50px',
      render: (_, user) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers([...selectedUsers, user.id]);
            } else {
              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
            }
          }}
          disabled={isCurrentUser(user.id)}
          className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
            isCurrentUser(user.id) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      )
    },
    {
      key: 'firstName',
      title: 'Utilisateur',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full mr-3 overflow-hidden">
            {user.avatar ? (
              <img
                src={avatarService.getAvatarUrl(user.avatar)}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Rôle',
      sortable: true,
      render: (role, user) => (
        <div className="flex flex-col items-start space-y-1">
          <Badge
            variant={
              role === 'admin' ? 'danger' :
              role === 'instructor' ? 'primary' :
              role === 'organization' ? 'warning' : 'success'
            }
            size="sm"
          >
            {role === 'admin' ? 'Administrateur' :
             role === 'instructor' ? 'Instructeur' :
             role === 'organization' ? 'Organisation' : 'Étudiant'}
          </Badge>
          {user.roles && user.roles.includes('organization') && user.role !== 'organization' && (
            <Badge variant="default" size="sm" className="text-xs">
              + Organisation
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Statut',
      sortable: true,
      render: (isActive, user) => (
        <Button
          onClick={() => handleToggleUserStatus(user.id, isActive)}
          variant="ghost"
          size="sm"
          disabled={isCurrentUser(user.id)}
          className={isCurrentUser(user.id) ? 'cursor-not-allowed opacity-50' : ''}
          title={isCurrentUser(user.id) ? 'Vous ne pouvez pas modifier le statut de votre propre compte' : undefined}
        >
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
      key: 'createdAt',
      title: 'Inscription',
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString('fr-FR')
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '250px',
      render: (_, user) => (
        <div className="flex items-center space-x-1 justify-end">
          <Button
            onClick={() => handleViewUser(user)}
            variant="ghost"
            size="sm"
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
            title="Voir détails"
          >
            <Eye size={16} color="currentColor" />
          </Button>

          <Button
            onClick={() => handleEditUser(user)}
            variant="ghost"
            size="sm"
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
            title="Modifier"
          >
            <Edit size={16} color="currentColor" />
          </Button>

          {/* Organisation role management - only for instructors */}
          {user.role === 'instructor' && (
            user.roles && user.roles.includes('organization') ? (
              <Button
                onClick={() => handleRemoveOrganizationRole(user.id)}
                variant="ghost"
                size="sm"
                className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg"
                title="Retirer le rôle organisation"
              >
                <Buildings2 size={16} color="currentColor" />
              </Button>
            ) : (
              <Button
                onClick={() => handleAssignOrganizationRole(user.id)}
                variant="ghost"
                size="sm"
                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg"
                title="Assigner le rôle organisation"
              >
                <Buildings2 size={16} color="currentColor" />
              </Button>
            )
          )}

          <Button
            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
            variant="ghost"
            size="sm"
            className={`p-2 rounded-lg ${
              isCurrentUser(user.id)
                ? "text-gray-400 cursor-not-allowed"
                : user.isActive
                  ? "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                  : "text-green-600 hover:text-green-800 hover:bg-green-50"
            }`}
            title={
              isCurrentUser(user.id)
                ? "Vous ne pouvez pas modifier le statut de votre propre compte"
                : user.isActive ? "Désactiver" : "Activer"
            }
            disabled={isCurrentUser(user.id)}
          >
            {user.isActive ? (
              <Status size={16} color="currentColor" />
            ) : (
              <StatusUp size={16} color="currentColor" />
            )}
          </Button>

          <Button
            onClick={() => handleDeleteUser(user.id)}
            variant="ghost"
            size="sm"
            className={`p-2 rounded-lg ${
              isCurrentUser(user.id)
                ? "text-gray-400 cursor-not-allowed"
                : "text-red-600 hover:text-red-800 hover:bg-red-50"
            }`}
            title={isCurrentUser(user.id) ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer"}
            disabled={isCurrentUser(user.id)}
          >
            <Trash size={16} color="currentColor" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-100 rounded-xl">
          <People size={32} color="#1D4ED8" variant="Bold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les comptes, rôles et permissions des utilisateurs
          </p>
        </div>
      </div>

      {/* Overview Cards with Statistics */}
      <UsersOverviewCards
        stats={userStats}
        trends={{
          totalUsers: 8.2,
          activeUsers: 12.1,
          newUsers: 24.5,
          inactiveUsers: -5.8,
        }}
      />

      {/* Role Tabs with Actions */}
      <UsersRoleTabs
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        counts={roleCounts}
        onCreateUser={handleCreateUser}
        onImportUsers={handleImportUsers}
        onExportUsers={handleExportUsers}
        onToggleFilters={() => setShowFilters(!showFilters)}
        showFilters={showFilters}
      />

      {/* Advanced Filters */}
      <UsersFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        isVisible={showFilters}
      />

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? 's' : ''} sélectionné{selectedUsers.length > 1 ? 's' : ''}
              </span>
              <Button
                onClick={() => setSelectedUsers([])}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800"
              >
                Désélectionner tout
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleBulkActivate}
                variant="outline"
                size="sm"
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <StatusUp size={16} color='white' />
                <span className='ml-1'>Activer</span>
              </Button>
              <Button
                onClick={handleBulkDeactivate}
                variant="outline"
                size="sm"
                className="text-sm px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <Status color='white' size={16} />
                <span className='ml-1'>Désactiver</span>
              </Button>
              <Button
                onClick={handleBulkDelete}
                variant="outline"
                size="sm"
                className="text-sm px-3 py-1 border border-red-400 text-red-700 hover:bg-red-50 rounded-lg"
              >
                <Trash size={14} color="#DC2626" />
                <span className='ml-1'>Supprimer</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <DataTable
          columns={userColumns}
          data={filteredUsers}
          loading={loading}
        />
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Affichage de {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} sur {users.length} au total
          </span>
          {activeRole !== 'all' && (
            <span>
              Filtré par rôle: <span className="font-medium capitalize">{activeRole}</span>
            </span>
          )}
        </div>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        ref={userFormModalRef}
        user={userToEdit}
        onSave={handleUserSave}
        onCancel={handleUserFormCancel}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        ref={userDetailsModalRef}
        user={userToView}
        onEdit={handleEditFromDetails}
        onClose={handleUserDetailsClose}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        ref={confirmationModalRef}
        title={bulkDeleteUsers.length > 0 ? "Supprimer les utilisateurs" : "Supprimer l'utilisateur"}
        message={
          bulkDeleteUsers.length > 0
            ? `Êtes-vous sûr de vouloir supprimer ${bulkDeleteUsers.length} utilisateur${bulkDeleteUsers.length > 1 ? 's' : ''} ?`
            : userToDelete 
              ? `Êtes-vous sûr de vouloir supprimer ${userToDelete.firstName} ${userToDelete.lastName} ?`
              : ""
        }
        description={
          bulkDeleteUsers.length > 0
            ? "Cette action est irréversible. Toutes les données associées à ces utilisateurs seront définitivement supprimées."
            : "Cette action est irréversible. Toutes les données associées à cet utilisateur seront définitivement supprimées."
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        onConfirm={bulkDeleteUsers.length > 0 ? confirmBulkDelete : confirmDeleteUser}
        onCancel={bulkDeleteUsers.length > 0 ? cancelBulkDelete : cancelDeleteUser}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        ref={csvImportModalRef}
        onImport={handleCsvImport}
      />

      {/* CSV Export Modal */}
      <CsvExportModal
        ref={csvExportModalRef}
        users={users}
      />
    </div>
  );
};

export default AdminUsers;