// Types pour le système de permissions basé sur les rôles et pages

export type UserRole = 'instructor' | 'student';

export interface PagePermission {
  pageKey: string;
  pageName: string;
  description: string;
  enabled: boolean;
  actions?: {
    [key: string]: boolean | number | null;
  };
}

export interface RoleBasedProfile {
  _id?: string;
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
  isSystemProfile: boolean;
  usersCount?: number; // Nombre d'utilisateurs assignés à ce profil
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleBasedProfileDto {
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
  isActive?: boolean;
}

// Définition des pages disponibles par rôle
export interface RolePageDefinition {
  pageKey: string;
  pageName: string;
  description: string;
  route: string;
  defaultEnabled: boolean;
  availableActions?: {
    key: string;
    label: string;
    description: string;
    defaultValue: boolean | number | null;
    type?: 'boolean' | 'number';
  }[];
}

export const INSTRUCTOR_PAGES: RolePageDefinition[] = [
  {
    pageKey: 'dashboard',
    pageName: 'Tableau de bord',
    description: 'Page d\'accueil avec les statistiques',
    route: '/instructor/dashboard',
    defaultEnabled: true
  },
  {
    pageKey: 'courses',
    pageName: 'Gestion des cours',
    description: 'Créer et gérer les cours',
    route: '/instructor/courses',
    defaultEnabled: true,
    availableActions: [
      { key: 'canCreate', label: 'Créer des cours', description: 'Peut créer de nouveaux cours', defaultValue: true },
      { key: 'canEdit', label: 'Modifier des cours', description: 'Peut modifier ses cours', defaultValue: true },
      { key: 'canDelete', label: 'Supprimer des cours', description: 'Peut supprimer ses cours', defaultValue: false },
      { key: 'canPublish', label: 'Publier des cours', description: 'Peut publier/dépublier ses cours', defaultValue: true },
      { key: 'maxCourses', label: 'Nombre maximum de cours', description: 'Limite le nombre de cours que l\'instructeur peut créer', defaultValue: null, type: 'number' }
    ]
  },
  {
    pageKey: 'my-courses',
    pageName: 'Mes cours',
    description: 'Consulter ses cours créés',
    route: '/instructor/my-courses',
    defaultEnabled: true
  },
  {
    pageKey: 'students',
    pageName: 'Étudiants',
    description: 'Voir les étudiants inscrits à ses cours',
    route: '/instructor/students',
    defaultEnabled: true,
    availableActions: [
      { key: 'maxStudents', label: 'Nombre maximum d\'étudiants', description: 'Limite le nombre d\'étudiants total pour cet instructeur', defaultValue: null, type: 'number' }
    ]
  },
  {
    pageKey: 'analytics',
    pageName: 'Analytics',
    description: 'Statistiques et rapports sur ses cours',
    route: '/instructor/analytics',
    defaultEnabled: false
  },
  {
    pageKey: 'profile',
    pageName: 'Profil',
    description: 'Gérer son profil personnel',
    route: '/instructor/profile',
    defaultEnabled: true,
    availableActions: [
      { key: 'canChangeAvatar', label: 'Changer l\'avatar', description: 'Peut modifier sa photo de profil', defaultValue: true },
      { key: 'canChangeName', label: 'Changer le nom', description: 'Peut modifier son nom', defaultValue: true },
      { key: 'canChangePassword', label: 'Changer le mot de passe', description: 'Peut modifier son mot de passe', defaultValue: true },
      { key: 'canChangeProfile', label: 'Changer de profil', description: 'Peut changer son profil assigné', defaultValue: true }
    ]
  }
];

export const STUDENT_PAGES: RolePageDefinition[] = [
  {
    pageKey: 'dashboard',
    pageName: 'Tableau de bord',
    description: 'Page d\'accueil avec les cours inscrits',
    route: '/student/dashboard',
    defaultEnabled: true
  },
  {
    pageKey: 'courses',
    pageName: 'Catalogue des cours',
    description: 'Voir tous les cours disponibles',
    route: '/student/courses',
    defaultEnabled: true,
    availableActions: [
      { key: 'canEnroll', label: 'S\'inscrire aux cours', description: 'Peut s\'inscrire à de nouveaux cours', defaultValue: true },
      { key: 'canUnenroll', label: 'Se désinscrire', description: 'Peut se désinscrire des cours', defaultValue: false }
    ]
  },
  {
    pageKey: 'my-courses',
    pageName: 'Mes cours',
    description: 'Cours auxquels l\'étudiant est inscrit',
    route: '/student/my-courses',
    defaultEnabled: true
  },
  {
    pageKey: 'progress',
    pageName: 'Progression',
    description: 'Suivre sa progression dans les cours',
    route: '/student/progress',
    defaultEnabled: true
  },
  {
    pageKey: 'certificates',
    pageName: 'Certificats',
    description: 'Voir ses certificats obtenus',
    route: '/student/certificates',
    defaultEnabled: false
  },
  {
    pageKey: 'profile',
    pageName: 'Profil',
    description: 'Gérer son profil personnel',
    route: '/student/profile',
    defaultEnabled: true,
    availableActions: [
      { key: 'canChangeAvatar', label: 'Changer l\'avatar', description: 'Peut modifier sa photo de profil', defaultValue: true },
      { key: 'canChangeName', label: 'Changer le nom', description: 'Peut modifier son nom', defaultValue: true },
      { key: 'canChangePassword', label: 'Changer le mot de passe', description: 'Peut modifier son mot de passe', defaultValue: true },
      { key: 'canChangeProfile', label: 'Changer de profil', description: 'Peut changer son profil assigné', defaultValue: true }
    ]
  }
];

export const ROLE_PAGES_MAP = {
  instructor: INSTRUCTOR_PAGES,
  student: STUDENT_PAGES
};