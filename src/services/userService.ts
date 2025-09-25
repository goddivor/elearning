import api from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'instructor' | 'student';
  profiles?: string[]; // IDs des profils assignés
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalInstructors: number;
  totalStudents: number;
  activeUsers: number;
  inactiveUsers: number;
  recentRegistrations: number;
}

export interface UpdateUserRoleDto {
  role: 'admin' | 'instructor' | 'student';
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'instructor' | 'student';
  profiles?: string[]; // IDs des profils assignés
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'instructor' | 'student';
  profiles?: string[]; // IDs des profils assignés
  password?: string;
}

class UserService {
  // Récupérer tous les utilisateurs
  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  }

  // Récupérer un utilisateur par ID
  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  // Mettre à jour un utilisateur (Admin uniquement)
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  }

  // Mettre à jour son propre profil
  async updateProfile(data: UpdateUserDto): Promise<User> {
    const response = await api.put('/users/profile', data);
    return response.data;
  }

  // Mettre à jour le rôle d'un utilisateur
  async updateUserRole(id: string, data: UpdateUserRoleDto): Promise<User> {
    const response = await api.put(`/users/${id}/role`, data);
    return response.data;
  }

  // Activer un utilisateur
  async activateUser(id: string): Promise<User> {
    const response = await api.put(`/users/${id}/activate`);
    return response.data;
  }

  // Désactiver un utilisateur
  async deactivateUser(id: string): Promise<User> {
    const response = await api.put(`/users/${id}/deactivate`);
    return response.data;
  }

  // Supprimer un utilisateur
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  // Créer un nouvel utilisateur (admin seulement)
  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data.user;
  }

  // Récupérer les statistiques des utilisateurs
  async getUserStats(): Promise<UserStats> {
    try {
      // Si l'endpoint stats n'existe pas encore, on calcule à partir de la liste des utilisateurs
      const users = await this.getAllUsers();
      
      const stats: UserStats = {
        totalUsers: users.length,
        totalAdmins: users.filter(u => u.role === 'admin').length,
        totalInstructors: users.filter(u => u.role === 'instructor').length,
        totalStudents: users.filter(u => u.role === 'student').length,
        activeUsers: users.filter(u => u.isActive).length,
        inactiveUsers: users.filter(u => !u.isActive).length,
        recentRegistrations: users.filter(u => {
          const createdDate = new Date(u.createdAt);
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return createdDate >= lastWeek;
        }).length
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques utilisateurs:', error);
      throw error;
    }
  }

  // Rechercher des utilisateurs
  async searchUsers(query: string): Promise<User[]> {
    const users = await this.getAllUsers();
    const searchTerm = query.toLowerCase();
    
    return users.filter(user =>
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  // Filtrer les utilisateurs par rôle
  async getUsersByRole(role: 'admin' | 'instructor' | 'student'): Promise<User[]> {
    const users = await this.getAllUsers();
    return users.filter(user => user.role === role);
  }

  // Importation en lot d'utilisateurs
  async bulkImportUsers(users: Array<{
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'instructor' | 'student';
  }>): Promise<{
    message: string;
    summary: {
      created: number;
      duplicates: number;
      errors: number;
    };
    details: {
      created: User[];
      duplicates: Array<{ index: number; email: string }>;
      errors: Array<{ index: number; email: string; error: string }>;
    };
  }> {
    const response = await api.post('/users/bulk-import', { users });
    return response.data;
  }
}

export const userService = new UserService();
export default userService;