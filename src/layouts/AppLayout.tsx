import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/navigation/Sidebar";
import { Header } from "../components/navigation/Header";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { cn } from "../lib/utils";

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-[#12161f] text-gray-900 dark:text-gray-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* a11y Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-md focus:outline-none text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
          "ml-0"
        )}
      >
        {/* Sticky Top Header */}
        <Header onOpenMobileMenu={() => setIsMobileOpen(true)} />

        {/* Page Outlet protected by Enterprise Error Boundary */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 md:p-6 lg:p-7 max-w-7xl w-full mx-auto outline-none"
        >
          <ErrorBoundary fallbackTitle="CampusPilot Module Failure">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};
