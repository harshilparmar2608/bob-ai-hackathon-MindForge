import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { APP_CONFIG } from "../../lib/constants";
import { Logo } from "../../components/ui/Logo";
import { Loader2 } from "lucide-react";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] dark:bg-[#12161f] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Logo size={48} framed alt="CampusPilot" className="animate-pulse" />
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
              <span>Verifying Campus Session...</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Connecting to {APP_CONFIG.universityName} SSO & IBM Granite AI Core
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to /login, remembering the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
