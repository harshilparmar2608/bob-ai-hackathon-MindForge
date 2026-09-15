import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartContainer } from "../../ui/ChartContainer";
import { SubjectStudyHours } from "../../../types";
import { MOCK_STUDY_HOURS } from "../../../services/mockData";
import { Clock, CheckCircle, Info } from "lucide-react";
import { Tooltip as UITooltip } from "../../ui/Tooltip";

export interface StudyHoursChartProps {
  data?: SubjectStudyHours[];
  className?: string;
}

interface CustomStudyHoursTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomStudyHoursTooltip: React.FC<CustomStudyHoursTooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as SubjectStudyHours;
    const progress = Math.round((item.loggedHours / item.targetHours) * 100);

    return (
      <div className="bg-white dark:bg-[#1b2230] p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700/80 text-xs min-w-[185px] space-y-2">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5 font-semibold text-gray-900 dark:text-white">
          <span className="truncate max-w-[125px]">{item.subject}</span>
          <span className="text-[10px] font-mono text-gray-400">
            {item.courseCode}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#0f62fe]" />
              Logged Hours:
            </span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              {item.loggedHours} hrs
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-gray-300 dark:bg-gray-600" />
              Target Goal:
            </span>
            <span className="font-mono text-gray-600 dark:text-gray-300">
              {item.targetHours} hrs
            </span>
          </div>

          <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Allocation Met:</span>
            <span
              className={`font-semibold font-mono ${
                progress >= 100
                  ? "text-emerald-600 dark:text-emerald-400"
                  : progress >= 75
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {progress}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const StudyHoursChart: React.FC<StudyHoursChartProps> = ({
  data = MOCK_STUDY_HOURS,
  className,
}) => {
  const totalLogged = data.reduce((acc, curr) => acc + curr.loggedHours, 0);
  const totalTarget = data.reduce((acc, curr) => acc + curr.targetHours, 0);

  return (
    <ChartContainer
      title="Study Hours Distribution by Course"
      description="Time dedicated per subject vs semester target allocation"
      className={className}
      action={
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
            <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            {totalLogged.toFixed(1)} hrs Logged
          </span>
          <UITooltip content="Includes active coding editor sessions, lecture reviews, problem sets, and lab exercises.">
            <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
          </UITooltip>
        </div>
      }
      legend={
        <div className="flex flex-wrap items-center justify-between w-full text-xs gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0f62fe]" />
              Logged Hours
            </span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-gray-300 dark:bg-gray-700" />
              Target Allocation
            </span>
          </div>
          <span className="font-mono font-semibold text-gray-900 dark:text-white">
            Overall: {Math.round((totalLogged / totalTarget) * 100)}% Fulfilled
          </span>
        </div>
      }
      height={260}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="text-gray-200/70 dark:text-gray-800/80"
          />
          <XAxis
            dataKey="courseCode"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8d8d8d", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8d8d8d", fontSize: 11 }}
            unit="h"
            domain={[0, 14]}
          />
          <Tooltip content={<CustomStudyHoursTooltip />} />
          <Bar
            dataKey="loggedHours"
            name="Logged Hours"
            fill="#0f62fe"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="targetHours"
            name="Target Allocation"
            fill="#cbd5e1"
            className="dark:fill-gray-700"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
