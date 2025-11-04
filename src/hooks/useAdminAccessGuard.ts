import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { IS_ADMIN_ACCESS_VALID } from '@/graphql/mutations/admin-access.mutations';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/toast-context';

/**
 * Hook pour protéger les routes admin et vérifier continuellement
 * la validité du token d'accès admin
 */
export function useAdminAccessGuard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { error: showError } = useToast();

  const adminAccessToken = localStorage.getItem('admin_access_token');
  const tokenExpiresAt = localStorage.getItem('admin_token_expires_at');

  // Vérifier si l'utilisateur est admin (insensible à la casse)
  const isAdmin =
    user?.roles?.some(role => role.toLowerCase() === 'admin') ||
    user?.role?.toLowerCase() === 'admin' ||
    user?.activeRole?.toLowerCase() === 'admin';

  // Vérifier la validité du token via GraphQL toutes les 30 secondes
  const { data, error } = useQuery(IS_ADMIN_ACCESS_VALID, {
    skip: !adminAccessToken || !isAdmin,
    pollInterval: 30000, // Vérifier toutes les 30 secondes
    fetchPolicy: 'network-only', // Toujours vérifier avec le serveur
  });

  useEffect(() => {
    // Attendre que le user soit chargé avant de faire les vérifications
    if (!user) {
      return;
    }

    // Vérifier que l'utilisateur est admin
    if (!isAdmin) {
      showError(
        'Accès refusé',
        'Vous devez être administrateur pour accéder à cette page',
      );
      logout();
      navigate('/', { replace: true });
      return;
    }

    // Vérifier que le token d'accès existe
    if (!adminAccessToken) {
      showError(
        'Token manquant',
        'Accès admin non autorisé. Veuillez utiliser un lien d\'accès valide.',
      );
      logout();
      navigate('/', { replace: true });
      return;
    }

    // Vérifier l'expiration locale
    if (tokenExpiresAt) {
      const expirationTime = new Date(tokenExpiresAt).getTime();
      const now = Date.now();

      if (now >= expirationTime) {
        showError(
          'Session expirée',
          'Votre token d\'accès admin a expiré. Veuillez générer un nouveau token.',
        );
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_token_expires_at');
        logout();
        navigate('/', { replace: true });
        return;
      }
    }
  }, [
    user,
    isAdmin,
    adminAccessToken,
    tokenExpiresAt,
    navigate,
    logout,
    showError,
  ]);

  // Vérifier la réponse du serveur
  useEffect(() => {
    if (data && !data.isAdminAccessValid) {
      showError(
        'Token invalide',
        'Votre token d\'accès admin n\'est plus valide. Veuillez vous reconnecter.',
      );
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_token_expires_at');
      logout();
      navigate('/', { replace: true });
    }
  }, [data, navigate, logout, showError]);

  useEffect(() => {
    if (error) {
      console.error('Error checking admin access:', error);
    }
  }, [error]);

  return {
    isAdmin,
    adminAccessToken,
    isValid: data?.isAdminAccessValid ?? false,
  };
}
