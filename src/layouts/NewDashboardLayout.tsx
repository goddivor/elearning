import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { HambergerMenu } from 'iconsax-react';

const NewDashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarWidth = isSidebarCollapsed ? 80 : 256;

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isCollapsed={isSidebarCollapsed} />

        {/* Main Content */}
        <div
          className="transition-all duration-300"
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <HambergerMenu size={24} className="text-gray-600" />
            </button>
          </header>

          {/* Page Content */}
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NewDashboardLayout;
