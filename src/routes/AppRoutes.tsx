import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { Loader2 } from "lucide-react";
import { Logo } from "../components/ui/Logo";

// ─── Lazy-loaded pages for better initial bundle performance ──────────────────
const LoginPage = lazy(() =>
  import("../pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("../pages/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() =>
  import("../pages/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }))
);
const DashboardPage = lazy(() =>
  import("../pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const AIAssistantPage = lazy(() =>
  import("../pages/AIAssistantPage").then((m) => ({ default: m.AIAssistantPage }))
);
const AttendancePage = lazy(() =>
  import("../pages/AttendancePage").then((m) => ({ default: m.AttendancePage }))
);
const TimetablePage = lazy(() =>
  import("../pages/TimetablePage").then((m) => ({ default: m.TimetablePage }))
);
const NoticesEventsPage = lazy(() =>
  import("../pages/NoticesEventsPage").then((m) => ({ default: m.NoticesEventsPage }))
);
const SettingsPage = lazy(() =>
  import("../pages/SettingsPage").then((m) => ({ default: m.SettingsPage }))
);
const StudyPlannerPage = lazy(() =>
  import("../pages/StudyPlannerPage").then((m) => ({ default: m.StudyPlannerPage }))
);
const AssignmentsPage = lazy(() =>
  import("../pages/AssignmentsPage").then((m) => ({ default: m.AssignmentsPage }))
);
const NotesAssistantPage = lazy(() =>
  import("../pages/NotesAssistantPage").then((m) => ({ default: m.NotesAssistantPage }))
);
const CareerCopilotPage = lazy(() =>
  import("../pages/CareerCopilotPage").then((m) => ({ default: m.CareerCopilotPage }))
);
const RecommendationsPage = lazy(() =>
  import("../pages/RecommendationsPage").then((m) => ({ default: m.RecommendationsPage }))
);

// ─── Full-screen loading fallback ─────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <Logo size={40} framed alt="CampusPilot" className="animate-pulse" />
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      <span>Loading…</span>
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected University Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Core Pages */}
            <Route index element={<DashboardPage />} />
            <Route path="assistant" element={<AIAssistantPage />} />
            <Route path="ai" element={<Navigate to="/assistant" replace />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="notices" element={<NoticesEventsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Academic Modules */}
            <Route path="planner" element={<StudyPlannerPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="notes" element={<NotesAssistantPage />} />
            <Route path="career" element={<CareerCopilotPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />

            {/* Redirects for alternate paths */}
            <Route path="calendar" element={<Navigate to="/timetable" replace />} />

            {/* Catch-all redirect to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};
