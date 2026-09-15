import React from "react";
import { cn } from "../../lib/utils";

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: "blue" | "green" | "purple" | "amber" | "rose" | "gray";
  status?: "completed" | "current" | "upcoming";
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  const badgeStyles = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    green:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    purple:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    amber:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  };

  return (
    <div className={cn("relative space-y-6 pl-2", className)}>
      {/* Continuous Timeline Track Line */}
      <div className="absolute top-2.5 bottom-2.5 left-[19px] w-0.5 bg-gray-200 dark:bg-gray-800" />

      {items.map((item, idx) => {
        const isCurrent = item.status === "current";
        const isCompleted = item.status === "completed";

        return (
          <div key={item.id || idx} className="relative flex items-start gap-4 group">
            {/* Timeline Node Icon/Dot */}
            <div
              className={cn(
                "relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-transform group-hover:scale-110 shrink-0",
                isCurrent
                  ? "bg-blue-600 border-white dark:border-[#161c28] ring-4 ring-blue-100 dark:ring-blue-950/70 text-white"
                  : isCompleted
                  ? "bg-emerald-600 border-white dark:border-[#161c28] text-white"
                  : "bg-white dark:bg-[#161c28] border-gray-300 dark:border-gray-700 text-gray-400"
              )}
            >
              {item.icon ? (
                item.icon
              ) : (
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isCurrent || isCompleted ? "bg-white" : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              )}
            </div>

            {/* Timeline Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                  {item.time}
                </span>
                {item.badge && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-semibold border",
                      badgeStyles[item.badgeColor || "blue"]
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <h5
                className={cn(
                  "text-xs font-bold tracking-tight text-gray-900 dark:text-white",
                  isCurrent && "text-blue-600 dark:text-blue-400"
                )}
              >
                {item.title}
              </h5>
              {item.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
