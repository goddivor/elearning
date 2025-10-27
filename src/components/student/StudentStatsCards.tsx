import { Book1, Clock, Medal, TrendUp } from "iconsax-react";
import type { EnrollmentStats } from "@/services/enrollmentService";

interface StudentStatsCardsProps {
  stats: EnrollmentStats;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "purple";
  isLoading?: boolean;
}

const StatCard = ({ title, value, subtitle, icon, color, isLoading }: StatCardProps) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
};

export const StudentStatsCards = ({ stats, isLoading }: StudentStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Cours Inscrits"
        value={stats.totalCourses}
        subtitle="Total des inscriptions"
        icon={<Book1 size={20} color="#3B82F6" />}
        color="blue"
        isLoading={isLoading}
      />

      <StatCard
        title="Cours Terminés"
        value={stats.completedCourses}
        subtitle={`${stats.inProgressCourses} en cours`}
        icon={<Medal size={20} color="#10B981" />}
        color="green"
        isLoading={isLoading}
      />

      <StatCard
        title="Heures d'Étude"
        value={`${stats.totalHours}h`}
        subtitle="Temps total investi"
        icon={<Clock size={20} color="#F59E0B" />}
        color="orange"
        isLoading={isLoading}
      />

      <StatCard
        title="Progression Moyenne"
        value={`${stats.averageProgress}%`}
        subtitle="Performance globale"
        icon={<TrendUp size={20} color="#8B5CF6" />}
        color="purple"
        isLoading={isLoading}
      />
    </div>
  );
};