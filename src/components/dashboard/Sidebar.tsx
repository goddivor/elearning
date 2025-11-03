import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home2,
  Book1,
  Category,
  Teacher,
  Building3,
  Setting2,
  User,
  LogoutCurve,
} from 'iconsax-react';

interface SidebarProps {
  isCollapsed: boolean;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  requiredRole?: string;
}

export const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Check active roles
  const hasInstructorRole = user?.roles?.includes('instructor');
  const hasOrganizationRole = user?.roles?.includes('organization');

  // Menu items dynamiques selon les rôles
  const menuItems: MenuItem[] = [
    {
      icon: <Home2 size={20} variant="Bold" color="#3B82F6" />,
      label: 'Accueil',
      path: '/dashboard',
    },
    {
      icon: <Book1 size={20} variant="Bold" color="#8B5CF6" />,
      label: 'Mes Cours',
      path: '/dashboard/my-courses',
    },
    {
      icon: <Category size={20} variant="Bold" color="#F59E0B" />,
      label: 'Catalogue',
      path: '/dashboard/catalog',
    },
  ];

  // Add instructor menu if user has instructor role
  if (hasInstructorRole) {
    menuItems.push({
      icon: <Teacher size={20} variant="Bold" color="#10B981" />,
      label: 'Enseigner',
      path: '/dashboard/instructor',
    });
  }

  // Add organization menu if user has organization role
  if (hasOrganizationRole) {
    menuItems.push({
      icon: <Building3 size={20} variant="Bold" color="#EC4899" />,
      label: 'Organisation',
      path: '/dashboard/organization',
    });
  }

  // Always add settings and profile at the end
  menuItems.push(
    {
      icon: <User size={20} variant="Bold" color="#6366F1" />,
      label: 'Profil',
      path: '/dashboard/profile',
    },
    {
      icon: <Setting2 size={20} variant="Bold" color="#64748B" />,
      label: 'Paramètres',
      path: '/dashboard/settings',
    }
  );

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {isCollapsed ? (
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">3D</span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">3D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Elearning</span>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        {isCollapsed ? (
          <div className="flex justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {user?.fullName?.[0] || 'U'}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {user?.fullName?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.fullName || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.activeRole || user?.role || 'student'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            } px-3 py-2.5 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-purple-50 text-purple-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <span
              className={
                isActive(item.path) ? 'text-purple-600' : 'text-gray-600'
              }
            >
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={logout}
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          } w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors`}
          title={isCollapsed ? 'Déconnexion' : undefined}
        >
          <LogoutCurve size={20} variant="Bold" color="#EF4444" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Déconnexion</span>
          )}
        </button>
      </div>
    </aside>
  );
};
