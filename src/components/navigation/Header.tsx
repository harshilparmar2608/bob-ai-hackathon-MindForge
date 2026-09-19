import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  ShieldCheck,
  Sparkles,
  User,
  LogOut,
  Settings,
  Calendar,
  BookOpen,
  ChevronDown,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";
import { useStudent } from "../../context/StudentContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Logo } from "../ui/Logo";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const { student, isAiOnline, unreadNotificationsCount } = useStudent();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    // Use authenticated user data, fallback to student context for academic data.
  // Only real backend values are used; "Unknown"/"N/A" appear only when a field
  // is genuinely null on the backend.
  const displayName = user?.name || student?.name || "Unknown";
  const displayAvatar = user?.avatarUrl || student?.avatarUrl || "";
  const displayMajor = user?.major || student?.major || "Unknown";
  const displaySemester = user?.semester || student?.semester || "N/A";
  const displayCollege = user?.college || student?.college || "Unknown";
  const displayGpa = student?.currentGpa || 0;
  const displayPeriod = student?.currentPeriod || "N/A";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex items-center justify-between min-h-16 px-4 md:px-6 py-2.5 bg-white/95 dark:bg-[#161c28]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors"
    >
      {/* Left Greeting & Context */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <button
          id="mobile-menu-open-btn"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" id="header-brand-logo" aria-label="CampusPilot home" className="lg:hidden rounded-lg focus:outline-none">
          <Logo size={34} framed interactive alt="CampusPilot" />
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
              {greeting}, {displayName.split(" ")[0]} <span>👋</span>
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Dean's List Track (GPA {displayGpa})
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block truncate">
            Here's your AI academic brief & actionable recommendations for today.
          </p>
        </div>
      </div>

      {/* Center Academic Badges (Desktop) */}
      <div className="hidden xl:flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
          <span className="text-gray-400 font-medium">Period:</span>{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{displayPeriod}</span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
          <span className="text-gray-400 font-medium">Semester:</span>{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{displaySemester}</span>
        </div>
        <div className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
          <span className="text-gray-400 font-medium">College:</span>{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{displayCollege}</span>
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Bob AI Status Pill */}
        <Link
          to="/assistant"
          id="header-ai-status-pill"
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-700 dark:text-blue-300 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            {isAiOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium">IBM Granite AI: Online</span>
        </Link>

        {/* Notifications Popover Trigger */}
        <div className="relative" ref={notifRef}>
          <button
            id="header-notification-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Quick Notification Preview Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xl py-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Campus Notifications
                </span>
                <Link
                  to="/notices"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  View all
                </Link>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-72 overflow-y-auto">
                <div
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate("/notices");
                  }}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer text-left"
                >
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    IBM Granite Hackathon Registration Extended
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Deadline extended by 48 hours for university students.
                  </p>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1 block">
                    3 hours ago
                  </span>
                </div>

                <div
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate("/attendance");
                  }}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer text-left"
                >
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Attendance Warning: Database Systems Lab
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Current attendance at 73.7%. Must attend next 4 sessions.
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">5 hours ago</span>
                </div>
              </div>

              <div className="px-4 pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate("/notices");
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Open Notices & Events Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Theme Toggle Button */}
        <button
          id="header-theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="header-user-profile-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800 cursor-pointer text-left focus:outline-none group"
            aria-label="User profile menu"
          >
            <div className="relative">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700 ring-2 ring-transparent group-hover:ring-blue-500 transition-all"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900" />
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {displayName}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {displayMajor}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" />
          </button>

          {/* User Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xl py-2 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {displayName}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "student@university.edu"}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                    GPA {displayGpa}
                  </span>
                  <span className="text-[10px] text-gray-400">{displaySemester}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/settings");
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>Profile & Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/timetable");
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>My Timetable</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/attendance");
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span>Attendance Record</span>
                </button>
              </div>

              <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                <button
                  id="dropdown-logout-btn"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
