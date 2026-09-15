import React from "react";
import {
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight,
  HelpCircle,
  Play,
  TrendingUp,
  AlertTriangle,
  BrainCircuit,
  SlidersHorizontal,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  ProgressRing,
  Tooltip,
} from "../ui";
import { StudentProfile } from "../../types";

export interface DashboardHeroProps {
  student: StudentProfile | null;
  aiBrief: {
    greeting: string;
    summary: string;
    criticalAlertCount: number;
    recommendedFocusBlock: string;
  } | null;
  onLaunchStudySession?: () => void;
  onViewRecommendations?: () => void;
  onAskBob?: () => void;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  student,
  aiBrief,
  onLaunchStudySession,
  onViewRecommendations,
  onAskBob,
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
    currentGpa: 0,
    targetGpa: 0,
    classRank: "N/A",
    attendanceRate: 0,
    placementReadiness: 0,
    academicHealthScore: 0,
  };
  return (
    <div id="dashboard-hero-section" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Column (5 Cols on LG): Academic Health Score & Key Breakdown */}
      <Card
        variant="default"
        className="lg:col-span-5 flex flex-col justify-between border-gray-200/90 dark:border-gray-800"
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">
                  Academic Health Score
                </CardTitle>
                <CardDescription>
                  Composite Index • {displayStudent.semester} ({displayStudent.currentPeriod})
                </CardDescription>
              </div>
            </div>

            <Badge variant="success" size="sm" dot>
              On Track
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* Progress Ring */}
            <div className="shrink-0 flex flex-col items-center">
              <ProgressRing
                score={displayStudent.academicHealthScore}
                size={135}
                strokeWidth={11}
                variant="primary"
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-1">
                Top 8% in CS Department
              </span>
            </div>

            {/* Health Factor Breakdown */}
            <div className="w-full space-y-3">
              {/* Attendance Factor */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Attendance Stability
                  </span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    {displayStudent.attendanceRate}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${displayStudent.attendanceRate}%` }}
                  />
                </div>
              </div>

              {/* Assignment Completion */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Assignment Completion Quality
                  </span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    89%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: "89%" }}
                  />
                </div>
              </div>

              {/* Exam Readiness */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Exam Readiness (Upcoming OS Midterm)
                  </span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    78%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: "78%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
            <span>Class Standing:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{displayStudent.classRank}</span>
          </div>
          <button
            type="button"
            onClick={onViewRecommendations}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Deep Factor Review
            <ArrowRight className="w-3 h-3" />
          </button>
        </CardFooter>
      </Card>

      {/* Right Column (7 Cols on LG): AI Morning Brief, Confidence & Action Deck */}
      <Card
        variant="ai"
        className="lg:col-span-7 flex flex-col justify-between border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/20 via-white to-white dark:from-purple-950/20 dark:via-[#161c28] dark:to-[#161c28]"
      >
        <CardHeader className="pb-3 border-b border-purple-100/80 dark:border-purple-950/60">
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">
                    IBM Granite AI Morning Brief
                  </CardTitle>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                    Granite 7.1
                  </span>
                </div>
                <CardDescription>
                  Synthesized at 08:00 AM • Multi-Factor Reasoning
                </CardDescription>
              </div>
            </div>

            {/* AI Confidence Meter */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800/80 px-2.5 py-1 rounded-md border border-purple-200/60 dark:border-purple-800/60">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                AI Confidence:
              </span>
              <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                97.4%
              </span>
              <Tooltip content="Calculated from real-time class attendance logs, syllabus coverage, and assignment deadlines.">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-3 pb-3 space-y-3.5">
          {/* Executive Summary Quote */}
          <div className="p-3.5 rounded-lg bg-white dark:bg-gray-800/50 border border-purple-100 dark:border-purple-900/40 shadow-2xs">
            <p className="text-xs sm:text-[13px] text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
              {aiBrief?.greeting || `I have analyzed your schedule, assignments, and study metrics.`}{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {aiBrief?.summary || "Today's most critical priority is your Database Systems Lab at 11:00 AM, followed by your Computer Networks submission due at 4:00 PM."}
              </span>
            </p>
          </div>

          {/* Explainable AI Factor Panel */}
          <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-purple-900 dark:text-purple-300">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Explainable Decision Weights
              </span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                Carbon Enterprise AI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2 rounded bg-white dark:bg-gray-800 border border-purple-100/70 dark:border-purple-900/40 text-xs">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-0.5">
                  Attendance Risk
                </span>
                <p className="text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                  DB Lab @ 73.5%
                </p>
                <span className="text-[10px] text-gray-400">Weight: 45%</span>
              </div>

              <div className="p-2 rounded bg-white dark:bg-gray-800 border border-purple-100/70 dark:border-purple-900/40 text-xs">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5">
                  Grade Weight
                </span>
                <p className="text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                  CN Sliding Window
                </p>
                <span className="text-[10px] text-gray-400">Weight: 35%</span>
              </div>

              <div className="p-2 rounded bg-white dark:bg-gray-800 border border-purple-100/70 dark:border-purple-900/40 text-xs">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block mb-0.5">
                  Exam Countdown
                </span>
                <p className="text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                  OS Midterm in 6d
                </p>
                <span className="text-[10px] text-gray-400">Weight: 20%</span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Hero Actions Bar */}
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-3 pb-4 border-t border-purple-100/80 dark:border-purple-950/60 bg-purple-50/20 dark:bg-transparent">
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={onLaunchStudySession}
              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              Launch Study Flow
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onViewRecommendations}
              leftIcon={<TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
            >
              Smart Recommendations
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onAskBob}
              className="text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-100"
            >
              Ask Bob AI
            </Button>
          </div>

          {/* Today's Recommended Focus Block */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Focus Slot:
            </span>
            <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
              {aiBrief?.recommendedFocusBlock || "04:00 PM - 06:00 PM"}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
