import api from './api';

export interface Follow {
  _id: string;
  studentId: string;
  instructorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  followedAt: string;
  notifications: {
    newCourses: boolean;
    courseUpdates: boolean;
  };
}

export interface InstructorStats {
  totalFollowers: number;
  recentFollowers: number;
  followersWithNotifications: number;
}

export interface InstructorLeaderboard {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  followersCount: number;
  coursesCount: number;
}

export interface CreateFollowDto {
  instructorId: string;
  notifyNewCourses?: boolean;
  notifyCourseUpdates?: boolean;
}

export interface UpdateFollowDto {
  notifyNewCourses?: boolean;
  notifyCourseUpdates?: boolean;
}

class FollowService {
  /**
   * Suivre un instructeur
   */
  async followInstructor(data: CreateFollowDto): Promise<Follow> {
    const response = await api.post('/follows', data);
    return response.data;
  }

  /**
   * Ne plus suivre un instructeur
   */
  async unfollowInstructor(instructorId: string): Promise<{ message: string }> {
    const response = await api.delete(`/follows/${instructorId}`);
    return response.data;
  }

  /**
   * Récupérer les instructeurs que je suis
   */
  async getMyFollowing(): Promise<Follow[]> {
    const response = await api.get('/follows/my-following');
    return response.data;
  }

  /**
   * Récupérer mes abonnés (pour instructeur)
   */
  async getMyFollowers(): Promise<Follow[]> {
    const response = await api.get('/follows/my-followers');
    return response.data;
  }

  /**
   * Vérifier si je suis un instructeur
   */
  async checkIfFollowing(instructorId: string): Promise<{ isFollowing: boolean; follow?: Follow }> {
    const response = await api.get(`/follows/check/${instructorId}`);
    return response.data;
  }

  /**
   * Mettre à jour les préférences de notifications
   */
  async updateNotifications(
    instructorId: string,
    data: UpdateFollowDto
  ): Promise<Follow> {
    const response = await api.patch(`/follows/${instructorId}/notifications`, data);
    return response.data;
  }

  /**
   * Obtenir les statistiques de followers d'un instructeur
   */
  async getInstructorStats(instructorId: string): Promise<InstructorStats> {
    const response = await api.get(`/follows/instructor/${instructorId}/stats`);
    return response.data;
  }

  /**
   * Obtenir le nombre d'instructeurs suivis par un étudiant
   */
  async getFollowingCount(studentId: string): Promise<{ count: number }> {
    const response = await api.get(`/follows/student/${studentId}/count`);
    return response.data;
  }

  /**
   * Toggle follow/unfollow (helper method)
   */
  async toggleFollow(instructorId: string): Promise<boolean> {
    try {
      const { isFollowing } = await this.checkIfFollowing(instructorId);

      if (isFollowing) {
        await this.unfollowInstructor(instructorId);
        return false;
      } else {
        await this.followInstructor({ instructorId });
        return true;
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  }

  /**
   * Récupérer le leaderboard des instructeurs
   */
  async getLeaderboard(): Promise<InstructorLeaderboard[]> {
    const response = await api.get('/follows/leaderboard');
    return response.data;
  }
}

export const followService = new FollowService();
export default followService;
