import api from './api';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  isPublished: boolean;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  thumbnailUrl?: string;
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
  thumbnailUrl?: string;
  previewUrl?: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: number;
  tags?: string[];
  thumbnailUrl?: string;
  previewUrl?: string;
}

class CourseService {
  // Récupérer tous les cours (admin)
  async getAllCourses(): Promise<Course[]> {
    const response = await api.get('/courses');
    return response.data;
  }

  // Récupérer un cours par ID
  async getCourseById(id: string): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  }

  // Créer un nouveau cours
  async createCourse(data: CreateCourseDto): Promise<Course> {
    const response = await api.post('/courses', data);
    return response.data;
  }

  // Mettre à jour un cours
  async updateCourse(id: string, data: UpdateCourseDto): Promise<Course> {
    const response = await api.patch(`/courses/${id}`, data);
    return response.data;
  }

  // Supprimer un cours
  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}`);
  }

  // Publier/Dépublier un cours
  async togglePublishCourse(id: string): Promise<Course> {
    const response = await api.patch(`/courses/${id}/publish`);
    return response.data;
  }

  // Récupérer les cours d'un instructeur
  async getCoursesByInstructor(instructorId?: string): Promise<Course[]> {
    const endpoint = instructorId 
      ? `/courses?instructor=${instructorId}`
      : '/courses/my-courses';
    const response = await api.get(endpoint);
    return response.data;
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
          const instructorName = `${course.instructor.firstName} ${course.instructor.lastName}`;
          acc[instructorName] = (acc[instructorName] || 0) + 1;
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
}

export const courseService = new CourseService();
export default courseService;
export type { Course, CourseStats, CreateCourseDto, UpdateCourseDto };