import React, { useState } from "react";
import {
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Sparkles,
  Calculator,
  ArrowRight,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { Link } from "react-router-dom";

interface SubjectAttendance {
  code: string;
  name: string;
  attended: number;
  total: number;
  percentage: number;
  faculty: string;
  isCritical: boolean;
  requiredFor75: number;
  bunkableFor75: number;
  color: string;
}

export const AttendancePage: React.FC = () => {
  const { student } = useStudent();

  const subjects: SubjectAttendance[] = [
    {
      code: "CS502L",
      name: "Database Systems Lab",
      attended: 14,
      total: 19,
      percentage: 73.7,
      faculty: "Dr. Evelyn Reed",
      isCritical: true,
      requiredFor75: 4,
      bunkableFor75: 0,
      color: "#da1e28", // IBM Red
    },
    {
      code: "CS501",
      name: "Computer Networks",
      attended: 22,
      total: 25,
      percentage: 88.0,
      faculty: "Prof. Kenneth Vance",
      isCritical: false,
      requiredFor75: 0,
      bunkableFor75: 4,
      color: "#0f62fe", // IBM Blue
    },
    {
      code: "CS503",
      name: "Data Science & AI",
      attended: 23,
      total: 25,
      percentage: 92.0,
      faculty: "Dr. Priya Sharma",
      isCritical: false,
      requiredFor75: 0,
      bunkableFor75: 5,
      color: "#198038", // IBM Green
    },
    {
      code: "CS504",
      name: "Cloud Architecture",
      attended: 21,
      total: 25,
      percentage: 84.0,
      faculty: "Prof. Marcus Thorne",
      isCritical: false,
      requiredFor75: 0,
      bunkableFor75: 3,
      color: "#8a3ffc", // IBM Purple
    },
    {
      code: "CS505",
      name: "Operating Systems",
      attended: 20,
      total: 24,
      percentage: 83.3,
      faculty: "Prof. Kenneth Vance",
      isCritical: false,
      requiredFor75: 0,
      bunkableFor75: 2,
      color: "#005d5d", // IBM Teal
    },
  ];

  // Simulator state
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>("CS502L");
  const [simulatedAttended, setSimulatedAttended] = useState<number>(4);

  const selectedSub = subjects.find((s) => s.code === selectedSubjectCode) || subjects[0];
  const projectedTotal = selectedSub.total + simulatedAttended;
  const projectedAttended = selectedSub.attended + simulatedAttended;
  const projectedPercentage = Math.min(100, Number(((projectedAttended / projectedTotal) * 100).toFixed(1)));

  // Circular Progress Helper
  const renderCircularGauge = (percentage: number, color: string, size = 70) => {
    const strokeWidth = 7;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="rotate-[-90deg]" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-bold text-gray-900 dark:text-white">
          {percentage}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Attendance & Academic Standing</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time biometric attendance records with AI compliance forecasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/timetable"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-blue-500 text-gray-700 dark:text-gray-300 transition-colors shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>View Today's Classes</span>
          </Link>
        </div>
      </div>

      {/* 1. Overall Percentage Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Attendance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Overall Rate
            </span>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              86.4%
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Safe Zone
            </span>
          </div>
          {renderCircularGauge(86.4, "#0f62fe", 68)}
        </div>

        {/* Regulatory Threshold */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Required Minimum
          </span>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
            75.0%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            University Exam Eligibility Limit
          </p>
        </div>

        {/* Safe Margin Buffer */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Safe Buffer
          </span>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            +11.4%
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Above mandatory cutoff
          </p>
        </div>

        {/* At Risk Courses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            At Risk Courses
          </span>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            1 Course
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
            CS502L Lab is at 73.7%
          </p>
        </div>
      </section>

      {/* 2. AI Insights Section (Featured) */}
      <section className="p-6 rounded-2xl bg-linear-to-r from-rose-50 via-amber-50 to-blue-50 dark:from-rose-950/30 dark:via-amber-950/20 dark:to-blue-950/30 border border-rose-200/80 dark:border-rose-900/50 shadow-xs space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-600 text-white shadow-xs shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                AI Recommendation: Immediate Attendance Recovery Needed
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                Action Required
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              "Your attendance in <strong className="text-rose-600 dark:text-rose-400">Database Systems Lab (CS502L)</strong> is currently <strong className="text-rose-600 dark:text-rose-400">73.7%</strong>, which is below the university's 75% cutoff threshold. Attend the next <strong className="text-gray-900 dark:text-white underline decoration-rose-500 underline-offset-2">4 consecutive classes</strong> to restore your attendance to <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">78.3%</strong> and protect final exam eligibility."
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Dean Regulation 4.2 Enforcement
              </span>
              <span>•</span>
              <span>Next class: Today at 11:00 AM (Lab 03)</span>
              <span>•</span>
              <Link
                to="/timetable"
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Navigate to Timetable</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Subject-wise Attendance Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Subject-Wise Attendance Breakdown
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            5 Active Enrolled Courses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const isSafe = sub.percentage >= 75;
            return (
              <div
                key={sub.code}
                className={`p-5 rounded-2xl bg-white dark:bg-[#161c28] border transition-all shadow-xs flex flex-col justify-between ${
                  sub.isCritical
                    ? "border-rose-400 dark:border-rose-700/80 ring-1 ring-rose-400/30"
                    : "border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-700"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {sub.code}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {sub.faculty}
                      </p>
                    </div>

                    {renderCircularGauge(
                      sub.percentage,
                      sub.isCritical ? "#da1e28" : sub.color,
                      56
                    )}
                  </div>

                  {/* Attended vs Total Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span>
                      Attended: <strong className="text-gray-900 dark:text-white">{sub.attended}</strong> / {sub.total} classes
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${
                        sub.isCritical
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      }`}
                    >
                      {sub.isCritical ? "Critical Alert" : "Good Standing"}
                    </span>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, sub.percentage)}%`,
                        backgroundColor: sub.isCritical ? "#da1e28" : sub.color,
                      }}
                    />
                  </div>
                </div>

                {/* AI Advice Pill at bottom */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 text-xs">
                  {sub.isCritical ? (
                    <div className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Must attend next {sub.requiredFor75} classes to hit 75%</span>
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 flex items-center justify-between">
                      <span>Safe to miss: <strong className="text-gray-800 dark:text-gray-200">{sub.bunkableFor75} classes</strong></span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Interactive Attendance Recovery Calculator / Simulator */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              AI Attendance Recovery Simulator
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Simulate future attendance trajectory before planning leaves or revision days.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Select Course
              </label>
              <select
                value={selectedSubjectCode}
                onChange={(e) => setSelectedSubjectCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.code} - {sub.name} (Current: {sub.percentage}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Upcoming Classes to Attend
                </label>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  +{simulatedAttended} Classes
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={simulatedAttended}
                onChange={(e) => setSimulatedAttended(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Forecast Outcome */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-gray-50 dark:bg-[#1a2232] border border-gray-200/80 dark:border-gray-700/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Forecasted Outcome for {selectedSub.code}
              </span>
              <div className="flex items-baseline gap-3 justify-center sm:justify-start">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  {projectedPercentage}%
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    projectedPercentage >= 75
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                  }`}
                >
                  {projectedPercentage >= 75 ? "Qualified for Exams" : "Below Cutoff (<75%)"}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md">
                Attending <strong className="text-blue-600">{simulatedAttended}</strong> consecutive classes brings your total to{" "}
                <strong>{projectedAttended} / {projectedTotal}</strong> attended sessions.
              </p>
            </div>

            <div className="shrink-0 text-center">
              {renderCircularGauge(
                projectedPercentage,
                projectedPercentage >= 75 ? "#198038" : "#da1e28",
                84
              )}
              <span className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1">
                Projected Rate
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
