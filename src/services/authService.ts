import api from './api';
import type { LoginRequest, RegisterRequest, RegisterOrganizationRequest, AuthResponse, User } from '@/types/auth';

export class AuthService {
  /**
   * Connexion utilisateur
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);

      // Ajouter id comme alias de _id pour compatibilité
      const userData = {
        ...response.data.user,
        id: response.data.user._id
      };

      // Stocker le token et les données utilisateur
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      return {
        ...response.data,
        user: userData
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  /**
   * Inscription utilisateur
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);

      // Ajouter id comme alias de _id pour compatibilité
      const userWithId = {
        ...response.data.user,
        id: response.data.user._id
      };

      // Stocker le token et les données utilisateur automatiquement après inscription
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(userWithId));

      return {
        ...response.data,
        user: userWithId
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  /**
   * Déconnexion utilisateur
   */
  static logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  /**
   * Récupérer l'utilisateur connecté
   */
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erreur lors du parsing des données utilisateur:', error);
      return null;
    }
  }

  /**
   * Récupérer le token d'accès
   */
  static getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Récupérer le profil utilisateur depuis l'API
   */
  static async getProfile(): Promise<User> {
    try {
      const response = await api.get<User>('/users/profile');

      // Ajouter id comme alias de _id pour compatibilité
      const userData = {
        ...response.data,
        id: response.data._id
      };

      // Mettre à jour les données locales
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  /**
   * Inscription organisation (utilisateur + organisation)
   */
  static async registerOrganization(userData: RegisterOrganizationRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register-organization', userData);

      // Ajouter id comme alias de _id pour compatibilité
      const userWithId = {
        ...response.data.user,
        id: response.data.user._id
      };

      // Stocker le token et les données utilisateur automatiquement après inscription
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(userWithId));

      return {
        ...response.data,
        user: userWithId
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription organisation:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  static async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>('/users/profile', userData);

      // Mettre à jour les données locales
      localStorage.setItem('user', JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }
}

export default AuthService;