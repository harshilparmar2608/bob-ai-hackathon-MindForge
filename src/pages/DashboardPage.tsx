import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Calendar,
  BookOpen,
  BellRing,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { useAuth } from "../context/AuthContext";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { student } = useStudent();
  const { user } = useAuth();

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    // Use authenticated user data, fallback to student context for academic data.
  // No hard-coded identity values — only null-safe "Unknown"/"N/A" fallbacks.
  const displayName = user?.name || student?.name || "Unknown";
  const displayAvatar = user?.avatarUrl || student?.avatarUrl || "";
  const displayMajor = user?.major || student?.major || "Unknown";
  const displaySemester = user?.semester || student?.semester || "N/A";
  const displayGpa = student?.currentGpa || 0;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);

  const recentActivities = [
    {
      id: "act-1",
      title: "Attendance marked",
      description: "Marked Present in Operating Systems Lecture (09:10 AM, Hall B)",
      time: "45 mins ago",
      type: "attendance",
      icon: CheckCircle2,
      badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
      link: "/attendance",
    },
    {
      id: "act-2",
      title: "Assignment uploaded",
      description: "Submitted TCP/IP Sliding Window Simulation v2.1",
      time: "2 hours ago",
      type: "assignment",
      icon: FileText,
      badgeColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
      link: "/assistant",
    },
    {
      id: "act-3",
      title: "New notice published",
      description: "IBM Granite AI Hackathon registration extended by 48 hours",
      time: "3 hours ago",
      type: "notice",
      icon: BellRing,
      badgeColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
      link: "/notices",
    },
    {
      id: "act-4",
      title: "Upcoming event reminder",
      description: "Database Systems Practical Lab exam begins in 3 days",
      time: "5 hours ago",
      type: "event",
      icon: Calendar,
      badgeColor: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800",
      link: "/notices",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. Header: Greeting, User name, Current date, Profile avatar */}
      <header
        id="dashboard-header"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-800"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {greeting}, {displayName.split(" ")[0]} 👋
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {displaySemester} ({displayMajor})
            </span>
          </p>
        </div>

        {/* Profile Avatar & Academic Pill */}
        <div className="flex items-center gap-3">
          <Link
            to="/settings"
            className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors shadow-xs group"
          >
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600/20"
            />
            <div className="text-left">
              <div className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {displayName}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                GPA {displayGpa} • Top 7%
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* 2. Hero Section: Large welcome card */}
      <section
        id="dashboard-hero"
        className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-900 text-white p-6 sm:p-8 lg:p-10 shadow-md border border-blue-500/20"
      >
        {/* Subtle background glow effect */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-6 w-32 h-32 rounded-full bg-blue-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-blue-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CampusPilot AI v1.0 • Powered by IBM Granite</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back!
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 font-medium leading-relaxed">
              Your AI-powered campus companion.
            </p>
            <p className="text-sm text-blue-200/90 leading-relaxed max-w-xl">
              CampusPilot has synthesized your academic day. You have{" "}
              <strong className="text-white font-semibold">4 classes today</strong>,{" "}
              <strong className="text-white font-semibold">1 critical assignment due at 4:00 PM</strong>,
              and attendance safe in all courses except Database Systems Lab.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="hero-ask-ai-btn"
              onClick={() => navigate("/assistant")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-900 font-semibold text-sm hover:bg-blue-50 active:scale-98 transition-all shadow-sm group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
              <span>Ask AI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-view-timetable-btn"
              onClick={() => navigate("/timetable")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-sm active:scale-98 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>View Timetable</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Summary Cards (4 cards only) */}
      <section id="dashboard-summary-cards" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
            Campus Overview
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">Real-time sync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Attendance % */}
          <div
            id="summary-card-attendance"
            onClick={() => navigate("/attendance")}
            className="group p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Attendance %
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  86.4%
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Safe Zone
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                +11.4% buffer above 75% limit
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
              <span>View Subject Breakdown</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Today's Classes */}
          <div
            id="summary-card-classes"
            onClick={() => navigate("/timetable")}
            className="group p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Today's Classes
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  4 Classes
                </span>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                  1 In-Progress
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                Next: DB Systems Lab (11:00 AM)
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">
              <span>Open Timetable</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Pending Tasks */}
          <div
            id="summary-card-tasks"
            onClick={() => navigate("/assignments")}
            className="group p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pending Tasks
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  4 Tasks
                </span>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  1 Critical
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                TCP/IP Simulation due 04:00 PM
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium group-hover:underline">
              <span>Open Assignments & Tasks</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Upcoming Events */}
          <div
            id="summary-card-events"
            onClick={() => navigate("/notices")}
            className="group p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Upcoming Events
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BellRing className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  5 Events
                </span>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                  Hackathon
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                IBM Granite Hackathon in 10d
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-medium group-hover:underline">
              <span>Explore Notices & Events</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quick Actions */}
      <section id="dashboard-quick-actions" className="space-y-3">
        <h2 className="text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            id="quick-action-ask-ai"
            onClick={() => navigate("/assistant")}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-gray-800 dark:text-gray-200 font-medium text-sm transition-all shadow-2xs group cursor-pointer"
          >
            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span>Ask AI</span>
          </button>

          <button
            id="quick-action-timetable"
            onClick={() => navigate("/timetable")}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-gray-800 dark:text-gray-200 font-medium text-sm transition-all shadow-2xs group cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>View Timetable</span>
          </button>

          <button
            id="quick-action-attendance"
            onClick={() => navigate("/attendance")}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-gray-800 dark:text-gray-200 font-medium text-sm transition-all shadow-2xs group cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Check Attendance</span>
          </button>

          <button
            id="quick-action-notices"
            onClick={() => navigate("/notices")}
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-gray-800 dark:text-gray-200 font-medium text-sm transition-all shadow-2xs group cursor-pointer"
          >
            <BellRing className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            <span>View Notices</span>
          </button>
        </div>
      </section>

      {/* 5. Recent Activity Section */}
      <section id="dashboard-recent-activity" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
              Last 24 Hours
            </span>
          </div>
          <button
            onClick={() => navigate("/notices")}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all updates</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white dark:bg-[#161c28] rounded-2xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 shadow-xs overflow-hidden">
          {recentActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                id={`activity-item-${act.id}`}
                onClick={() => navigate(act.link)}
                className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 border ${act.badgeColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {act.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{act.time}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
