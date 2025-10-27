import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { People, UserAdd, Profile, TickCircle, Category } from 'iconsax-react';
import useTitle from '@/hooks/useTitle';
import MetricCard from '@/components/ui/MetricCard';
import DataTable, { type Column } from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { userService, type User, type UserStats } from '@/services/userService';
import { avatarService } from '@/services/avatarService';

const AdminDashboard = () => {
  useTitle("Dashboard Admin");
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        userService.getUserStats(),
        userService.getAllUsers()
      ]);
      setStats(statsData);
      setUsers(usersData.slice(0, 5)); // Derniers 5 utilisateurs pour la preview
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await userService.deactivateUser(userId);
      } else {
        await userService.activateUser(userId);
      }
      loadDashboardData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
    }
  };

  const userColumns: Column<User>[] = [
    {
      key: 'firstName',
      title: 'Nom complet',
      render: (_, user) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full mr-3 overflow-hidden">
            {user.avatar ? (
              <img
                src={avatarService.getAvatarUrl(user.avatar)}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Rôle',
      render: (role) => (
        <Badge
          variant={
            role === 'admin' ? 'danger' :
            role === 'instructor' ? 'primary' :
            role === 'organization' ? 'warning' : 'success'
          }
          size="sm"
        >
          {role === 'admin' ? 'Administrateur' :
           role === 'instructor' ? 'Instructeur' :
           role === 'organization' ? 'Organisation' : 'Étudiant'}
        </Badge>
      )
    },
    {
      key: 'isActive',
      title: 'Statut',
      render: (isActive, user) => (
        <Button
          onClick={() => handleToggleUserStatus(user.id, isActive)}
          variant="ghost"
          size="sm"
        >
          <Badge 
            variant={isActive ? 'success' : 'default'}
            size="sm"
          >
            {isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </Button>
      )
    },
    {
      key: 'createdAt',
      title: 'Inscription',
      render: (date) => new Date(date).toLocaleDateString('fr-FR')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Category size={32} color="#1D4ED8" variant="Bold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Administrateur
            </h1>
            <p className="text-gray-600 mt-1">
              Vue d'ensemble de la plateforme e-learning
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Utilisateurs"
          value={loading ? "..." : (stats?.totalUsers || 0).toLocaleString()}
          change={12}
          trend="up"
          icon={<People size={24} color="#1D4ED8" variant="Bold" />}
          description="Tous les comptes"
          color="#1D4ED8"
        />

        <MetricCard
          title="Instructeurs"
          value={loading ? "..." : (stats?.totalInstructors || 0).toLocaleString()}
          change={8}
          trend="up"
          icon={<UserAdd size={24} color="#059669" variant="Bold" />}
          description="Professeurs actifs"
          color="#059669"
        />

        <MetricCard
          title="Étudiants"
          value={loading ? "..." : (stats?.totalStudents || 0).toLocaleString()}
          change={15}
          trend="up"
          icon={<Profile size={24} color="#7C3AED" variant="Bold" />}
          description="Inscrits cette semaine"
          color="#7C3AED"
        />

        <MetricCard
          title="Utilisateurs Actifs"
          value={loading ? "..." : (stats?.activeUsers || 0).toLocaleString()}
          change={stats ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}
          trend="up"
          icon={<TickCircle size={24} color="#DC2626" variant="Bold" />}
          description="Connectés récemment"
          color="#DC2626"
        />
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Utilisateurs Récents</h2>
            <p className="text-sm text-gray-500 mt-1">Derniers comptes créés</p>
          </div>
          <Button variant="outline" size="sm">
            <Link to="/dashboard/admin/users" className="flex items-center space-x-2">
              <span>Voir tous</span>
              <span>→</span>
            </Link>
          </Button>
        </div>
        
        <DataTable
          columns={userColumns}
          data={users}
          loading={loading}
          pagination={false}
          emptyState={
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a4 4 0 110-8 4 4 0 010 8zm-6-3a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
              <p className="text-gray-500">Les nouveaux utilisateurs apparaîtront ici.</p>
            </div>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <UserAdd size={24} color="#059669" variant="Bold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nouvel Utilisateur</h3>
              <p className="text-sm text-gray-500">Créer un nouveau compte</p>
            </div>
          </div>
          <Button className="w-full" style={{ backgroundColor: '#059669' }}>
            Créer un utilisateur
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Rapports</h3>
              <p className="text-sm text-gray-500">Analyser l'activité</p>
            </div>
          </div>
          <Button className="w-full">
            Voir les rapports
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <Profile size={24} color="#7C3AED" variant="Bold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Gestion des Profils</h3>
              <p className="text-sm text-gray-500">Permissions et rôles</p>
            </div>
          </div>
          <Button className="w-full" style={{ backgroundColor: '#7C3AED' }}>
            <Link to="/dashboard/admin/profiles" className="w-full">
              Gérer les profils
            </Link>
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-lg bg-indigo-50">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Paramètres</h3>
              <p className="text-sm text-gray-500">Configuration système</p>
            </div>
          </div>
          <Button className="w-full" style={{ backgroundColor: '#6366F1' }}>
            Accéder aux paramètres
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;