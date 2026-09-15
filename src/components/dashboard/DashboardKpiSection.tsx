import React from "react";
import {
  GraduationCap,
  UserCheck,
  FileText,
  Briefcase,
  Zap,
} from "lucide-react";
import { StatCard } from "../ui/StatCard";
import { MetricCardData } from "../../types";
import { useAcademicData } from "../../context/AcademicDataContext";
import { MOCK_METRICS } from "../../services/mockData";

export interface DashboardKpiSectionProps {
  metrics?: MetricCardData[];
  onSelectMetric?: (metric: MetricCardData) => void;
  className?: string;
}

const getKpiIcon = (iconKey?: string) => {
  switch (iconKey) {
    case "academic":
      return <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case "attendance":
      return <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case "assignments":
      return <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    case "placement":
      return <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    case "productivity":
      return <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
    default:
      return null;
  }
};

export const DashboardKpiSection: React.FC<DashboardKpiSectionProps> = ({
  metrics: propMetrics,
  onSelectMetric,
  className,
}) => {
  const { metrics: contextMetrics } = useAcademicData();
  const displayMetrics =
    propMetrics || (contextMetrics && contextMetrics.length > 0 ? contextMetrics : MOCK_METRICS);

  return (
    <div
      id="dashboard-kpi-cards"
      aria-label="Academic and Career KPI Overview"
      className={className}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {displayMetrics.map((item) => (
          <StatCard
            key={item.id}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            trendText={item.trendText}
            trendDirection={item.trendDirection}
            statusVariant={item.statusVariant}
            badgeText={item.badgeText}
            icon={getKpiIcon(item.iconKey)}
            sparklineData={item.sparklineData}
            chartType={item.chartType}
            onClick={onSelectMetric ? () => onSelectMetric(item) : undefined}
            className="hover:border-gray-300 dark:hover:border-gray-700 transition-shadow hover:shadow-xs"
          />
        ))}
      </div>
    </div>
  );
};
