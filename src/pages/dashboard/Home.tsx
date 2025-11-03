import { useAuth } from '@/contexts/AuthContext';
import { Book1, Teacher, Building3, TrendUp } from 'iconsax-react';

const Home = () => {
  const { user } = useAuth();

  // Check active roles
  const hasInstructorRole = user?.roles?.includes('instructor');
  const hasOrganizationRole = user?.roles?.includes('organization');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {user?.fullName || user?.firstName || 'Utilisateur'} 👋
        </h1>
        <p className="text-purple-100 text-lg">
          Prêt à continuer votre apprentissage aujourd'hui ?
        </p>
        <div className="flex items-center gap-3 mt-4">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
            {user?.activeRole || user?.role || 'student'}
          </span>
          {user?.roles && user.roles.length > 1 && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              +{user.roles.length - 1} autre(s) rôle(s)
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Student Stats - Always visible */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Book1 size={24} variant="Bold" color="#3B82F6" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
          <p className="text-gray-600 text-sm">Cours suivis</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendUp size={24} variant="Bold" color="#10B981" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">0%</h3>
          <p className="text-gray-600 text-sm">Progression moyenne</p>
        </div>

        {/* Instructor Stats - Only if has instructor role */}
        {hasInstructorRole && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Teacher size={24} variant="Bold" color="#8B5CF6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-gray-600 text-sm">Cours créés</p>
          </div>
        )}

        {/* Organization Stats - Only if has organization role */}
        {hasOrganizationRole && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building3 size={24} variant="Bold" color="#F97316" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-gray-600 text-sm">Membres</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all text-left">
            <Book1 size={24} variant="Bold" color="#8B5CF6" className="mb-2" />
            <h3 className="font-semibold text-gray-900">Explorer les cours</h3>
            <p className="text-sm text-gray-600 mt-1">Découvrir de nouveaux cours</p>
          </button>

          {hasInstructorRole ? (
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all text-left">
              <Teacher size={24} variant="Bold" color="#10B981" className="mb-2" />
              <h3 className="font-semibold text-gray-900">Créer un cours</h3>
              <p className="text-sm text-gray-600 mt-1">Commencer à enseigner</p>
            </button>
          ) : (
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left">
              <Teacher size={24} variant="Bold" color="#9CA3AF" className="mb-2" />
              <h3 className="font-semibold text-gray-900">Devenir instructeur</h3>
              <p className="text-sm text-gray-600 mt-1">Activez votre rôle instructeur</p>
            </button>
          )}

          {hasOrganizationRole ? (
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all text-left">
              <Building3 size={24} variant="Bold" color="#EC4899" className="mb-2" />
              <h3 className="font-semibold text-gray-900">Mon organisation</h3>
              <p className="text-sm text-gray-600 mt-1">Gérer votre organisation</p>
            </button>
          ) : (
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left">
              <Building3 size={24} variant="Bold" color="#9CA3AF" className="mb-2" />
              <h3 className="font-semibold text-gray-900">Créer une organisation</h3>
              <p className="text-sm text-gray-600 mt-1">Souscrire pour créer une org</p>
            </button>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activité récente</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Aucune activité récente</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
