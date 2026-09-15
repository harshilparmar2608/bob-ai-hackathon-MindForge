import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  Calendar,
  BellRing,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Compass,
  Cpu,
  Sparkles,
  LogOut,
  CheckSquare,
  FileText,
  Briefcase,
} from "lucide-react";
import { NAVIGATION_ITEMS, BOTTOM_NAV_ITEMS, APP_CONFIG } from "../../lib/constants";
import { useTheme } from "../../context/ThemeContext";
import { useStudent } from "../../context/StudentContext";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "../ui/Logo";
import { cn } from "../../lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Bot,
  BookOpen,
  Calendar,
  BellRing,
  Settings,
  Sparkles,
  Compass,
  CheckSquare,
  FileText,
  Briefcase,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isAiOnline, aiModelVersion } = useStudent();
  const { logout } = useAuth();

  const handleLogout = () => {
    onCloseMobile();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out",
          "border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c28]",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link
            to="/"
            id="brand-logo-link"
            className="flex items-center gap-3 overflow-hidden text-left focus:outline-none"
            onClick={onCloseMobile}
          >
            <Logo id="brand-logo" size={40} framed interactive alt="CampusPilot home" />
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-semibold text-base tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
                  {APP_CONFIG.name}
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    AI
                  </span>
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {APP_CONFIG.tagline}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            id="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className={cn("px-3 mb-2", isCollapsed && "sr-only")}>
            <span className="text-[11px] font-medium tracking-wider text-gray-400 dark:text-gray-500 uppercase">
              Main Menu
            </span>
          </div>

          {NAVIGATION_ITEMS.map((item) => {
            const Icon = iconMap[item.iconName] || LayoutDashboard;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                id={`nav-link-${item.id}`}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform group-hover:scale-105",
                    isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white"
                  )}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {/* Badge indicator */}
                {item.badge && !isCollapsed && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 tracking-wide",
                      item.badgeVariant === "purple" && "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
                      item.badgeVariant === "blue" && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                      item.badgeVariant === "amber" && "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
                      isActive && "bg-white/20 text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed dot badge */}
                {item.badge && isCollapsed && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions & AI System status */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
          {/* AI Core Status Indicator */}
          {!isCollapsed ? (
            <div
              id="ai-system-status-panel"
              className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60 text-xs"
            >
              <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  IBM Granite AI
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isAiOnline ? "Active" : "Offline"}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {aiModelVersion} • Multi-factor Reasoning
              </p>
            </div>
          ) : (
            <div
              id="ai-system-status-indicator"
              className="flex justify-center p-2"
              title={`IBM Granite AI (${aiModelVersion}) - Active`}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}

          {/* Settings & Theme */}
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.iconName] || Settings;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                id={`nav-link-${item.id}`}
                to={item.path}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Dark / Light Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer",
              isCollapsed && "justify-center"
            )}
            title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {resolvedTheme === "dark" ? (
              <>
                <Sun className="w-5 h-5 text-amber-400 shrink-0" />
                {!isCollapsed && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-gray-500 shrink-0" />
                {!isCollapsed && <span>Dark Mode</span>}
              </>
            )}
          </button>

          {/* Log Out Button */}
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer",
              isCollapsed && "justify-center"
            )}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
