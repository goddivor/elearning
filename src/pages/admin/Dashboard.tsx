import React from 'react';
import useTitle from '@/hooks/useTitle';

const AdminDashboard = () => {
  useTitle("Dashboard Admin");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Administrateur</h1>
      <p className="text-gray-600">Bienvenue sur votre tableau de bord administrateur.</p>
    </div>
  );
};

export default AdminDashboard;