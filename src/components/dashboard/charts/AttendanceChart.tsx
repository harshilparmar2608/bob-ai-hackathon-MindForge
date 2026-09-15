import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { ChartContainer } from "../../ui/ChartContainer";
import { AttendanceRecord } from "../../../types";
import { MOCK_ATTENDANCE_RECORDS } from "../../../services/mockData";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Tooltip as UITooltip } from "../../ui/Tooltip";

export interface AttendanceChartProps {
  data?: AttendanceRecord[];
  className?: string;
}

interface CustomAttendanceTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomAttendanceTooltip: React.FC<CustomAttendanceTooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as AttendanceRecord;
    const isBelowThreshold = item.percentage < 75;
    const diff = item.percentage - 75;

    return (
      <div className="bg-white dark:bg-[#1b2230] p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700/80 text-xs min-w-[190px] space-y-2">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5 font-semibold text-gray-900 dark:text-white">
          <div className="truncate max-w-[130px]">{item.subject}</div>
          <span className="text-[10px] font-mono text-gray-400">
            {item.courseCode}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Current Rate:</span>
            <span
              className={`font-mono font-bold ${
                isBelowThreshold
                  ? "text-rose-600 dark:text-rose-400"
                  : item.percentage < 80
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {item.percentage}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">Attended / Total:</span>
            <span className="font-mono text-gray-800 dark:text-gray-200 font-medium">
              {item.attended} / {item.total} lectures
            </span>
          </div>

          <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">75% Cutoff Margin:</span>
            <span
              className={`font-semibold font-mono ${
                diff < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {diff >= 0 ? `+${diff.toFixed(1)}% (Safe)` : `${diff.toFixed(1)}% (Deficit)`}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  data = MOCK_ATTENDANCE_RECORDS,
  className,
}) => {
  const criticalCount = data.filter((c) => c.percentage < 75).length;

  return (
    <ChartContainer
      title="Course Attendance & Regulatory Limits"
      description="Subject-wise attendance benchmarked against 75% minimum"
      className={className}
      action={
        <div className="flex items-center gap-2">
          {criticalCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              {criticalCount} Course at Risk
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              All Courses Safe
            </span>
          )}
          <UITooltip content="Campus regulation mandates >=75% attendance to sit for final end-term examinations.">
            <ShieldAlert className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
          </UITooltip>
        </div>
      }
      legend={
        <div className="flex flex-wrap items-center justify-between w-full text-xs gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-xs bg-[#198038]" />
              Safe (&ge; 85%)
            </span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
              <span className="w-2 h-2 rounded-xs bg-[#0f62fe]" />
              Standard (75-84%)
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-xs bg-[#da1e28]" />
              Under 75% Threshold
            </span>
          </div>
          <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
            Red Dashed Line = 75% Minimum
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
            unit="%"
            domain={[50, 100]}
          />
          <Tooltip content={<CustomAttendanceTooltip />} />
          <ReferenceLine
            y={75}
            stroke="#da1e28"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: "75% Mandatory",
              position: "insideTopRight",
              fill: "#da1e28",
              fontSize: 10,
              fontWeight: 600,
            }}
          />
          <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((entry) => {
              let barColor = "#0f62fe";
              if (entry.percentage < 75) barColor = "#da1e28";
              else if (entry.percentage >= 85) barColor = "#198038";
              return <Cell key={`cell-${entry.courseCode}`} fill={barColor} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
