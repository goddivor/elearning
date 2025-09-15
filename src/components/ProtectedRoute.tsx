import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'instructor' | 'student';
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requiredRole
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification de l'auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Rediriger vers login si auth requise mais pas authentifié
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Vérifier le rôle si spécifié
  if (requiredRole && user?.role !== requiredRole) {
    // Rediriger vers le dashboard approprié selon le rôle
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/dashboard/admin" replace />;
      case 'instructor':
        return <Navigate to="/dashboard/instructor" replace />;
      case 'student':
      default:
        return <Navigate to="/dashboard/student" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;