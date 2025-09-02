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
  Note,
  Teacher,
  Profile2User
} from 'iconsax-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const userRole = user?.role || 'student';

  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return [
          {
            title: 'Dashboard',
            icon: Category,
            path: '/admin/dashboard'
          },
          {
            title: 'Utilisateurs',
            icon: People,
            path: '/admin/users'
          },
          {
            title: 'Cours',
            icon: Book1,
            path: '/admin/courses'
          },
          {
            title: 'Statistiques',
            icon: Chart,
            path: '/admin/stats'
          },
          {
            title: 'Paramètres',
            icon: Setting2,
            path: '/admin/settings'
          }
        ];
      
      case 'instructor':
        return [
          {
            title: 'Dashboard',
            icon: Category,
            path: '/instructor/dashboard'
          },
          {
            title: 'Mes Cours',
            icon: Book1,
            path: '/instructor/courses'
          },
          {
            title: 'Créer un Cours',
            icon: Note,
            path: '/instructor/create-course'
          },
          {
            title: 'Étudiants',
            icon: Profile2User,
            path: '/instructor/students'
          },
          {
            title: 'Analyses',
            icon: Chart,
            path: '/instructor/analytics'
          },
          {
            title: 'Mon Profil',
            icon: Teacher,
            path: '/instructor/profile'
          }
        ];
      
      case 'student':
      default:
        return [
          {
            title: 'Dashboard',
            icon: Category,
            path: '/student/dashboard'
          },
          {
            title: 'Mes Cours',
            icon: BookSaved,
            path: '/student/courses'
          },
          {
            title: 'Parcourir',
            icon: Book1,
            path: '/student/browse'
          },
          {
            title: 'Progression',
            icon: Chart,
            path: '/student/progress'
          },
          {
            title: 'Certificats',
            icon: Medal,
            path: '/student/certificates'
          },
          {
            title: 'Mon Profil',
            icon: User,
            path: '/student/profile'
          }
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon 
                  size={20} 
                  className={isActive ? "text-blue-700" : "text-gray-400"}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
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