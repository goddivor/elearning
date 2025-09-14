import api from './api';

export interface Module {
  id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleDto {
  title: string;
  description: string;
  courseId: string;
  order: number;
  duration?: number;
  isActive?: boolean;
}

export interface UpdateModuleDto {
  title?: string;
  description?: string;
  order?: number;
  duration?: number;
  isActive?: boolean;
}

class ModuleService {
  // Créer un nouveau module
  async createModule(data: CreateModuleDto): Promise<Module> {
    const response = await api.post(`/courses/${data.courseId}/modules`, data);
    return response.data;
  }

  // Récupérer tous les modules d'un cours
  async getModulesByCourse(courseId: string): Promise<Module[]> {
    const response = await api.get(`/courses/${courseId}/modules`);
    // Transformer _id en id pour la compatibilité frontend
    return response.data.map((module: Module & { _id?: string }) => ({
      ...module,
      id: module._id || module.id
    }));
  }

  // Récupérer un module par ID
  async getModuleById(id: string): Promise<Module> {
    const response = await api.get(`/modules/${id}`);
    return response.data;
  }

  // Mettre à jour un module
  async updateModule(id: string, data: UpdateModuleDto): Promise<Module> {
    const response = await api.patch(`/modules/${id}`, data);
    return response.data;
  }

  // Supprimer un module
  async deleteModule(id: string): Promise<void> {
    await api.delete(`/modules/${id}`);
  }

  // Réorganiser l'ordre des modules
  async reorderModules(courseId: string, moduleIds: string[]): Promise<Module[]> {
    const response = await api.patch(`/courses/${courseId}/modules/reorder`, {
      moduleIds
    });
    return response.data;
  }

  // Créer plusieurs modules en lot
  async createMultipleModules(courseId: string, modules: Omit<CreateModuleDto, 'courseId'>[]): Promise<Module[]> {
    const promises = modules.map((moduleData, index) =>
      this.createModule({
        ...moduleData,
        courseId,
        order: moduleData.order ?? index
      })
    );

    return Promise.all(promises);
  }

  // Mettre à jour plusieurs modules en lot
  async updateMultipleModules(updates: { id: string; data: UpdateModuleDto }[]): Promise<Module[]> {
    const promises = updates.map(({ id, data }) => this.updateModule(id, data));
    return Promise.all(promises);
  }
}

export const moduleService = new ModuleService();
export default moduleService;