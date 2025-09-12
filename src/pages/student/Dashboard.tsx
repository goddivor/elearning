// React import removed - not needed with new JSX transform
import useTitle from '@/hooks/useTitle';

const StudentDashboard = () => {
  useTitle("Dashboard Étudiant");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Étudiant</h1>
      <p className="text-gray-600">Bienvenue sur votre tableau de bord étudiant.</p>
    </div>
  );
};

export default StudentDashboard;