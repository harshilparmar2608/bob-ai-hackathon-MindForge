import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/ui/Logo";
import { APP_CONFIG } from "../lib/constants";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Where to redirect after login (default to "/")
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";

  // If already authenticated, redirect to target
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };
return (
    <div className="min-h-screen bg-[#f4f5f7] dark:bg-[#12161f] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Logo */}
        <div className="flex justify-center mb-4">
          <Logo size={64} framed alt="CampusPilot" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Sign in to CampusPilot
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          AI Student Success Platform • Powered by IBM Granite 3.0
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#161c28] py-8 px-6 sm:px-10 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md space-y-6">
          

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* University Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
              >
                University Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`student@${APP_CONFIG.studentEmailDomain}`}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Remember this device
                </span>
              </label>

              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>JWT Secure SSO</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              New to CampusPilot?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create student account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-6">
          {APP_CONFIG.universityName} Academic Portal • Protected by IBM Granite AI Security
        </p>
      </div>
    </div>
  );
};







