export interface AvatarUploadResponse {
  message: string;
  avatarUrl: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

class AvatarService {
  private baseUrl = 'http://localhost:3001/api/users';

  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    const response = await fetch(`${this.baseUrl}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  async removeAvatar(): Promise<{ message: string }> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Token non trouvé');
    }

    const response = await fetch(`${this.baseUrl}/avatar`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  // Construire l'URL complète d'un avatar
  getAvatarUrl(avatarPath: string): string {
    if (!avatarPath) return '';

    // Si c'est déjà une URL complète, la retourner telle quelle
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }

    // Sinon, construire l'URL avec le serveur
    return `http://localhost:3001${avatarPath}`;
  }

  // Valider un fichier image
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Seuls les fichiers JPG, PNG et GIF sont autorisés'
      };
    }

    // Vérifier la taille (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Le fichier doit faire moins de 5MB'
      };
    }

    return { valid: true };
  }
}

export const avatarService = new AvatarService();