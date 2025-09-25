import { useState, useEffect } from 'react';
import { Settings, User, Profile2User, UserEdit, Shield } from 'iconsax-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/forms/Textarea';
import Toggle from '@/components/forms/toggle';
import { CustomSelect } from '@/components/forms/custom-select';
import type {
  RoleBasedProfile,
  CreateRoleBasedProfileDto,
  UserRole,
  PagePermission,
  RolePageDefinition
} from '@/types/role-permissions';
import { ROLE_PAGES_MAP } from '@/types/role-permissions';

interface RoleBasedProfileFormProps {
  profile?: RoleBasedProfile | null;
  onSave: (profileData: CreateRoleBasedProfileDto) => Promise<void>;
  onCancel: () => void;
}

const RoleBasedProfileForm = ({ profile, onSave, onCancel }: RoleBasedProfileFormProps) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    baseRole: UserRole;
    permissions: PagePermission[];
    limitations: {
      maxCourses?: number;
      maxStudents?: number;
      canChangeProfile?: boolean;
      canChangeAvatar?: boolean;
      canChangeName?: boolean;
    };
    isActive: boolean;
  }>({
    name: '',
    description: '',
    baseRole: 'instructor',
    permissions: [],
    limitations: {
      canChangeProfile: true,
      canChangeAvatar: true,
      canChangeName: true
    },
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser les permissions quand le rôle change
  useEffect(() => {
    const rolePages = ROLE_PAGES_MAP[formData.baseRole];
    const defaultPermissions: PagePermission[] = rolePages.map((page: RolePageDefinition) => ({
      pageKey: page.pageKey,
      pageName: page.pageName,
      description: page.description,
      enabled: page.defaultEnabled,
      actions: page.availableActions?.reduce((acc, action) => ({
        ...acc,
        [action.key]: action.defaultValue
      }), {}) || {}
    }));

    setFormData(prev => ({
      ...prev,
      permissions: defaultPermissions
    }));
  }, [formData.baseRole]);

  // Charger le profil existant
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        description: profile.description,
        baseRole: profile.baseRole,
        permissions: profile.permissions,
        limitations: profile.limitations,
        isActive: profile.isActive
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

      // Extraire les limitations depuis les actions des pages
      const extractedLimitations: Record<string, boolean | number> = {};

      formData.permissions.forEach(permission => {
        if (permission.enabled && permission.actions) {
          Object.entries(permission.actions).forEach(([key, value]) => {
            if (key.startsWith('max') && typeof value === 'number') {
              extractedLimitations[key] = value;
            } else if (key.startsWith('can') && typeof value === 'boolean') {
              extractedLimitations[key] = value;
            }
          });
        }
      });

      await onSave({
        name: formData.name,
        description: formData.description,
        baseRole: formData.baseRole,
        permissions: formData.permissions,
        limitations: extractedLimitations,
        isActive: formData.isActive
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = (pageKey: string, field: 'enabled', value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(perm =>
        perm.pageKey === pageKey ? { ...perm, [field]: value } : perm
      )
    }));
  };

  const updatePermissionAction = (pageKey: string, actionKey: string, value: boolean | number | null) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(perm =>
        perm.pageKey === pageKey
          ? {
              ...perm,
              actions: {
                ...perm.actions,
                [actionKey]: value
              }
            }
          : perm
      )
    }));
  };

  const roleOptions = [
    { value: 'instructor', label: 'Instructeur' },
    { value: 'student', label: 'Étudiant' }
  ];

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'instructor':
        return <User size={20} color="#7C3AED" />;
      case 'student':
        return <Profile2User size={20} color="#059669" />;
      default:
        return <UserEdit size={20} color="#6B7280" />;
    }
  };

  const rolePages = ROLE_PAGES_MAP[formData.baseRole];

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

          <div>
            <CustomSelect
              label="Rôle de base *"
              value={formData.baseRole}
              onChange={(value: string | null) => setFormData(prev => ({ ...prev, baseRole: value as UserRole || 'instructor' }))}
              options={roleOptions}
              placeholder="Sélectionner un rôle"
            />
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

      {/* Pages & Permissions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {getRoleIcon(formData.baseRole)}
          <h3 className="text-lg font-semibold text-gray-900">
            Pages et Permissions - {formData.baseRole === 'instructor' ? 'Instructeur' : 'Étudiant'}
          </h3>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            Sélectionnez les pages auxquelles ce profil aura accès et configurez les actions autorisées.
          </p>

          <div className="space-y-4">
            {rolePages.map((page: RolePageDefinition) => {
              const permission = formData.permissions.find(p => p.pageKey === page.pageKey);
              if (!permission) return null;

              return (
                <div key={page.pageKey} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Toggle
                          enabled={permission.enabled}
                          onChange={(enabled: boolean) => updatePermission(page.pageKey, 'enabled', enabled)}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{page.pageName}</h4>
                          <p className="text-sm text-gray-500">{page.description}</p>
                          <code className="text-xs text-gray-400 bg-gray-100 px-1 rounded">{page.route}</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions spécifiques */}
                  {permission.enabled && page.availableActions && page.availableActions.length > 0 && (
                    <div className="mt-3 pl-12 space-y-2">
                      <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Shield size={16} color="#6B7280" />
                        Actions autorisées :
                      </div>
                      <div className="space-y-3">
                        {page.availableActions.map(action => (
                          <div key={action.key} className="flex items-center gap-3">
                            {action.type === 'number' ? (
                              <div className="flex items-center gap-3 w-full">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">{action.label}</div>
                                  <div className="text-xs text-gray-500">{action.description}</div>
                                </div>
                                <div className="w-24">
                                  <Input
                                    type="number"
                                    value={permission.actions?.[action.key]?.toString() || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      const value = e.target.value ? parseInt(e.target.value) : null;
                                      updatePermissionAction(page.pageKey, action.key, value);
                                    }}
                                    placeholder="∞"
                                    className="text-center"
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                <Toggle
                                  enabled={Boolean(permission.actions?.[action.key]) || false}
                                  onChange={(enabled: boolean) => updatePermissionAction(page.pageKey, action.key, enabled)}
                                  size="sm"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">{action.label}</div>
                                  <div className="text-xs text-gray-500">{action.description}</div>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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

export default RoleBasedProfileForm;