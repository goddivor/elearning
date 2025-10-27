/**
 * Utilitaires pour la gestion des fichiers et URLs du serveur
 */

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

/**
 * Convertit une URL relative de fichier en URL complète vers le serveur
 * Fonctionne pour TOUS les fichiers du dossier uploads : images, documents, vidéos, 3D, etc.
 * @param fileUrl - URL relative ou complète du fichier
 * @returns URL complète du fichier
 */
export const getFullFileUrl = (fileUrl: string | null | undefined): string => {
  if (!fileUrl) return '';

  // Si l'URL est déjà complète (commence par http:// ou https://), la retourner telle quelle
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }

  // Si l'URL commence par '/uploads', ajouter l'URL du serveur
  if (fileUrl.startsWith('/uploads')) {
    return `${SERVER_URL}${fileUrl}`;
  }

  // Si l'URL commence par 'uploads' (sans /), ajouter l'URL du serveur avec /
  if (fileUrl.startsWith('uploads')) {
    return `${SERVER_URL}/${fileUrl}`;
  }

  // Pour toute autre URL relative, ajouter l'URL du serveur
  return `${SERVER_URL}/${fileUrl}`;
};

/**
 * Alias pour la compatibilité - utilise getFullFileUrl
 * @deprecated Utilisez getFullFileUrl à la place
 */
export const getFullImageUrl = getFullFileUrl;

/**
 * Vérifie si une URL de fichier est valide
 * @param fileUrl - URL du fichier à vérifier
 * @returns true si l'URL est valide, false sinon
 */
export const isValidFileUrl = (fileUrl: string | null | undefined): boolean => {
  if (!fileUrl) return false;
  return fileUrl.trim().length > 0;
};

/**
 * Alias pour la compatibilité - utilise isValidFileUrl
 * @deprecated Utilisez isValidFileUrl à la place
 */
export const isValidImageUrl = isValidFileUrl;