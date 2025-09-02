import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RoleBasedRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Rediriger selon le rôle
  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'instructor':
      return <Navigate to="/dashboard/instructor" replace />;
    case 'student':
    default:
      return <Navigate to="/dashboard/student" replace />;
  }
};

export default RoleBasedRedirect;