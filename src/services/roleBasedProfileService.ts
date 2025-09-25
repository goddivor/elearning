import api from './api';
import type {
  RoleBasedProfile,
  CreateRoleBasedProfileDto
} from '../types/role-permissions';

export class RoleBasedProfileService {
  // Gestion des profils basés sur les rôles

  async createProfile(profileData: CreateRoleBasedProfileDto): Promise<RoleBasedProfile> {
    try {
      const response = await api.post('/profiles', profileData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      throw error;
    }
  }

  async getAllProfiles(): Promise<RoleBasedProfile[]> {
    try {
      const response = await api.get('/profiles');
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error);
      throw error;
    }
  }

  async getProfileById(id: string): Promise<RoleBasedProfile> {
    try {
      const response = await api.get(`/profiles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      throw error;
    }
  }

  async updateProfile(id: string, profileData: CreateRoleBasedProfileDto): Promise<RoleBasedProfile> {
    try {
      const response = await api.patch(`/profiles/${id}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  async deleteProfile(id: string): Promise<void> {
    try {
      await api.delete(`/profiles/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du profil:', error);
      throw error;
    }
  }

  async toggleProfileStatus(id: string): Promise<RoleBasedProfile> {
    try {
      const response = await api.patch(`/profiles/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      throw error;
    }
  }

  // Méthodes utilitaires pour l'interface utilisateur

  canCreateProfile(): boolean {
    return true;
  }

  canEditProfile(): boolean {
    return true;
  }

  canDeleteProfile(isSystemProfile: boolean): boolean {
    return !isSystemProfile;
  }
}

export default new RoleBasedProfileService();