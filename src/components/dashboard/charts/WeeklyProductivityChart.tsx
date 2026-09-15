import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "../../ui/ChartContainer";
import { ProductivityDay } from "../../../types";
import { MOCK_PRODUCTIVITY_DAYS } from "../../../services/mockData";
import { Zap, TrendingUp, Info } from "lucide-react";
import { Tooltip as UITooltip } from "../../ui/Tooltip";

export interface WeeklyProductivityChartProps {
  data?: ProductivityDay[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomProductivityTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ProductivityDay;
    const diff = +(data.actualHours - data.targetHours).toFixed(1);
    const isAbove = diff >= 0;

    return (
      <div className="bg-white dark:bg-[#1b2230] p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700/80 text-xs min-w-[170px] space-y-2">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5 font-semibold text-gray-900 dark:text-white">
          <span>{label} Productivity</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              data.cognitiveLoad > 80
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
            }`}
          >
            Load: {data.cognitiveLoad}%
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#0f62fe]" />
              Actual Logged:
            </span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              {data.actualHours} hrs
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-[#8a3ffc]" />
              Target Goal:
            </span>
            <span className="font-mono text-gray-600 dark:text-gray-300">
              {data.targetHours} hrs
            </span>
          </div>

          <div className="pt-1 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Variance:</span>
            <span
              className={`font-semibold font-mono ${
                isAbove
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {isAbove ? `+${diff}` : `${diff}`} hrs
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const WeeklyProductivityChart: React.FC<WeeklyProductivityChartProps> = ({
  data = MOCK_PRODUCTIVITY_DAYS,
  className,
}) => {
  const totalActual = data.reduce((acc, curr) => acc + curr.actualHours, 0);
  const totalTarget = data.reduce((acc, curr) => acc + curr.targetHours, 0);
  const completionRate = Math.round((totalActual / totalTarget) * 100);

  return (
    <ChartContainer
      title="Weekly Productivity & Study Output"
      description="Daily logged study hours vs planned targets"
      className={className}
      action={
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-3 h-3" />
            {completionRate}% of Weekly Goal
          </span>
          <UITooltip content="Compares active study logs, IDE usage, and lecture attendance against planned schedule.">
            <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
          </UITooltip>
        </div>
      }
      legend={
        <div className="flex items-center justify-between w-full text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0f62fe]" />
              Actual Study Hours
            </span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <span className="w-3 h-0.5 bg-[#8a3ffc]" />
              Target Schedule
            </span>
          </div>
          <div className="font-mono font-semibold text-gray-900 dark:text-white">
            Total: {totalActual.toFixed(1)} hrs / {totalTarget.toFixed(1)} hrs
          </div>
        </div>
      }
      height={260}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="text-gray-200/70 dark:text-gray-800/80"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8d8d8d", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8d8d8d", fontSize: 11 }}
            unit="h"
            domain={[0, 9]}
          />
          <Tooltip content={<CustomProductivityTooltip />} />
          <Bar
            dataKey="actualHours"
            name="Actual Hours"
            fill="#0f62fe"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Line
            type="monotone"
            dataKey="targetHours"
            name="Target Hours"
            stroke="#8a3ffc"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "#8a3ffc", strokeWidth: 0 }}
            activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
