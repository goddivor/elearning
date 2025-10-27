/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';
import type { LocalImage } from '@/components/ui/ImageUpload';
import { getFullFileUrl } from '@/utils/fileUtils';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  isPublished: boolean;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  thumbnailUrl?: string;
  thumbnailPreview?: string;
  localThumbnail?: LocalImage | null;
  previewUrl?: string;
  tags: string[];
  duration: number; // en minutes
  totalLessons: number;
  enrolledStudents: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  averageRating: number;
  totalRevenue: number;
  coursesByCategory: { [key: string]: number };
  coursesByInstructor: { [key: string]: number };
}

export interface CreateCourseDto {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  tags: string[];
  thumbnail?: string;
  previewUrl?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: number;
  tags?: string[];
  thumbnail?: string;
  previewUrl?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface CourseBackendResponse {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  tags: string[];
  thumbnail?: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  status: string;
  duration: number;
  totalLessons: number;
  enrolledStudents: number;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  instructorId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

class CourseService {
  // Récupérer tous les cours (admin)
  async getAllCourses(): Promise<Course[]> {
    const [coursesResponse, usersResponse] = await Promise.all([
      api.get('/courses?admin=true'),
      api.get('/users')
    ]);

    // Créer un map des utilisateurs par ID pour la jointure
    const usersMap = new Map();
    usersResponse.data.forEach((user: any) => {
      usersMap.set(user._id || user.id, user);
    });

    // Transformer les données backend vers frontend avec jointure
    return coursesResponse.data.map((course: CourseBackendResponse) => {
      // Récupérer les données complètes de l'instructeur
      const instructorData = course.instructorId ? usersMap.get(course.instructorId._id) : null;

      return {
        ...course,
        id: course._id || course.id || '',
        instructor: instructorData ? {
          id: instructorData._id || instructorData.id,
          firstName: instructorData.firstName,
          lastName: instructorData.lastName,
          email: instructorData.email,
          avatar: instructorData.avatar
        } : course.instructor || undefined,
        thumbnailUrl: getFullFileUrl(course.thumbnail || course.thumbnailUrl),
        isPublished: course.status === 'published'
      };
    });
  }

  // Récupérer un cours par ID
  async getCourseById(id: string): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    const courseData: CourseBackendResponse = response.data;

    // Transformer les données backend vers frontend
    return {
      ...courseData,
      id: courseData._id || courseData.id || '',
      instructor: courseData.instructorId ? {
        id: courseData.instructorId._id,
        firstName: courseData.instructorId.firstName,
        lastName: courseData.instructorId.lastName,
        email: courseData.instructorId.email,
        avatar: courseData.instructorId.avatar
      } : courseData.instructor || undefined,
      thumbnailUrl: getFullFileUrl(courseData.thumbnail || courseData.thumbnailUrl),
      isPublished: courseData.status === 'published'
    };
  }

  // Créer un nouveau cours
  async createCourse(data: CreateCourseDto): Promise<Course> {
    const response = await api.post('/courses', data);
    const courseData: CourseBackendResponse = response.data;

    // Transformer les données backend vers frontend
    return {
      ...courseData,
      id: courseData._id || courseData.id || '',
      instructor: courseData.instructorId ? {
        id: courseData.instructorId._id,
        firstName: courseData.instructorId.firstName,
        lastName: courseData.instructorId.lastName,
        email: courseData.instructorId.email,
        avatar: courseData.instructorId.avatar
      } : courseData.instructor || undefined,
      thumbnailUrl: getFullFileUrl(courseData.thumbnail || courseData.thumbnailUrl),
      isPublished: courseData.status === 'published'
    };
  }

  // Mettre à jour un cours
  async updateCourse(id: string, data: UpdateCourseDto): Promise<Course> {
    const response = await api.patch(`/courses/${id}`, data);
    const courseData: CourseBackendResponse = response.data;

    // Transformer les données backend vers frontend
    return {
      ...courseData,
      id: courseData._id || courseData.id || '',
      instructor: courseData.instructorId ? {
        id: courseData.instructorId._id,
        firstName: courseData.instructorId.firstName,
        lastName: courseData.instructorId.lastName,
        email: courseData.instructorId.email,
        avatar: courseData.instructorId.avatar
      } : courseData.instructor || undefined,
      thumbnailUrl: getFullFileUrl(courseData.thumbnail || courseData.thumbnailUrl),
      isPublished: courseData.status === 'published'
    };
  }

  // Supprimer un cours
  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  }

  // Publier/Dépublier un cours
  async togglePublishCourse(id: string): Promise<Course> {
    const response = await api.patch(`/courses/${id}/publish`);
    const courseData: CourseBackendResponse = response.data;

    // Transformer les données backend vers frontend
    return {
      ...courseData,
      id: courseData._id || courseData.id || '',
      instructor: courseData.instructorId ? {
        id: courseData.instructorId._id,
        firstName: courseData.instructorId.firstName,
        lastName: courseData.instructorId.lastName,
        email: courseData.instructorId.email,
        avatar: courseData.instructorId.avatar
      } : courseData.instructor || undefined,
      thumbnailUrl: getFullFileUrl(courseData.thumbnail || courseData.thumbnailUrl),
      isPublished: courseData.status === 'published'
    };
  }

  // Récupérer les cours d'un instructeur
  async getCoursesByInstructor(instructorId?: string): Promise<Course[]> {
    const endpoint = instructorId
      ? `/courses?instructor=${instructorId}`
      : '/courses/my-courses';
    const response = await api.get(endpoint);

    // Transformer les données backend vers frontend
    return response.data.map((course: CourseBackendResponse) => ({
      ...course,
      id: course._id || course.id || '',
      instructor: course.instructorId ? {
        id: course.instructorId._id,
        firstName: course.instructorId.firstName,
        lastName: course.instructorId.lastName,
        email: course.instructorId.email,
        avatar: course.instructorId.avatar
      } : course.instructor || undefined,
      thumbnailUrl: getFullFileUrl(course.thumbnail || course.thumbnailUrl),
      isPublished: course.status === 'published'
    }));
  }

  // Récupérer les statistiques des cours
  async getCourseStats(): Promise<CourseStats> {
    try {
      // Si l'endpoint stats n'existe pas encore, on calcule à partir de la liste des cours
      const courses = await this.getAllCourses();
      
      const stats: CourseStats = {
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.isPublished).length,
        draftCourses: courses.filter(c => !c.isPublished).length,
        totalEnrollments: courses.reduce((sum, course) => sum + course.enrolledStudents, 0),
        averageRating: courses.length > 0 
          ? courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length 
          : 0,
        totalRevenue: courses.reduce((sum, course) => sum + (course.price * course.enrolledStudents), 0),
        coursesByCategory: courses.reduce((acc, course) => {
          acc[course.category] = (acc[course.category] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number }),
        coursesByInstructor: courses.reduce((acc, course) => {
          if (course.instructor && course.instructor.firstName && course.instructor.lastName) {
            const instructorName = `${course.instructor.firstName} ${course.instructor.lastName}`;
            acc[instructorName] = (acc[instructorName] || 0) + 1;
          }
          return acc;
        }, {} as { [key: string]: number })
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques cours:', error);
      throw error;
    }
  }

  // Rechercher des cours
  async searchCourses(query: string): Promise<Course[]> {
    const courses = await this.getAllCourses();
    const searchTerm = query.toLowerCase();
    
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.category.toLowerCase().includes(searchTerm) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Filtrer les cours par catégorie
  async getCoursesByCategory(category: string): Promise<Course[]> {
    const courses = await this.getAllCourses();
    return courses.filter(course => course.category === category);
  }

  // Filtrer les cours par niveau
  async getCoursesByLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<Course[]> {
    const courses = await this.getAllCourses();
    return courses.filter(course => course.level === level);
  }

  // Filtrer les cours par statut
  async getCoursesByStatus(isPublished: boolean): Promise<Course[]> {
    const courses = await this.getAllCourses();
    return courses.filter(course => course.isPublished === isPublished);
  }

  // Récupérer les catégories disponibles
  async getCategories(): Promise<string[]> {
    const courses = await this.getAllCourses();
    const categories = [...new Set(courses.map(course => course.category))];
    return categories.sort();
  }

  // Récupérer les statistiques d'un instructeur spécifique
  async getInstructorStats(): Promise<{
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalStudents: number;
    averageRating: number;
  }> {
    try {
      const courses = await this.getCoursesByInstructor();

      return {
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.isPublished).length,
        draftCourses: courses.filter(c => !c.isPublished).length,
        totalStudents: courses.reduce((sum, course) => sum + course.enrolledStudents, 0),
        averageRating: courses.length > 0
          ? courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length
          : 0,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques instructeur:', error);
      throw error;
    }
  }

  // Récupérer tous les cours publiés (pour le catalogue public)
  async getPublishedCourses(): Promise<Course[]> {
    const response = await api.get('/courses'); // Sans admin=true, retourne uniquement les cours publiés

    return response.data.map((course: CourseBackendResponse) => ({
      ...course,
      id: course._id || course.id || '',
      instructor: course.instructorId ? {
        id: course.instructorId._id,
        firstName: course.instructorId.firstName,
        lastName: course.instructorId.lastName,
        email: course.instructorId.email,
        avatar: course.instructorId.avatar
      } : course.instructor || undefined,
      thumbnailUrl: getFullFileUrl(course.thumbnail || course.thumbnailUrl),
      isPublished: course.status === 'published'
    }));
  }

  // Récupérer les catégories des cours publiés uniquement
  async getPublishedCategories(): Promise<string[]> {
    const courses = await this.getPublishedCourses();
    const categories = [...new Set(courses.map(course => course.category))];
    return categories.filter(cat => cat).sort();
  }

  // Récupérer les instructeurs qui ont des cours publiés
  async getInstructorsWithPublishedCourses(): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    coursesCount: number;
  }>> {
    const courses = await this.getPublishedCourses();
    const instructorsMap = new Map();

    courses.forEach(course => {
      if (course.instructor) {
        const key = course.instructor.id;
        if (instructorsMap.has(key)) {
          instructorsMap.get(key).coursesCount++;
        } else {
          instructorsMap.set(key, {
            id: course.instructor.id,
            firstName: course.instructor.firstName,
            lastName: course.instructor.lastName,
            coursesCount: 1
          });
        }
      }
    });

    return Array.from(instructorsMap.values()).sort((a, b) =>
      a.firstName.localeCompare(b.firstName)
    );
  }
}

export const courseService = new CourseService();
export default courseService;