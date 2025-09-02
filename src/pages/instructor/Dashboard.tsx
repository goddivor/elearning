import React from 'react';
import useTitle from '@/hooks/useTitle';

const InstructorDashboard = () => {
  useTitle("Dashboard Instructeur");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Instructeur</h1>
      <p className="text-gray-600">Bienvenue sur votre tableau de bord instructeur.</p>
    </div>
  );
};

export default InstructorDashboard;