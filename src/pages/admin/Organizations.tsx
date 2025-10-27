/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Add, Copy, Eye, EyeSlash, Trash, Edit } from 'iconsax-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/contexts/toast-context';
import { organizationService } from '@/services/organizationService';
import type { Organization } from '@/services/organizationService';
import { avatarService } from '@/services/avatarService';
import UserSelect from '@/components/ui/UserSelect';


const AdminOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { showToast } = useToast();

  // Form data for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'school' as Organization['type'],
    address: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    isActive: true
  });

  // States pour la gestion des gestionnaires
  const [availableManagers, setAvailableManagers] = useState<Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  }>>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');

  // Load organizations and managers from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const [organizationsData, managersData] = await Promise.all([
          organizationService.getAll(),
          organizationService.getAvailableManagers()
        ]);
        setOrganizations(organizationsData);
        setAvailableManagers(managersData);
      } catch {
        showToast('Erreur lors du chargement des données', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [showToast]);

  const getTypeLabel = (type: Organization['type']) => {
    const types = {
      'school': 'École',
      'university': 'Université',
      'training-center': 'Centre de Formation',
      'corporate': 'Institut privé'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: Organization['type']) => {
    const colors = {
      'school': 'bg-blue-100 text-blue-700',
      'university': 'bg-purple-100 text-purple-700',
      'training-center': 'bg-orange-100 text-orange-700',
      'corporate': 'bg-green-100 text-green-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const truncateText = (text: string, maxLength: number = 15): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleToggleStatus = async (org: Organization) => {
    try {
      const updatedOrg = await organizationService.toggleStatus(org.id);
      setOrganizations(prev =>
        prev.map(o => o.id === org.id ? updatedOrg : o)
      );
      showToast(
        `Organisation ${org.isActive ? 'désactivée' : 'activée'} avec succès`,
        'success'
      );
    } catch (error) {
      showToast('Erreur lors de la modification du statut', 'error');
    }
  };

  const handleDuplicate = async (org: Organization) => {
    try {
      const duplicatedOrg = await organizationService.duplicate(org.id);
      setOrganizations(prev => [duplicatedOrg, ...prev]);
      showToast('Organisation dupliquée avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de la duplication', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'school',
      address: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      isActive: true
    });
    setSelectedManagerId('');
  };

  const handleCreate = async () => {
    try {
      // Validation basique
      if (!formData.name.trim() || !formData.description.trim() || !formData.address.trim() ||
          !formData.contactEmail.trim() || !formData.contactPhone.trim()) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }

      // Créer la nouvelle organisation via API
      let newOrg = await organizationService.create({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        address: formData.address,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        website: formData.website || undefined,
        isActive: formData.isActive
      });

      // Si un gestionnaire est sélectionné, l'assigner
      if (selectedManagerId) {
        newOrg = await organizationService.assignManager(newOrg.id, selectedManagerId);
        showToast('Organisation créée et gestionnaire assigné avec succès', 'success');
      } else {
        showToast('Organisation créée avec succès', 'success');
      }

      setOrganizations(prev => [newOrg, ...prev]);
      setShowCreateModal(false);
      resetForm();
    } catch {
      showToast('Erreur lors de la création de l\'organisation', 'error');
    }
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      description: org.description,
      type: org.type,
      address: org.address,
      contactEmail: org.contactEmail,
      contactPhone: org.contactPhone,
      website: org.website || '',
      isActive: org.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedOrg) return;

    try {
      // Validation basique
      if (!formData.name.trim() || !formData.description.trim() || !formData.address.trim() ||
          !formData.contactEmail.trim() || !formData.contactPhone.trim()) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }

      // console.log('Update org ID:', selectedOrg.id, 'with data:', formData);
      // Mettre à jour l'organisation via API
      const updatedOrg = await organizationService.update(selectedOrg.id, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        address: formData.address,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        website: formData.website || undefined,
        isActive: formData.isActive
      });

      setOrganizations(prev =>
        prev.map(org => org.id === selectedOrg.id ? updatedOrg : org)
      );
      showToast('Organisation modifiée avec succès', 'success');
      setShowEditModal(false);
      setSelectedOrg(null);
      resetForm();
    } catch (error) {
      showToast('Erreur lors de la modification de l\'organisation', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;

    try {
      await organizationService.delete(selectedOrg.id);
      setOrganizations(prev => prev.filter(o => o.id !== selectedOrg.id));
      showToast('Organisation supprimée avec succès', 'success');
      setShowDeleteModal(false);
      setSelectedOrg(null);
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Nom de l\'organisation',
      render: (_value: unknown, org: Organization) => (
        <div>
          <div
            className="font-medium text-gray-900"
            title={org.name}
          >
            {truncateText(org.name, 40)}
          </div>
          <div
            className="text-sm text-gray-500"
            title={org.description}
          >
            {truncateText(org.description, 25)}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (_value: unknown, org: Organization) => (
        <Badge className={getTypeColor(org.type)}>
          {getTypeLabel(org.type)}
        </Badge>
      )
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (_value: unknown, org: Organization) => (
        <div>
          <div className="text-sm text-gray-900">{org.contactEmail}</div>
          <div className="text-sm text-gray-500">{org.contactPhone}</div>
        </div>
      )
    },
    {
      key: 'manager',
      title: 'Gestionnaire',
      render: (_value: unknown, org: Organization) => (
        <div className="flex items-center">
          {org.manager ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {org.manager.avatar ? (
                  <img
                    src={avatarService.getAvatarUrl(org.manager.avatar)}
                    alt={`${org.manager.firstName || ''} ${org.manager.lastName || ''}`}
                    className="w-full h-full object-cover"
                    title={`${org.manager.firstName || ''} ${org.manager.lastName || ''}`}
                  />
                ) : (
                  <span
                    className="text-xs font-medium text-gray-600"
                    title={`${org.manager.firstName || ''} ${org.manager.lastName || ''}`}
                  >
                    {org.manager.firstName?.[0] || '?'}{org.manager.lastName?.[0] || '?'}
                  </span>
                )}
              </div>
              <span
                className="text-sm text-gray-900 cursor-help"
                title={`${org.manager.firstName || ''} ${org.manager.lastName || ''} (${org.manager.email || ''})`}
              >
                {org.manager.firstName || 'N/A'} {org.manager.lastName || ''}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Non assigné</span>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Date de création',
      render: (_value: unknown, org: Organization) => (
        <div className="text-sm text-gray-900">
          {new Date(org.createdAt).toLocaleDateString('fr-FR')}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Statut',
      render: (_value: unknown, org: Organization) => (
        <Badge className={org.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          {org.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_value: unknown, org: Organization) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(org)}
            className="p-2"
          >
            <Edit size={16} color="#3B82F6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDuplicate(org)}
            className="p-2"
          >
            <Copy size={16} color="#6B7280" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(org)}
            className="p-2"
          >
            {org.isActive ?
              <EyeSlash size={16} color="#EF4444" /> :
              <Eye size={16} color="#10B981" />
            }
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedOrg(org);
              setShowDeleteModal(true);
            }}
            className="p-2"
          >
            <Trash size={16} color="#EF4444" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Organisations</h1>
          <p className="text-gray-600">
            Gérez les écoles, universités et centres de formation
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Add size={20} color="#FFFFFF" className="mr-2" />
          Créer une organisation
        </Button>
      </div>


      {/* Organizations Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={organizations}
          columns={columns}
          loading={isLoading}
        />
      </div>

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer une nouvelle organisation"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'organisation
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom de l'organisation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description de l'organisation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'organisation
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({...prev, type: e.target.value as Organization['type']}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="school">École</option>
              <option value="university">Université</option>
              <option value="training-center">Centre de Formation</option>
              <option value="corporate">Institut privé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Adresse complète"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de contact
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({...prev, contactEmail: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@organisation.fr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({...prev, contactPhone: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site web (optionnel)
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.organisation.fr"
            />
          </div>

          {/* Sélection du gestionnaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gestionnaire (optionnel)
            </label>
            <UserSelect
              users={availableManagers}
              value={selectedManagerId}
              onChange={setSelectedManagerId}
              placeholder="Sélectionnez un gestionnaire"
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              Sélectionnez un instructeur pour qu'il devienne gestionnaire de cette organisation
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleCreate}>
              Créer l'organisation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Organization Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrg(null);
        }}
        title="Modifier l'organisation"
      >
        {selectedOrg && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'organisation
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom de l'organisation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description de l'organisation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'organisation
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({...prev, type: e.target.value as Organization['type']}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="school">École</option>
                <option value="university">Université</option>
                <option value="training-center">Centre de Formation</option>
                <option value="corporate">Institut privé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Adresse complète"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({...prev, contactEmail: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@organisation.fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({...prev, contactPhone: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web (optionnel)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://www.organisation.fr"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedOrg(null);
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleUpdate}>
                Sauvegarder les modifications
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer l'organisation "{selectedOrg?.name}" ?
            Cette action est irréversible.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrganizations;