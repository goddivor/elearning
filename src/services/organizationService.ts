import api from './api';

export interface Organization {
  id: string;
  name: string;
  description: string;
  type: 'school' | 'university' | 'training-center' | 'corporate';
  address: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  website?: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Type pour les données brutes du backend MongoDB
interface RawOrganization extends Omit<Organization, 'id' | 'manager'> {
  _id?: string;
  id?: string;
  manager?: {
    _id?: string;
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export interface CreateOrganizationData {
  name: string;
  description: string;
  type: 'school' | 'university' | 'training-center' | 'corporate';
  address: string;
  contactEmail: string;
  contactPhone: string;
  isActive?: boolean;
  website?: string;
}

export type UpdateOrganizationData = Partial<CreateOrganizationData>;

export interface OrganizationFilters {
  type?: string;
  isActive?: boolean;
  search?: string;
}

export const organizationService = {
  /**
   * Récupérer toutes les organisations avec filtres optionnels
   */
  async getAll(filters?: OrganizationFilters): Promise<Organization[]> {
    const params = new URLSearchParams();

    if (filters?.type) params.append('type', filters.type);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/organizations?${queryString}` : '/organizations';

    const response = await api.get(url);
    return response.data.map((org: RawOrganization): Organization => ({
      ...org,
      id: org._id || org.id || '',
      manager: org.manager ? {
        ...org.manager,
        id: org.manager._id || org.manager.id || ''
      } : undefined
    }));
  },

  /**
   * Récupérer une organisation par son ID
   */
  async getById(id: string): Promise<Organization> {
    const response = await api.get(`/organizations/${id}`);
    const org: RawOrganization = response.data;
    return {
      ...org,
      id: org._id || org.id || '',
      manager: org.manager ? {
        ...org.manager,
        id: org.manager._id || org.manager.id || ''
      } : undefined
    };
  },

  /**
   * Créer une nouvelle organisation
   */
  async create(data: CreateOrganizationData): Promise<Organization> {
    const response = await api.post('/organizations', data);
    const org = response.data;
    return {
      ...org,
      id: org._id || org.id
    };
  },

  /**
   * Mettre à jour une organisation
   */
  async update(id: string, data: UpdateOrganizationData): Promise<Organization> {
    const response = await api.patch(`/organizations/${id}`, data);
    const org = response.data;
    return {
      ...org,
      id: org._id || org.id
    };
  },

  /**
   * Supprimer une organisation
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/organizations/${id}`);
  },

  /**
   * Activer/désactiver une organisation
   */
  async toggleStatus(id: string): Promise<Organization> {
    const response = await api.patch(`/organizations/${id}/toggle-status`);
    const org = response.data;
    return {
      ...org,
      id: org._id || org.id
    };
  },

  /**
   * Dupliquer une organisation
   */
  async duplicate(id: string): Promise<Organization> {
    const response = await api.post(`/organizations/${id}/duplicate`);
    const org = response.data;
    return {
      ...org,
      id: org._id || org.id
    };
  },

  /**
   * Récupérer les instructeurs disponibles comme gestionnaires
   */
  async getAvailableManagers(): Promise<Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>> {
    const response = await api.get('/organizations/available-managers');
    return response.data;
  },

  /**
   * Assigner un gestionnaire à une organisation
   */
  async assignManager(organizationId: string, managerId: string): Promise<Organization> {
    const response = await api.patch(`/organizations/${organizationId}/assign-manager`, {
      managerId
    });
    const org = response.data;
    return {
      ...org,
      id: org._id || org.id
    };
  },


  /**
   * Obtenir les options de types d'organisation avec labels
   */
  getTypeOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'school', label: 'École' },
      { value: 'university', label: 'Université' },
      { value: 'training-center', label: 'Centre de Formation' },
      { value: 'corporate', label: 'Institut privé' }
    ];
  },


  /**
   * Obtenir le label d'un type d'organisation
   */
  getTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      'school': 'École',
      'university': 'Université',
      'training-center': 'Centre de Formation',
      'corporate': 'Institut privé'
    };
    return typeMap[type] || type;
  },


  /**
   * Valider les données d'organisation
   */
  validateOrganizationData(data: CreateOrganizationData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Le nom de l\'organisation est requis');
    }

    if (!data.description?.trim()) {
      errors.push('La description est requise');
    }

    if (!data.type) {
      errors.push('Le type d\'organisation est requis');
    }

    if (!data.address?.trim()) {
      errors.push('L\'adresse est requise');
    }

    if (!data.contactEmail?.trim()) {
      errors.push('L\'email de contact est requis');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.contactEmail)) {
        errors.push('L\'email de contact n\'est pas valide');
      }
    }

    if (!data.contactPhone?.trim()) {
      errors.push('Le téléphone de contact est requis');
    }


    return {
      isValid: errors.length === 0,
      errors
    };
  }
};