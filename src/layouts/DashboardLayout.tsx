import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);

  // Automatic responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Only auto-collapse if user hasn't manually toggled recently
      if (!isManualToggle) {
        if (width < 1024) {
          setIsSidebarCollapsed(true);
        } else {
          setIsSidebarCollapsed(false);
        }
      }
    };

    // Initial check
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [isManualToggle]);

  const handleToggleSidebar = () => {
    setIsManualToggle(true);
    setIsSidebarCollapsed(!isSidebarCollapsed);

    // Reset manual toggle flag after 3 seconds to allow auto-responsiveness again
    setTimeout(() => {
      setIsManualToggle(false);
    }, 3000);
  };

  const sidebarWidth = isSidebarCollapsed ? 80 : 256;

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isCollapsed={isSidebarCollapsed} />

        {/* Header */}
        <Header
          onToggleSidebar={handleToggleSidebar}
          sidebarWidth={sidebarWidth}
        />

        {/* Main Content */}
        <main
          className="pt-16 transition-all duration-300"
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
