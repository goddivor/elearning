import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Category,
  Book1,
  People,
  Chart,
  User,
  BookSaved,
  Medal,
  Video,
  Profile2User,
  Buildings,
  Crown} from 'iconsax-react';
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
        "lg:justify-between lg:px-4 lg:py-3 justify-center px-3 py-3 mx-2",
        isActive
          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <div className="lg:flex lg:items-center lg:space-x-3 flex items-center justify-center">
        <Icon
          size={20}
          color={isActive ? "#1D4ED8" : "#6B7280"}
          variant={isActive ? "Bold" : "Outline"}
        />
        <span className="text-sm font-medium hidden lg:block">{item.title}</span>
      </div>

      {item.badge && (
        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full hidden lg:inline">
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
          },
          {
            title: 'Mon Profil',
            icon: User,
            href: '/dashboard/admin/profile'
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
          },
          {
            title: 'Mon Profil',
            icon: User,
            href: '/dashboard/instructor/profile'
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
          },
          {
            title: 'Mon Profil',
            icon: User,
            href: '/dashboard/student/profile'
          }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 lg:w-64 w-16">
      <div className="lg:p-4 p-2">
        {/* Navigation Menu */}
        <nav className="lg:space-y-1 space-y-2">
          {menuItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} />
          ))}
        </nav>
      </div>

    </aside>
  );
};

export default Sidebar;