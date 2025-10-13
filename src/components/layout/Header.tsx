import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Profile, LogoutCurve, Notification, ArrowDown2 } from 'iconsax-react';
import { useAuth } from '@/contexts/AuthContext';
import { avatarService } from '@/services/avatarService';


const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());

  // Force avatar refresh when user changes
  useEffect(() => {
    setAvatarKey(Date.now());
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
    setDropdownOpen(false);
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'instructor': return 'Instructeur';
      case 'student': return 'Étudiant';
      default: return 'Utilisateur';
    }
  };

  const getProfileRoute = () => {
    switch (user?.role) {
      case 'admin': return '/dashboard/admin/profile';
      case 'instructor': return '/dashboard/instructor/profile';
      case 'student': return '/dashboard/student/profile';
      default: return '/dashboard/profile';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">3D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">E-Learning</span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Notification size={20} color="#6B7280" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    key={avatarKey}
                    src={`${avatarService.getAvatarUrl(user.avatar)}?v=${avatarKey}`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                )}
              </div>

              {/* User Info */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleDisplayName(user?.role)}
                </p>
              </div>

              {/* Dropdown Indicator */}
              <ArrowDown2
                size={16}
                color="#6B7280"
                className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 ${
              dropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}>
              <div className="py-2">
                <Link
                  to={getProfileRoute()}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Profile size={16} color="#4B5563" className="mr-3" />
                  Mon Profil
                </Link>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogoutCurve size={16} color="#DC2626" className="mr-3" />
                  Se déconnecter
                </button>
              </div>
            </div>

            {/* Backdrop to close dropdown */}
            {dropdownOpen && (
              <div
                className="fixed inset-0 z-[-1]"
                onClick={() => setDropdownOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;