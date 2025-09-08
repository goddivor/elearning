import React from 'react';
import { TrendUp, TrendDown } from 'iconsax-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down";
  description?: string;
  color?: string;
}

export default function MetricCard({
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