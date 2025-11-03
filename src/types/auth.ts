export interface User {
  _id: string;
  id?: string; // Alias pour _id (rétro-compatibilité)
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string; // Nom complet (peut venir de Google OAuth)
  role: 'student' | 'instructor' | 'admin' | 'organization';
  roles?: Array<'student' | 'instructor' | 'admin' | 'organization'>; // Multi-rôles
  activeRole?: 'student' | 'instructor' | 'admin' | 'organization'; // Rôle actif
  isActive: boolean;
  avatar?: string;
  bannerImage?: string;
  aboutMe?: string;
  socialLinks?: string[];
  location?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor';
}

export interface RegisterOrganizationRequest {
  // Données utilisateur
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // Données organisation
  organizationName: string;
  organizationDescription: string;
  organizationType: 'school' | 'university' | 'training-center' | 'corporate';
  organizationAddress: string;
  organizationContactEmail: string;
  organizationContactPhone: string;
  organizationWebsite?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}