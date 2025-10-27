import { useState, useEffect } from 'react';
import { Add, Trash, Settings } from 'iconsax-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/forms/Textarea';
import Toggle from '@/components/forms/toggle';
import { CustomSelect } from '@/components/forms/custom-select';
import { TagSelector } from '@/components/forms/tag-selector';
import profileService from '@/services/profileService';
import type { Profile, AvailableResources, CreateProfileDto } from '@/types/profiles';

interface ProfileFormProps {
  profile?: Profile | null;
  availableResources?: AvailableResources | null;
  onSave: (profileData: CreateProfileDto) => Promise<void>;
  onCancel: () => void;
}

interface PermissionFormData {
  resource: string;
  actions: string[];
  conditions: string;
  limitations: string;
  description: string;
}

const ProfileForm = ({ profile, availableResources, onSave, onCancel }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as PermissionFormData[],
    globalLimitations: '{}',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setFormData(profileService.formatProfileForForm(profile));
    } else {
      // Reset form for new profile
      setFormData({
        name: '',
        description: '',
        permissions: [{
          resource: '',
          actions: [],
          conditions: '{}',
          limitations: '{}',
          description: ''
        }],
        globalLimitations: '{}',
        isActive: true
      });
    }
  }, [profile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du profil est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    // Validate permissions
    formData.permissions.forEach((perm, index) => {
      if (!perm.resource) {
        newErrors[`permission_${index}_resource`] = 'La ressource est requise';
      }
      if (!perm.actions.length) {
        newErrors[`permission_${index}_actions`] = 'Au moins une action est requise';
      }

      // Validate JSON format
      try {
        JSON.parse(perm.conditions || '{}');
      } catch {
        newErrors[`permission_${index}_conditions`] = 'Format JSON invalide';
      }

      try {
        JSON.parse(perm.limitations || '{}');
      } catch {
        newErrors[`permission_${index}_limitations`] = 'Format JSON invalide';
      }
    });

    // Validate global limitations JSON
    try {
      JSON.parse(formData.globalLimitations || '{}');
    } catch {
      newErrors.globalLimitations = 'Format JSON invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const profileData = profileService.parseProfileFromForm(formData);
      await onSave(profileData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPermission = () => {
    setFormData(prev => ({
      ...prev,
      permissions: [...prev.permissions, {
        resource: '',
        actions: [],
        conditions: '{}',
        limitations: '{}',
        description: ''
      }]
    }));
  };

  const removePermission = (index: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter((_, i) => i !== index)
    }));
  };

  const updatePermission = (index: number, field: keyof PermissionFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map((perm, i) =>
        i === index ? { ...perm, [field]: value } : perm
      )
    }));
  };

  const resourceOptions = availableResources?.resources.map(resource => ({
    value: resource,
    label: resource === '*' ? 'Toutes les ressources' : resource
  })) || [];

  const actionOptions = availableResources?.actions.map(action => ({
    id: action,
    label: action === '*' ? 'Toutes les actions' : action
  })) || [
    { id: 'create', label: 'create' },
    { id: 'read', label: 'read' },
    { id: 'update', label: 'update' },
    { id: 'delete', label: 'delete' },
    { id: '*', label: 'Toutes les actions' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings size={20} color="#4B5563" />
          Informations du Profil
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Nom du profil *"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Instructeur Senior"
              error={errors.name}
            />
          </div>

          <div className="flex items-end">
            <div className="flex items-center space-x-3">
              <Toggle
                enabled={formData.isActive}
                onChange={(enabled: boolean) => setFormData(prev => ({ ...prev, isActive: enabled }))}
              />
              <div>
                <div className="text-sm font-medium text-gray-700">Profil actif</div>
                <div className="text-xs text-gray-500">Les utilisateurs peuvent être assignés à ce profil</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Textarea
            label="Description *"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description du rôle et des responsabilités..."
            rows={3}
            error={errors.description}
          />
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Permissions ({formData.permissions.length})
          </h3>
          <Button
            type="button"
            onClick={addPermission}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Add size={16} color="#6B7280" />
            Ajouter Permission
          </Button>
        </div>

        {formData.permissions.map((permission, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Permission #{index + 1}</h4>
              <Button
                type="button"
                onClick={() => removePermission(index)}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
                title="Supprimer cette permission"
              >
                <Trash size={16} color="#DC2626" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <CustomSelect
                  label="Ressource *"
                  value={permission.resource}
                  onChange={(value: string | null) => updatePermission(index, 'resource', value || '')}
                  options={resourceOptions}
                  placeholder="Sélectionner une ressource"
                  error={errors[`permission_${index}_resource`]}
                />
              </div>

              <div>
                <TagSelector
                  label="Actions *"
                  selectedTags={permission.actions.map((action) => ({ id: action, label: action }))}
                  onTagsChange={(tags: { id: string; label: string; }[]) => updatePermission(index, 'actions', tags.map(t => t.label))}
                  availableTags={actionOptions}
                  placeholder="Sélectionner les actions"
                  error={errors[`permission_${index}_actions`]}
                />
              </div>
            </div>

            <div>
              <Input
                label="Description"
                value={permission.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePermission(index, 'description', e.target.value)}
                placeholder="Description de cette permission..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Textarea
                  label="Conditions (JSON)"
                  value={permission.conditions}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updatePermission(index, 'conditions', e.target.value)}
                  placeholder='{"ownResourceOnly": true, "departmentId": "IT"}'
                  rows={3}
                  error={errors[`permission_${index}_conditions`]}
                />
              </div>

              <div>
                <Textarea
                  label="Limitations (JSON)"
                  value={permission.limitations}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updatePermission(index, 'limitations', e.target.value)}
                  placeholder='{"maxPerDay": 5, "timeWindow": "09:00-17:00"}'
                  rows={3}
                  error={errors[`permission_${index}_limitations`]}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Limitations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Limitations Globales</h3>

        <div>
          <Textarea
            label="Limitations globales (JSON)"
            value={formData.globalLimitations}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, globalLimitations: e.target.value }))}
            placeholder='{"maxCourses": 10, "maxStudents": 100}'
            rows={4}
            error={errors.globalLimitations}
          />
          <p className="text-sm text-gray-500 mt-1">
            Limitations qui s'appliquent à l'ensemble du profil
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: '#7C3AED' }}
        >
          {loading ? 'Sauvegarde...' : (profile ? 'Mettre à jour' : 'Créer le Profil')}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;