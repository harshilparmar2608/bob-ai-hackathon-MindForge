import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartContainer } from "../../ui/ChartContainer";
import { AcademicSemesterTrend } from "../../../types";
import { MOCK_ACADEMIC_TREND } from "../../../services/mockData";
import { Award, Info } from "lucide-react";
import { Tooltip as UITooltip } from "../../ui/Tooltip";

export interface AcademicTrendChartProps {
  data?: AcademicSemesterTrend[];
  className?: string;
}

interface CustomTrendTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTrendTooltip: React.FC<CustomTrendTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as AcademicSemesterTrend;

    return (
      <div className="bg-white dark:bg-[#1b2230] p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700/80 text-xs min-w-[180px] space-y-2">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5 font-semibold text-gray-900 dark:text-white">
          <span>{label}</span>
          <span className="text-[10px] font-mono text-gray-400">
            {data.creditsCompleted} Credits
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0f62fe]" />
              Semester GPA:
            </span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              {data.gpa.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8a3ffc]" />
              Cumulative CGPA:
            </span>
            <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
              {data.cgpa.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-gray-400" />
              Dept Average:
            </span>
            <span className="font-mono text-gray-500">
              {data.departmentAverage.toFixed(2)}
            </span>
          </div>

          <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Dept Margin:</span>
            <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
              +{(data.gpa - data.departmentAverage).toFixed(2)} GPA
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const AcademicTrendChart: React.FC<AcademicTrendChartProps> = ({
  data = MOCK_ACADEMIC_TREND,
  className,
}) => {
  const current = data[data.length - 1];

  return (
    <ChartContainer
      title="Academic Trend & CGPA Progression"
      description="Multi-semester performance relative to Department benchmark"
      className={className}
      action={
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            <Award className="w-3 h-3 text-blue-600" />
            Current CGPA: {current.cgpa.toFixed(2)}
          </span>
          <UITooltip content="Historical trajectory across all completed semesters based on official registrar grade reports.">
            <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
          </UITooltip>
        </div>
      }
      legend={
        <div className="flex flex-wrap items-center justify-between w-full text-xs gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0f62fe]" />
              Semester GPA
            </span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8a3ffc]" />
              Cumulative CGPA
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="w-3 h-0.5 bg-gray-400 stroke-dash" />
              Dept Average
            </span>
          </div>
          <span className="font-mono font-semibold text-gray-900 dark:text-white">
            Target: 3.85 GPA
          </span>
        </div>
      }
      height={260}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="academicGpaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0f62fe" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="text-gray-200/70 dark:text-gray-800/80"
          />
          <XAxis
            dataKey="semester"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8d8d8d", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8d8d8d", fontSize: 11 }}
            domain={[3.2, 4.0]}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <Tooltip content={<CustomTrendTooltip />} />
          <Area
            type="monotone"
            dataKey="gpa"
            name="Semester GPA"
            stroke="#0f62fe"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#academicGpaGradient)"
            dot={{ r: 3.5, fill: "#0f62fe" }}
            activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="cgpa"
            name="Cumulative CGPA"
            stroke="#8a3ffc"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: "#8a3ffc" }}
          />
          <Line
            type="monotone"
            dataKey="departmentAverage"
            name="Dept Average"
            stroke="#8d8d8d"
            strokeWidth={1.5}
            strokeDasharray="2 2"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
