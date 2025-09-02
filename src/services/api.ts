import axios from 'axios';
import type { ApiError } from '@/types/auth';

// Configuration de base d'Axios
export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion des erreurs d'authentification - uniquement pour les utilisateurs connectés
    if (error.response?.status === 401 && localStorage.getItem('access_token')) {
      // Token expiré ou invalide, rediriger vers login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Éviter de rediriger si on est déjà sur une page d'auth
      if (!window.location.pathname.includes('/sign') && !window.location.pathname.includes('/auth')) {
        window.location.href = '/signin';
      }
    }

    // Formatage des erreurs API
    const apiError: ApiError = {
      message: error.response?.data?.message || 'Une erreur est survenue',
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error
    };

    return Promise.reject(apiError);
  }
);

export default api;