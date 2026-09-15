import React from "react";
import { Sparkles, Calendar, BookOpen, Clock, AlertCircle } from "lucide-react";
import { Badge, Avatar } from "../ui";
import { StudentProfile } from "../../types";

export interface StudentGreetingProps {
  student: StudentProfile | null;
  dateStr?: string;
  urgentTaskSummary?: string;
}

export const StudentGreeting: React.FC<StudentGreetingProps> = ({
  student,
  dateStr = "Monday, September 14, 2026",
  urgentTaskSummary = "Database Systems Lab attendance alert + Computer Networks due today",
}) => {
    // Handle null student case with null-safe defaults (no hardcoded identity)
  const displayStudent = student || {
    name: "Unknown",
    avatarUrl: "",
    major: "Unknown",
    semester: "N/A",
    college: "Unknown",
    gradYear: "N/A",
    currentPeriod: "N/A",
  };
  const getGreetingTime = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
      {/* Left: Greeting & Student Meta */}
      <div className="flex items-start gap-3.5">
        <Avatar
          fallback={displayStudent.name.split(" ").map(n => n[0]).join("")}
          size="lg"
          status="online"
          className="border-2 border-blue-600/30 ring-2 ring-blue-500/10"
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {getGreetingTime()}, {displayStudent.name.split(" ")[0]}
            </h1>
            <Badge variant="primary" size="sm">
              {displayStudent.major}
            </Badge>
            <Badge variant="neutral" size="sm">
              {displayStudent.semester} • Class of {displayStudent.gradYear}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {dateStr}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
              <span>{displayStudent.college}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {urgentTaskSummary}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Status Capsule */}
      <div className="flex items-center gap-2 self-start md:self-center">
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs">
            <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
              System Sync
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              Campus ERP Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
