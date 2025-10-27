/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';
import { getFullFileUrl } from '@/utils/fileUtils';

export type LessonType = 'video' | 'text' | 'quiz' | 'assignment' | '3d' | 'document';

export interface LessonContent {
  type: LessonType;
  videoUrl?: string;
  thumbnailUrl?: string;
  textContent?: string;
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  model3dUrl?: string;
  quizData?: {
    questions: Array<{
      id: string;
      type: string;
      question: string;
      options: string[];
      correctAnswer: number | number[] | string | string[];
      explanation: string;
    }>;
  };
  assignmentData?: {
    description?: string;
    dueDate?: string;
    maxPoints?: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  order: number;
  duration: number;
  content: LessonContent;
  resources: string[];
  isFree: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonDto {
  title: string;
  description: string;
  moduleId: string;
  order: number;
  duration?: number;
  content: {
    type: LessonType;
    videoUrl?: string;
    textContent?: string;
    documentUrl?: string;
    model3dUrl?: string;
    quizData?: Record<string, unknown>;
    assignmentData?: Record<string, unknown>;
  };
  resources?: string[];
  isFree?: boolean;
  isActive?: boolean;
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  order?: number;
  duration?: number;
  content?: {
    type?: LessonType;
    videoUrl?: string;
    textContent?: string;
    documentUrl?: string;
    model3dUrl?: string;
    quizData?: Record<string, unknown>;
    assignmentData?: Record<string, unknown>;
  };
  resources?: string[];
  isFree?: boolean;
  isActive?: boolean;
}

// Fonction utilitaire pour transformer les données backend vers frontend
const transformLessonData = (lesson: any): Lesson => {
  const transformedLesson = {
    ...lesson,
    id: lesson._id || lesson.id,
  };

  // Transformer les URLs dans le contenu de la leçon
  if (transformedLesson.content) {
    const content = transformedLesson.content;

    // Pour les vidéos
    if (content.videoUrl) {
      content.videoUrl = getFullFileUrl(content.videoUrl);
    }
    if (content.thumbnailUrl) {
      content.thumbnailUrl = getFullFileUrl(content.thumbnailUrl);
    }

    // Pour les documents
    if (content.documentUrl) {
      content.documentUrl = getFullFileUrl(content.documentUrl);
    }

    // Pour les modèles 3D
    if (content.model3dUrl) {
      content.model3dUrl = getFullFileUrl(content.model3dUrl);
    }

    // Pour les assignments (devoirs)
    if (content.assignmentData) {
      if (content.assignmentData.instructionVideoUrl) {
        content.assignmentData.instructionVideoUrl = getFullFileUrl(content.assignmentData.instructionVideoUrl);
      }
      if (content.assignmentData.instructionDocumentUrl) {
        content.assignmentData.instructionDocumentUrl = getFullFileUrl(content.assignmentData.instructionDocumentUrl);
      }
      if (content.assignmentData.documentUrl) {
        content.assignmentData.documentUrl = getFullFileUrl(content.assignmentData.documentUrl);
      }
      if (content.assignmentData.videoUrl) {
        content.assignmentData.videoUrl = getFullFileUrl(content.assignmentData.videoUrl);
      }
    }

    // Pour les quiz avec images
    if (content.quizData && content.quizData.questions) {
      content.quizData.questions.forEach((question: any) => {
        if (question.questionImage?.uploadedUrl) {
          question.questionImage.uploadedUrl = getFullFileUrl(question.questionImage.uploadedUrl);
        }
        if (question.audioData?.uploadedAudioUrl) {
          question.audioData.uploadedAudioUrl = getFullFileUrl(question.audioData.uploadedAudioUrl);
        }
      });
    }
  }

  return transformedLesson as Lesson;
};

class LessonService {
  // Créer une nouvelle leçon
  async createLesson(data: CreateLessonDto): Promise<Lesson> {
    const response = await api.post(`/modules/${data.moduleId}/lessons`, data);
    return transformLessonData(response.data);
  }

  // Récupérer toutes les leçons d'un module
  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    const response = await api.get(`/modules/${moduleId}/lessons`);
    // Transformer les données backend vers frontend
    return response.data.map((lesson: any) => transformLessonData(lesson));
  }

  // Récupérer les leçons gratuites d'un module
  async getFreeLessonsByModule(moduleId: string): Promise<Lesson[]> {
    const response = await api.get(`/modules/${moduleId}/lessons/free`);
    return response.data.map((lesson: any) => transformLessonData(lesson));
  }

  // Récupérer une leçon par ID
  async getLessonById(id: string): Promise<Lesson> {
    const response = await api.get(`/lessons/${id}`);
    return transformLessonData(response.data);
  }

  // Mettre à jour une leçon
  async updateLesson(id: string, data: UpdateLessonDto): Promise<Lesson> {
    const response = await api.patch(`/lessons/${id}`, data);
    return transformLessonData(response.data);
  }

  // Supprimer une leçon
  async deleteLesson(id: string): Promise<void> {
    await api.delete(`/lessons/${id}`);
  }

  // Réorganiser l'ordre des leçons
  async reorderLessons(moduleId: string, lessonIds: string[]): Promise<Lesson[]> {
    const response = await api.patch(`/modules/${moduleId}/lessons/reorder`, {
      lessonIds
    });
    return response.data.map((lesson: any) => transformLessonData(lesson));
  }

  // Créer plusieurs leçons en lot
  async createMultipleLessons(moduleId: string, lessons: Omit<CreateLessonDto, 'moduleId'>[]): Promise<Lesson[]> {
    const promises = lessons.map((lessonData, index) =>
      this.createLesson({
        ...lessonData,
        moduleId,
        order: lessonData.order ?? index
      })
    );

    return Promise.all(promises);
  }

  // Mettre à jour plusieurs leçons en lot
  async updateMultipleLessons(updates: { id: string; data: UpdateLessonDto }[]): Promise<Lesson[]> {
    const promises = updates.map(({ id, data }) => this.updateLesson(id, data));
    return Promise.all(promises);
  }

  // Dupliquer une leçon
  async duplicateLesson(id: string, newModuleId?: string): Promise<Lesson> {
    const originalLesson = await this.getLessonById(id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...lessonData } = originalLesson;

    const duplicatedData: CreateLessonDto = {
      ...lessonData,
      title: `${lessonData.title} (Copie)`,
      moduleId: newModuleId || lessonData.moduleId,
      order: lessonData.order + 1
    };

    return this.createLesson(duplicatedData);
  }

  // Convertir les données frontend vers le format backend
  convertToCreateDto(frontendLesson: Record<string, unknown>): CreateLessonDto {
    const content = (frontendLesson.content as Record<string, unknown>) || {};

    return {
      title: frontendLesson.title as string,
      description: (frontendLesson.description as string) || '',
      moduleId: frontendLesson.moduleId as string,
      order: frontendLesson.order as number,
      duration: (frontendLesson.duration as number) || 0,
      content: {
        type: frontendLesson.type as LessonType,
        videoUrl: content.videoUrl as string | undefined,
        textContent: content.textContent as string | undefined,
        documentUrl: content.documentUrl as string | undefined,
        model3dUrl: content.model3dUrl as string | undefined,
        quizData: content.quizData as Record<string, unknown> | undefined,
        assignmentData: content.assignmentData as Record<string, unknown> | undefined
      },
      resources: (frontendLesson.resources as string[]) || [],
      isFree: (frontendLesson.isFree as boolean) || false,
      isActive: (frontendLesson.isActive as boolean) !== false
    };
  }

  // Convertir les données backend vers le format frontend
  convertToFrontend(backendLesson: Lesson): Record<string, unknown> {
    return {
      id: backendLesson.id,
      title: backendLesson.title,
      description: backendLesson.description,
      moduleId: backendLesson.moduleId,
      order: backendLesson.order,
      duration: backendLesson.duration,
      type: backendLesson.content.type,
      content: backendLesson.content,
      resources: backendLesson.resources,
      isFree: backendLesson.isFree,
      isActive: backendLesson.isActive,
      createdAt: backendLesson.createdAt,
      updatedAt: backendLesson.updatedAt
    };
  }
}

export const lessonService = new LessonService();
export default lessonService;