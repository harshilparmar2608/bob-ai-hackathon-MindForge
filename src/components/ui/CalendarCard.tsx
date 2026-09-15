import React from "react";
import { cn } from "../../lib/utils";

export interface CalendarDayEvent {
  id: string;
  day: number;
  dayName: string;
  isToday?: boolean;
  isSelected?: boolean;
  hasExam?: boolean;
  hasDeadline?: boolean;
  eventsCount?: number;
}

export interface CalendarCardProps {
  days: CalendarDayEvent[];
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  className?: string;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({
  days,
  selectedDay,
  onSelectDay,
  className,
}) => {
  return (
    <div className={cn("w-full overflow-x-auto pb-1", className)}>
      <div className="grid grid-cols-7 gap-2 min-w-[340px]">
        {days.map((item) => {
          const isSelected = selectedDay === item.day || item.isSelected;
          const isToday = item.isToday;

          return (
            <button
              key={item.day}
              type="button"
              onClick={() => onSelectDay?.(item.day)}
              className={cn(
                "flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer select-none text-center",
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-400/40"
                  : isToday
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  : "bg-white dark:bg-[#161c28] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-800 dark:text-gray-200"
              )}
            >
              <span
                className={cn(
                  "text-[10px] uppercase font-bold tracking-wider mb-1",
                  isSelected
                    ? "text-blue-100"
                    : isToday
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                )}
              >
                {item.dayName}
              </span>

              <span
                className={cn(
                  "text-base font-extrabold font-mono",
                  isSelected ? "text-white" : "text-gray-900 dark:text-white"
                )}
              >
                {item.day}
              </span>

              {/* Event indicators */}
              <div className="flex items-center gap-1 mt-1.5 h-1.5">
                {item.hasExam && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-amber-300" : "bg-amber-500"
                    )}
                    title="Exam on this day"
                  />
                )}
                {item.hasDeadline && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-rose-300" : "bg-rose-500"
                    )}
                    title="Assignment deadline"
                  />
                )}
                {isToday && !item.hasExam && !item.hasDeadline && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isSelected ? "bg-white" : "bg-blue-600 dark:bg-blue-400"
                    )}
                    title="Today"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
