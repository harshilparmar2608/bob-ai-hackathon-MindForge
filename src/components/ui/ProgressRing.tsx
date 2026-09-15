import React from "react";
import { cn } from "../../lib/utils";

export interface ProgressRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  variant?: "primary" | "success" | "warning" | "danger" | "purple";
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  score,
  size = 140,
  strokeWidth = 11,
  label = "Academic Health",
  sublabel = "Top 10% on Track",
  variant = "primary",
  className,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const colorMap = {
    primary: "stroke-blue-600 dark:stroke-blue-500",
    success: "stroke-emerald-600 dark:stroke-emerald-500",
    warning: "stroke-amber-500 dark:stroke-amber-400",
    danger: "stroke-rose-600 dark:stroke-rose-500",
    purple: "stroke-purple-600 dark:stroke-purple-500",
  };

  const ringBg = "stroke-gray-100 dark:stroke-gray-800";

  return (
    <div
      className={cn("flex flex-col items-center justify-center relative", className)}
      role="progressbar"
      aria-valuenow={normalizedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label}: ${normalizedScore} out of 100`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={ringBg}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={cn(
              colorMap[variant],
              "transition-all duration-1000 ease-out"
            )}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-3xl font-extrabold font-mono text-gray-900 dark:text-white tracking-tight leading-none">
            {normalizedScore}
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider mt-1">
            / 100 SCORE
          </span>
        </div>
      </div>

      {(label || sublabel) && (
        <div className="text-center mt-3 space-y-0.5">
          {label && (
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {label}
            </p>
          )}
          {sublabel && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
