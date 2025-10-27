import api from './api';
import type {
  Profile,
  CreateProfileDto,
  UpdateProfileDto,
  AvailableResources,
  Permission,
  PermissionCheck,
  HasPermissionResult
} from '../types/profiles';

interface FormattedProfile {
  name: string;
  description: string;
  permissions: Array<{
    resource: string;
    actions: string[];
    conditions: string;
    limitations: string;
    description: string;
  }>;
  globalLimitations: string;
  isActive: boolean;
}

export class ProfileService {
  // Gestion des profils

  async createProfile(profileData: CreateProfileDto): Promise<Profile> {
    const response = await api.post('/profiles', profileData);
    return response.data;
  }

  async getAllProfiles(): Promise<Profile[]> {
    const response = await api.get('/profiles');
    return response.data;
  }

  async getProfileById(id: string): Promise<Profile> {
    const response = await api.get(`/profiles/${id}`);
    return response.data;
  }

  async updateProfile(id: string, profileData: UpdateProfileDto): Promise<Profile> {
    const response = await api.patch(`/profiles/${id}`, profileData);
    return response.data;
  }

  async deleteProfile(id: string): Promise<void> {
    await api.delete(`/profiles/${id}`);
  }

  async toggleProfileStatus(id: string): Promise<Profile> {
    const response = await api.patch(`/profiles/${id}/toggle-status`);
    return response.data;
  }

  async getAvailableResources(): Promise<AvailableResources> {
    const response = await api.get('/profiles/resources');
    return response.data;
  }

  // Gestion des permissions utilisateur

  async getUserPermissions(userId: string): Promise<Permission[]> {
    // Cette méthode sera appelée depuis le AuthContext pour récupérer les permissions utilisateur
    const response = await api.get(`/users/${userId}`);
    const user = response.data;

    // Agréger toutes les permissions des profils de l'utilisateur
    const allPermissions: Permission[] = [];
    if (user.profiles && Array.isArray(user.profiles)) {
      user.profiles.forEach((profile: Profile) => {
        if (profile.isActive && profile.permissions) {
          allPermissions.push(...profile.permissions);
        }
      });
    }

    return allPermissions;
  }

  // Vérification des permissions

  hasPermission(
    userPermissions: Permission[],
    check: PermissionCheck
  ): HasPermissionResult {
    const { resource, action, context = {} } = check;

    // Rechercher les permissions correspondantes
    const matchingPermissions = userPermissions.filter(permission =>
      (permission.resource === '*' || permission.resource === resource) &&
      (permission.actions.includes('*') || permission.actions.includes(action))
    );

    if (matchingPermissions.length === 0) {
      return { allowed: false, reason: 'No matching permissions found' };
    }

    // Vérifier les conditions contextuelles
    for (const permission of matchingPermissions) {
      if (permission.conditions) {
        const conditionsMet = this.checkConditions(permission.conditions, context);
        if (!conditionsMet.met) {
          continue; // Essayer la permission suivante
        }
      }

      // Vérifier les limitations
      const limitationsCheck = this.checkLimitations(permission.limitations || {}, context);
      if (!limitationsCheck.allowed) {
        return {
          allowed: false,
          reason: limitationsCheck.reason,
          limitations: permission.limitations
        };
      }

      // Permission accordée
      return {
        allowed: true,
        limitations: permission.limitations
      };
    }

    return {
      allowed: false,
      reason: 'Conditions or limitations not met'
    };
  }

  // Utilitaires pour conditions et limitations

  private checkConditions(
    conditions: Record<string, unknown>,
    context: Record<string, unknown>
  ): { met: boolean; reason?: string } {
    for (const [key, expectedValue] of Object.entries(conditions)) {
      const contextValue = context[key];

      switch (key) {
        case 'ownResourceOnly':
          if (expectedValue && context.userId !== context.ownerId) {
            return { met: false, reason: 'Can only access own resources' };
          }
          break;

        case 'enrolledOnly':
          if (expectedValue && !context.isEnrolled) {
            return { met: false, reason: 'Must be enrolled to access' };
          }
          break;

        case 'departmentId':
          if (expectedValue !== contextValue) {
            return { met: false, reason: 'Wrong department' };
          }
          break;

        default:
          if (contextValue !== expectedValue) {
            return { met: false, reason: `Condition ${key} not met` };
          }
      }
    }

    return { met: true };
  }

  private checkLimitations(
    limitations: Record<string, unknown>,
    context: Record<string, unknown>
  ): { allowed: boolean; reason?: string } {
    if (!limitations || Object.keys(limitations).length === 0) {
      return { allowed: true };
    }

    // Vérifier les limitations quantitatives
    if (typeof limitations.maxPerDay === 'number' && typeof context.usageToday === 'number' && context.usageToday >= limitations.maxPerDay) {
      return {
        allowed: false,
        reason: `Daily limit of ${limitations.maxPerDay} exceeded`
      };
    }

    if (typeof limitations.maxCourses === 'number' && typeof context.courseCount === 'number' && context.courseCount >= limitations.maxCourses) {
      return {
        allowed: false,
        reason: `Maximum courses limit of ${limitations.maxCourses} reached`
      };
    }

    // Vérifier les limitations temporelles
    if (typeof limitations.timeWindow === 'string') {
      const now = new Date();
      const currentTime = now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
      const [startTime, endTime] = limitations.timeWindow.split('-');

      if (currentTime < startTime || currentTime > endTime) {
        return {
          allowed: false,
          reason: `Access only allowed between ${startTime} and ${endTime}`
        };
      }
    }

    return { allowed: true };
  }

  // Méthodes utilitaires pour l'interface utilisateur

  canCreateProfile(userPermissions: Permission[]): boolean {
    return this.hasPermission(userPermissions, {
      resource: 'profiles',
      action: 'create'
    }).allowed;
  }

  canEditProfile(userPermissions: Permission[], profileId: string): boolean {
    return this.hasPermission(userPermissions, {
      resource: 'profiles',
      action: 'update',
      context: { profileId }
    }).allowed;
  }

  canDeleteProfile(userPermissions: Permission[], profileId: string, isSystemProfile: boolean): boolean {
    if (isSystemProfile) return false;

    return this.hasPermission(userPermissions, {
      resource: 'profiles',
      action: 'delete',
      context: { profileId }
    }).allowed;
  }

  canManageUsers(userPermissions: Permission[]): boolean {
    return this.hasPermission(userPermissions, {
      resource: 'users',
      action: 'update'
    }).allowed;
  }

  // Formattage des données pour l'interface

  formatProfileForForm(profile: Profile): FormattedProfile {
    return {
      name: profile.name,
      description: profile.description,
      permissions: profile.permissions.map(p => ({
        resource: p.resource,
        actions: p.actions,
        conditions: JSON.stringify(p.conditions || {}, null, 2),
        limitations: JSON.stringify(p.limitations || {}, null, 2),
        description: p.description || ''
      })),
      globalLimitations: JSON.stringify(profile.globalLimitations || {}, null, 2),
      isActive: profile.isActive
    };
  }

  parseProfileFromForm(formData: FormattedProfile): CreateProfileDto {
    return {
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions.map((p) => ({
        resource: p.resource,
        actions: p.actions,
        conditions: p.conditions ? JSON.parse(p.conditions) : undefined,
        limitations: p.limitations ? JSON.parse(p.limitations) : undefined,
        description: p.description || undefined
      })),
      globalLimitations: formData.globalLimitations
        ? JSON.parse(formData.globalLimitations)
        : undefined,
      isActive: formData.isActive
    };
  }
}

export default new ProfileService();