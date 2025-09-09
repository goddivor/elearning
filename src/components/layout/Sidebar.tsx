import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Category, 
  Book1, 
  People, 
  Chart, 
  Setting2, 
  User, 
  BookSaved,
  Medal,
  Video,
  Profile2User,
  UserAdd
} from 'iconsax-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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

function SidebarNavItem({ item }: { item: SidebarItem }) {
  const { pathname } = useLocation();
  // Fix for dashboard route conflicts
  const isActive = pathname === item.href || 
    (item.href !== '/dashboard/admin' && pathname.startsWith(`${item.href}/`));
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <div className="flex items-center space-x-3">
        <Icon
          size={20}
          color={isActive ? "#1D4ED8" : "#6B7280"}
          variant={isActive ? "Bold" : "Outline"}
        />
        <span>{item.title}</span>
      </div>
      {item.badge && (
        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

const Sidebar = () => {
  const { user } = useAuth();
  
  const userRole = user?.role || 'student';

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
            title: 'Gestion des Cours',
            icon: Book1,
            href: '/dashboard/admin/courses'
          },
          {
            title: 'Statistiques',
            icon: Chart,
            href: '/dashboard/admin/stats'
          },
          {
            title: 'Paramètres Système',
            icon: Setting2,
            href: '/dashboard/admin/settings'
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
            title: 'Créer un Cours',
            icon: UserAdd,
            href: '/dashboard/instructor/create-course'
          },
          {
            title: 'Mes Étudiants',
            icon: Profile2User,
            href: '/dashboard/instructor/students'
          },
          {
            title: 'Bibliothèque',
            icon: Video,
            href: '/dashboard/instructor/library'
          },
          {
            title: 'Analytics',
            icon: Chart,
            href: '/dashboard/instructor/analytics'
          },
          {
            title: 'Paramètres',
            icon: Setting2,
            href: '/dashboard/instructor/settings'
          }
        ];
      
      case 'student':
      default:
        return [
          {
            title: 'Dashboard',
            icon: Category,
            href: '/student/dashboard'
          },
          {
            title: 'Mes Cours',
            icon: BookSaved,
            href: '/student/courses'
          },
          {
            title: 'Parcourir',
            icon: Book1,
            href: '/student/browse'
          },
          {
            title: 'Progression',
            icon: Chart,
            href: '/student/progress'
          },
          {
            title: 'Certificats',
            icon: Medal,
            href: '/student/certificates'
          },
          {
            title: 'Mon Profil',
            icon: User,
            href: '/student/profile'
          }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {userRole === 'admin' ? 'Administration' : 
             userRole === 'instructor' ? 'Instructeur' : 'Étudiant'}
          </h2>
          <p className="text-sm text-gray-500">
            {userRole === 'admin' ? 'Gestion de la plateforme' : 
             userRole === 'instructor' ? 'Gestion des cours' : 'Mon apprentissage'}
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 text-center">
            3D E-Learning Platform
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;