import { api } from './api';

export interface Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  completedAt?: string;
  completedLessons: string[];
  course?: {
    _id: string;
    title: string;
    description: string;
    imageUrl?: string;
    level: string;
    category: string;
    instructor: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface EnrollmentProgress {
  _id: string;
  progress: number;
  completedLessons: string[];
  completedAt?: string;
  course: {
    _id: string;
    title: string;
    modules: Array<{
      _id: string;
      title: string;
      order: number;
      lessons: Array<{
        _id: string;
        title: string;
        order: number;
        duration: number;
      }>;
    }>;
  };
}

export interface EnrollmentStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalHours: number;
  averageProgress: number;
}

export interface CreateEnrollmentDto {
  courseId: string;
}

export interface UpdateProgressDto {
  completed: boolean;
  timeSpent?: number;
}

export interface CreateReviewDto {
  rating: number;
  comment: string;
}

export class EnrollmentService {
  // S'inscrire à un cours
  static async enrollInCourse(data: CreateEnrollmentDto): Promise<Enrollment> {
    const response = await api.post('/enrollments', data);
    return response.data;
  }

  // Récupérer mes inscriptions
  static async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await api.get('/enrollments/my-enrollments');
    return response.data;
  }

  // Récupérer ma progression dans un cours
  static async getCourseProgress(courseId: string): Promise<EnrollmentProgress> {
    const response = await api.get(`/enrollments/course/${courseId}/my-progress`);
    return response.data;
  }

  // Mettre à jour la progression d'une leçon
  static async updateLessonProgress(
    courseId: string,
    lessonId: string,
    data: UpdateProgressDto
  ): Promise<EnrollmentProgress> {
    const response = await api.patch(
      `/enrollments/course/${courseId}/lesson/${lessonId}/progress`,
      data
    );
    return response.data;
  }

  // Ajouter un avis sur un cours
  static async addReview(courseId: string, data: CreateReviewDto): Promise<Enrollment> {
    const response = await api.post(`/enrollments/course/${courseId}/review`, data);
    return response.data;
  }

  // Se désabonner d'un cours
  static async unenrollFromCourse(courseId: string): Promise<void> {
    await api.delete(`/enrollments/course/${courseId}`);
  }

  // Calculer les statistiques d'inscription
  static async getEnrollmentStats(): Promise<EnrollmentStats> {
    const enrollments = await this.getMyEnrollments();

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.completedAt).length;
    const inProgressCourses = totalCourses - completedCourses;

    const averageProgress = totalCourses > 0
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses
      : 0;

    // Estimation des heures totales (basée sur la progression et le contenu)
    const totalHours = enrollments.reduce((sum, e) => {
      // Estimation : 2 heures par cours en moyenne
      return sum + (e.progress / 100) * 2;
    }, 0);

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalHours: Math.round(totalHours * 10) / 10,
      averageProgress: Math.round(averageProgress)
    };
  }

  // Vérifier si l'utilisateur est inscrit à un cours
  static async isEnrolledInCourse(courseId: string): Promise<boolean> {
    try {
      await this.getCourseProgress(courseId);
      return true;
    } catch {
      return false;
    }
  }

  // Obtenir les cours récemment consultés (dernières 5 inscriptions)
  static async getRecentCourses(): Promise<Enrollment[]> {
    const enrollments = await this.getMyEnrollments();
    return enrollments
      .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
      .slice(0, 5);
  }

  // Obtenir les cours en cours (non terminés)
  static async getInProgressCourses(): Promise<Enrollment[]> {
    const enrollments = await this.getMyEnrollments();
    return enrollments.filter(e => !e.completedAt && e.progress > 0);
  }

  // Obtenir les cours terminés
  static async getCompletedCourses(): Promise<Enrollment[]> {
    const enrollments = await this.getMyEnrollments();
    return enrollments.filter(e => e.completedAt);
  }
}