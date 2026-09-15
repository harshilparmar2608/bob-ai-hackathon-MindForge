import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "./Card";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trendText?: string;
  trendDirection?: "up" | "down" | "neutral";
  statusVariant?: "default" | "success" | "warning" | "danger" | "purple";
  icon?: React.ReactNode;
  badgeText?: string;
  sparklineData?: number[];
  chartType?: "line" | "bar";
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trendText,
  trendDirection = "neutral",
  statusVariant = "default",
  icon,
  badgeText,
  sparklineData,
  chartType = "line",
  onClick,
  className,
}) => {
  const isClickable = !!onClick;

  const accentBorderColors = {
    default: "border-gray-200/90 dark:border-gray-800",
    success: "border-gray-200/90 dark:border-gray-800",
    warning: "border-gray-200/90 dark:border-gray-800",
    danger: "border-gray-200/90 dark:border-gray-800",
    purple: "border-gray-200/90 dark:border-gray-800",
  };

  const trendColors = {
    up: "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/80",
    down: "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80",
    neutral: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  };

  const sparklineColors = {
    default: "stroke-blue-600 dark:stroke-blue-400 fill-blue-500/10",
    success: "stroke-emerald-600 dark:stroke-emerald-400 fill-emerald-500/10",
    warning: "stroke-amber-600 dark:stroke-amber-400 fill-amber-500/10",
    danger: "stroke-rose-600 dark:stroke-rose-400 fill-rose-500/10",
    purple: "stroke-purple-600 dark:stroke-purple-400 fill-purple-500/10",
  };

  // Generate SVG path for sparkline
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 32;

    if (chartType === "bar") {
      const barWidth = width / sparklineData.length - 3;
      return (
        <svg className="w-20 h-7 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
          {sparklineData.map((val, idx) => {
            const barHeight = Math.max(4, ((val - min) / range) * (height - 4));
            const x = idx * (barWidth + 3);
            const y = height - barHeight;
            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={1.5}
                className={
                  statusVariant === "danger"
                    ? "fill-rose-500/70 dark:fill-rose-400/80"
                    : "fill-blue-500/70 dark:fill-blue-400/80"
                }
              />
            );
          })}
        </svg>
      );
    }

    const points = sparklineData.map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    });

    const d = `M ${points.join(" L ")}`;

    return (
      <svg className="w-24 h-8 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <path
          d={d}
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={sparklineColors[statusVariant].split(" ")[0]}
        />
      </svg>
    );
  };

  return (
    <Card
      variant={isClickable ? "interactive" : "default"}
      onClick={onClick}
      className={cn(accentBorderColors[statusVariant], className)}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            {badgeText && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                {badgeText}
              </span>
            )}
            {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-4 mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight">
              {value}
            </span>
          </div>
          {renderSparkline()}
        </div>

        {(subtitle || trendText) && (
          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800/70 text-xs">
            {subtitle && (
              <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {subtitle}
              </span>
            )}
            {trendText && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0",
                  trendColors[trendDirection]
                )}
              >
                {trendDirection === "up" && <TrendingUp className="w-3 h-3" />}
                {trendDirection === "down" && <TrendingDown className="w-3 h-3" />}
                {trendDirection === "neutral" && <Minus className="w-3 h-3" />}
                {trendText}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
