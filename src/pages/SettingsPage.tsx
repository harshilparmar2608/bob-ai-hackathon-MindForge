import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  User,
  Bell,
  Moon,
  Sun,
  Sparkles,
  Camera,
  Check,
  Save,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { academicService } from "../services/academicService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { student, updateStudent, refreshStudent } = useStudent();
  const { theme, setTheme } = useTheme();
  const { user, updateUser, changePassword, logout, refreshUser } = useAuth();

  // Use authenticated user data, fallback to student context for academic data.
  // Empty strings are intentional — no hard-coded identity fallback is shown to
  // the user; "Unknown"/"N/A" are used only as null-safe display guards.
  const displayName = user?.name || student?.name || "Unknown";
  const displayMajor = user?.major || student?.major || "Unknown";
  const displaySemester = user?.semester || student?.semester || "N/A";
  const displayCollege = user?.college || student?.college || "Unknown";
  const displayAvatar = user?.avatarUrl || student?.avatarUrl || "";

  // Profile local state
  const [name, setName] = useState(displayName);
  const [department, setDepartment] = useState(displayMajor);
  const [semester, setSemester] = useState(displaySemester);
  const [college, setCollege] = useState(displayCollege);
  const [avatarUrl, setAvatarUrl] = useState(displayAvatar);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification toggles
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [aiMorningBrief, setAiMorningBrief] = useState(true);
  const [placementUpdates, setPlacementUpdates] = useState(true);

  // AI Persona
  const [aiPersona, setAiPersona] = useState<"mentor" | "concise" | "rigorous">("mentor");

  const sampleAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
  ];

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      // Persist to the authenticated backend via PUT /student/profile.
      await academicService.updateStudentProfile({
        major: department,
        semester,
        college,
        avatarUrl,
      });

      // Optimistically update both contexts so the UI reflects the save
      // immediately while we still re-validate against the backend.
      updateUser({
        major: department,
        semester,
        college,
        avatarUrl,
      });
      if (student) {
        updateStudent({ major: department, semester, college, avatarUrl });
      }

      // Invalidate any cached React Query data so other pages re-fetch.
      await queryClient.invalidateQueries({ refetchType: "active" });

      // Re-validate the authenticated user + student profile against the
      // backend so every surface shows the freshest backend truth.
      void refreshUser();
      void refreshStudent();

      toast.success("Profile saved successfully", {
        description: "Your academic credentials have been synchronized.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save profile";
      toast.error("Failed to save profile", { description: message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Sync local state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setDepartment(user.major || "");
      setSemester(user.semester || "");
      setCollege(user.college || "");
      setAvatarUrl(user.avatarUrl || displayAvatar);
    }
  }, [user]);

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match. Please verify.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      // Toast already shown in AuthContext
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Profile & System Settings</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your student credentials, security credentials, appearance, and notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            id="settings-logout-top-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold transition-all active:scale-98 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* 1. Student Profile Section */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <section className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Student Identity & Academic Record
              </h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium">
              ID: {user?.studentId || "N/A"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with selector */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20 shadow-md"
                />
                <div
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white"
                  title="Change avatar"
                >
                  <Camera className="w-6 h-6" />
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-400">Choose photo</span>
              <div className="flex gap-1.5 mt-1">
                {sampleAvatars.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatarUrl === url
                        ? "border-blue-600 scale-110"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Profile fields */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || "student@university.edu"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Department / Major
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Current Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="3rd Semester">3rd Semester</option>
                  <option value="4th Semester">4th Semester</option>
                  <option value="5th Semester">5th Semester</option>
                  <option value="6th Semester">6th Semester</option>
                  <option value="7th Semester">7th Semester</option>
                  <option value="8th Semester">8th Semester</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  University / College
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              id="save-profile-btn"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </section>
      </form>

      {/* 2. Security & Password Change */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Security & Password Change
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? "Hide Passwords" : "Show Passwords"}</span>
            </button>

            <button
              type="submit"
              id="change-password-btn"
              disabled={isUpdatingPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 font-semibold text-xs shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 3. Theme Toggle Section */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <Sun className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Interface Theme
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              theme === "light"
                ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-sm font-bold text-gray-900 dark:text-white block">
                  Light Mode
                </span>
                <span className="text-xs text-gray-500">Clean high-contrast</span>
              </div>
            </div>
            {theme === "light" && <Check className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              theme === "dark"
                ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-sm font-bold text-gray-900 dark:text-white block">
                  Dark Mode
                </span>
                <span className="text-xs text-gray-500">IBM Carbon palette</span>
              </div>
            </div>
            {theme === "dark" && <Check className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              theme === "system"
                ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <div>
                <span className="text-sm font-bold text-gray-900 dark:text-white block">
                  System Sync
                </span>
                <span className="text-xs text-gray-500">OS preference</span>
              </div>
            </div>
            {theme === "system" && <Check className="w-4 h-4 text-blue-600" />}
          </button>
        </div>
      </section>

      {/* 4. Notification Settings */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Notification Preferences
          </h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Attendance Critical Threshold Alerts
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Instant warning whenever any course attendance drops below 75%.
              </p>
            </div>
            <input
              type="checkbox"
              checked={attendanceAlerts}
              onChange={(e) => setAttendanceAlerts(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Assignment Deadline Reminders
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automated reminders 24 hours and 3 hours prior to submission cutoffs.
              </p>
            </div>
            <input
              type="checkbox"
              checked={deadlineReminders}
              onChange={(e) => setDeadlineReminders(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Daily AI Morning Brief (08:00 AM)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive personalized schedule, room changes, and revision advice.
              </p>
            </div>
            <input
              type="checkbox"
              checked={aiMorningBrief}
              onChange={(e) => setAiMorningBrief(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                IBM Hackathon & Career Opportunities
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Alerts for campus drives matching your GPA and skill profile.
              </p>
            </div>
            <input
              type="checkbox"
              checked={placementUpdates}
              onChange={(e) => setPlacementUpdates(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* 5. Account Sign Out & Session */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Active Session & Sign Out
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Currently logged in as{" "}
              <strong className="text-blue-600 dark:text-blue-400">
                {user?.email || student.name}
              </strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Role: Student • Protected by JWT Token Session
            </p>
          </div>

          <button
            type="button"
            id="settings-logout-btn"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of CampusPilot</span>
          </button>
        </div>
      </section>
    </div>
  );
};
