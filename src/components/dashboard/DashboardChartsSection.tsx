import React, { useState } from "react";
import {
  WeeklyProductivityChart,
  AttendanceChart,
  AcademicTrendChart,
  StudyHoursChart,
} from "./charts";
import { BarChart3, Filter, Calendar } from "lucide-react";
import { Button } from "../ui/Button";

export interface DashboardChartsSectionProps {
  className?: string;
}

export const DashboardChartsSection: React.FC<DashboardChartsSectionProps> = ({
  className,
}) => {
  const [activeRange, setActiveRange] = useState<"current_week" | "month" | "semester">("current_week");

  return (
    <div id="dashboard-charts-analytics" className={`space-y-4 ${className || ""}`}>
      {/* Section Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Academic & Productivity Analytics
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Interactive longitudinal trends and compliance metrics
            </p>
          </div>
        </div>

        {/* Range Selector Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-lg border border-gray-200/80 dark:border-gray-700/80 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveRange("current_week")}
            className={`px-3 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
              activeRange === "current_week"
                ? "bg-white dark:bg-[#161c28] text-gray-900 dark:text-white shadow-2xs font-semibold"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Current Week
          </button>
          <button
            type="button"
            onClick={() => setActiveRange("month")}
            className={`px-3 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
              activeRange === "month"
                ? "bg-white dark:bg-[#161c28] text-gray-900 dark:text-white shadow-2xs font-semibold"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Monthly View
          </button>
          <button
            type="button"
            onClick={() => setActiveRange("semester")}
            className={`px-3 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
              activeRange === "semester"
                ? "bg-white dark:bg-[#161c28] text-gray-900 dark:text-white shadow-2xs font-semibold"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Full Semester
          </button>
        </div>
      </div>

      {/* 2x2 Grid of the 4 Recharts Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Weekly Productivity Chart */}
        <WeeklyProductivityChart />

        {/* 2. Attendance Compliance Chart */}
        <AttendanceChart />

        {/* 3. Academic Trend & CGPA Progression */}
        <AcademicTrendChart />

        {/* 4. Study Hours Distribution by Course */}
        <StudyHoursChart />
      </div>
    </div>
  );
};
