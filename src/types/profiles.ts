// Types pour le système de profils et permissions

export interface Permission {
  _id?: string;
  resource: string; // 'courses', 'users', 'analytics', etc.
  actions: string[]; // ['create', 'read', 'update', 'delete', etc.]
  conditions?: Record<string, unknown>; // { ownResourceOnly: true, departmentId: 'IT' }
  limitations?: Record<string, unknown>; // { maxPerDay: 5, timeWindow: '09:00-17:00' }
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  _id?: string;
  name: string; // 'Manager Contenu', 'Instructeur Senior', etc.
  description: string;
  permissions: Permission[];
  globalLimitations: Record<string, unknown>; // { maxCourses: 10, maxStudents: 100 }
  isActive: boolean;
  isSystemProfile: boolean; // Profils système non supprimables
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePermissionDto {
  resource: string;
  actions: string[];
  conditions?: Record<string, unknown>;
  limitations?: Record<string, unknown>;
  description?: string;
}

export interface CreateProfileDto {
  name: string;
  description: string;
  permissions: CreatePermissionDto[];
  globalLimitations?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateProfileDto extends Partial<CreateProfileDto> {
  _id?: string;
}

export interface AvailableResources {
  resources: string[];
  actions: string[];
}

// Types pour les utilisateurs étendus avec profils
export interface UserWithProfiles {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'instructor' | 'student'; // Rôle legacy
  profiles: Profile[]; // Nouveaux profils
  customPermissions: Record<string, unknown>; // Permissions spécifiques
  profilesExpiresAt?: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les formulaires
export interface ProfileFormData {
  name: string;
  description: string;
  permissions: {
    resource: string;
    actions: string[];
    conditions: string; // JSON string
    limitations: string; // JSON string
    description: string;
  }[];
  globalLimitations: string; // JSON string
  isActive: boolean;
}

// Types pour l'état de l'interface
export interface ProfilesState {
  profiles: Profile[];
  selectedProfile: Profile | null;
  availableResources: AvailableResources | null;
  loading: boolean;
  error: string | null;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  context?: Record<string, unknown>;
}

export interface HasPermissionResult {
  allowed: boolean;
  reason?: string;
  limitations?: Record<string, unknown>;
}