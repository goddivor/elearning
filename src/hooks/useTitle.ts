import { useEffect } from 'react';

/**
 * Hook personnalisé pour gérer le titre de la page
 * @param title - Le titre à afficher pour cette page
 * @param suffix - Suffixe optionnel (par défaut: "3D E-Learning")
 */
const useTitle = (title: string, suffix: string = "3D E-Learning") => {
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