import { useEffect } from 'react';

/**
 * Hook personnalisé pour gérer le titre de la page
 * @param title - Le titre à afficher pour cette page
 * @param suffix - Suffixe optionnel (par défaut: "Elearning 3D+")
 */
const useTitle = (title: string, suffix: string = "Elearning 3D+") => {
  useEffect(() => {
    const fullTitle = title ? `${title} - ${suffix}` : suffix;
    document.title = fullTitle;

    // Cleanup: restaurer le titre par défaut quand le composant se démonte
    return () => {
      document.title = suffix;
    };
  }, [title, suffix]);
};

export default useTitle;