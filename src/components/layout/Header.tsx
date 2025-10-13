import { Notification, HambergerMenu } from 'iconsax-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarWidth?: number;
}

const Header = ({ onToggleSidebar, sidebarWidth = 256 }: HeaderProps) => {
  return (
    <header
      className="fixed top-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40 transition-all duration-300"
      style={{ left: `${sidebarWidth}px` }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section - Toggle Button */}
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <HambergerMenu size={24} color="currentColor" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Notification size={20} color="currentColor" />
            {/* Badge de notification */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
