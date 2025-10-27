import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Category,
  Book1,
  People,
  Chart,
  BookSaved,
  Medal,
  Video,
  Profile2User,
  Buildings,
  Crown,
  LogoutCurve
} from 'iconsax-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { avatarService } from '@/services/avatarService';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    variant?: "Linear" | "Outline" | "Broken" | "Bold" | "Bulk" | "TwoTone";
  }>;
  badge?: number;
}

interface SidebarProps {
  isCollapsed?: boolean;
}

function SidebarNavItem({ item, isCollapsed }: { item: SidebarItem; isCollapsed: boolean }) {
  const { pathname } = useLocation();

  // Improved active state logic
  const isActive = (() => {
    // Exact match for root dashboard routes
    if (item.href === '/dashboard/admin' ||
        item.href === '/dashboard/instructor' ||
        item.href === '/dashboard/student') {
      return pathname === item.href;
    }

    // For other routes, check if pathname starts with the item href
    // but make sure it's not conflicting with other similar routes
    if (pathname === item.href) {
      return true;
    }

    // Special handling for course-related routes
    if (item.href === '/dashboard/instructor/courses') {
      return pathname === '/dashboard/instructor/courses' ||
             pathname.startsWith('/dashboard/instructor/course-builder');
    }

    return pathname.startsWith(`${item.href}/`);
  })();

  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center transition-colors rounded-lg relative group",
        isCollapsed ? "justify-center px-3 py-3 mx-2" : "px-4 py-3 mx-2",
        isActive
          ? "bg-[#0a3d5c] text-white"
          : "text-gray-300 hover:bg-[#0a3d5c] hover:text-white"
      )}
    >
      <div className={cn("flex items-center", !isCollapsed && "space-x-3")}>
        <Icon
          size={20}
          color={isActive ? "#FFFFFF" : "#D1D5DB"}
          variant={isActive ? "Bold" : "Outline"}
        />
        {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
      </div>

      {item.badge && !isCollapsed && (
        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

const Sidebar = ({ isCollapsed = false }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarKey, setAvatarKey] = useState(Date.now());

  const userRole = user?.role || 'student';

  // Force avatar refresh when user changes
  useEffect(() => {
    setAvatarKey(Date.now());
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const getProfileRoute = () => {
    switch (user?.role) {
      case 'admin': return '/dashboard/admin/profile';
      case 'instructor': return '/dashboard/instructor/profile';
      case 'student': return '/dashboard/student/profile';
      default: return '/dashboard/profile';
    }
  };

  const getMenuItems = (): SidebarItem[] => {
    switch (userRole) {
      case 'admin':
        return [
          {
            title: 'Dashboard',
            icon: Category,
            href: '/dashboard/admin'
          },
          {
            title: 'Gestion Utilisateurs',
            icon: People,
            href: '/dashboard/admin/users'
          },
          {
            title: 'Gestion des Profils',
            icon: Profile2User,
            href: '/dashboard/admin/profiles'
          },
          {
            title: 'Gestion des Cours',
            icon: Book1,
            href: '/dashboard/admin/courses'
          },
          {
            title: 'Organisations',
            icon: Buildings,
            href: '/dashboard/admin/organizations'
          },
          {
            title: 'Statistiques',
            icon: Chart,
            href: '/dashboard/admin/stats'
          }
        ];

      case 'instructor':
        return [
          {
            title: 'Dashboard',
            icon: Category,
            href: '/dashboard/instructor'
          },
          {
            title: 'Mes Cours',
            icon: Book1,
            href: '/dashboard/instructor/courses'
          },
          {
            title: 'Mes Étudiants',
            icon: Profile2User,
            href: '/dashboard/instructor/students'
          },
          {
            title: 'Analytics',
            icon: Chart,
            href: '/dashboard/instructor/analytics'
          },
          {
            title: 'Bibliothèque',
            icon: Video,
            href: '/dashboard/instructor/library'
          }
        ];

      case 'student':
      default:
        return [
          {
            title: 'Dashboard',
            icon: Category,
            href: '/dashboard/student'
          },
          {
            title: 'Catalogue',
            icon: Book1,
            href: '/dashboard/student/catalog'
          },
          {
            title: 'Mes Cours',
            icon: BookSaved,
            href: '/dashboard/student/courses'
          },
          {
            title: 'Progression',
            icon: Chart,
            href: '/dashboard/student/progress'
          },
          {
            title: 'Classement',
            icon: Crown,
            href: '/dashboard/student/leaderboard'
          },
          {
            title: 'Certificats',
            icon: Medal,
            href: '/student/certificates'
          }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#041e31] border-r border-[#0a3d5c] overflow-y-auto transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header avec nom du site */}
      <div className="p-6 border-b border-[#0a3d5c]">
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-white">3DELearning</h1>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <span className="text-white font-bold text-xl">3D</span>
          </div>
        )}
      </div>

      {/* Profile Avatar Section */}
      <div className="p-4 border-b border-[#0a3d5c]">
        <Link
          to={getProfileRoute()}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#0a3d5c] transition-colors"
        >
          <div className="flex-shrink-0">
            {user?.avatar ? (
              <img
                key={avatarKey}
                src={`${avatarService.getAvatarUrl(user.avatar)}?v=${avatarKey}`}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-500">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.role === 'admin' && 'Administrateur'}
                {user?.role === 'instructor' && 'Instructeur'}
                {user?.role === 'student' && 'Étudiant'}
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </div>

      {/* Logout Button at Bottom */}
      <div className="p-4 border-t border-[#0a3d5c]">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full transition-colors rounded-lg p-3",
            "text-gray-300 hover:bg-red-900/20 hover:text-red-400",
            isCollapsed ? "justify-center" : "space-x-3"
          )}
        >
          <LogoutCurve size={20} color="currentColor" />
          {!isCollapsed && <span className="text-sm font-medium">Se déconnecter</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
