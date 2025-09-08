import React from 'react';
import { People, UserAdd, Profile, UserRemove, TrendUp, TrendDown } from 'iconsax-react';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalInstructors: number;
  totalStudents: number;
  inactiveUsers: number;
  newUsersThisMonth: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down";
  description?: string;
  color?: string;
}

function MetricCard({
  title,
  value,
  change,
  icon,
  trend,
  description,
  color = "#1D4ED8",
}: MetricCardProps) {
  const showTrend = change !== undefined && trend;
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";
  const trendBg = trend === "up" ? "bg-green-100" : "bg-red-100";
  const TrendIcon = trend === "up" ? TrendUp : TrendDown;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        {showTrend && (
          <div
            className={`flex items-center space-x-1 px-3 py-1 rounded-full ${trendBg}`}
          >
            <TrendIcon
              size={14}
              color={trend === "up" ? "#16A34A" : "#DC2626"}
            />
            <span className={`text-sm font-medium ${trendColor}`}>
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface UsersOverviewCardsProps {
  stats: UserStats;
  trends?: {
    totalUsers?: number;
    activeUsers?: number;
    newUsers?: number;
    inactiveUsers?: number;
  };
}

export default function UsersOverviewCards({
  stats,
  trends,
}: UsersOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Utilisateurs"
        value={stats.totalUsers.toLocaleString()}
        change={trends?.totalUsers}
        trend={trends?.totalUsers && trends.totalUsers >= 0 ? "up" : "down"}
        icon={<People size={24} color="#1D4ED8" variant="Bold" />}
        description="Tous les comptes"
        color="#1D4ED8"
      />

      <MetricCard
        title="Utilisateurs Actifs"
        value={stats.activeUsers.toLocaleString()}
        change={trends?.activeUsers}
        trend={trends?.activeUsers && trends.activeUsers >= 0 ? "up" : "down"}
        icon={<UserAdd size={24} color="#059669" variant="Bold" />}
        description="Connectés ce mois"
        color="#059669"
      />

      <MetricCard
        title="Nouveaux Comptes"
        value={stats.newUsersThisMonth}
        change={trends?.newUsers}
        trend={trends?.newUsers && trends.newUsers >= 0 ? "up" : "down"}
        icon={<Profile size={24} color="#7C3AED" variant="Bold" />}
        description="Ce mois"
        color="#7C3AED"
      />

      <MetricCard
        title="Comptes Inactifs"
        value={stats.inactiveUsers}
        change={trends?.inactiveUsers}
        trend={
          trends?.inactiveUsers && trends.inactiveUsers <= 0 ? "up" : "down"
        } // Less inactive is better
        icon={<UserRemove size={24} color="#DC2626" variant="Bold" />}
        description="À réactiver"
        color="#DC2626"
      />
    </div>
  );
}