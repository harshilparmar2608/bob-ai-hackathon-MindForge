/**
 * Authentication Service for CampusPilot
 *
 * Calls the FastAPI backend (/api/v1/auth/*).
 * The public interface (shapes + method signatures) is intentionally
 * identical to the previous mock service so AuthContext needs no changes.
 */

import { apiClient } from "./apiClient";
import { tokenStorage } from "../lib/tokenStorage";

// ─── Public types (unchanged from mock service) ───────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  major: string;
  college: string;
  semester: string;
  avatarUrl: string;
  role: "student" | "faculty" | "admin";
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

// ─── Backend response shapes ──────────────────────────────────────────────────

interface BackendTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface BackendUserRead {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  bio?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map a BackendUserRead into the frontend User shape.
 * The academic profile fields (studentId/major/college/semester/avatarUrl)
 * are populated from the dedicated /student/profile endpoint by AuthContext
 * after login, so here they default to "Unknown"/"N/A" rather than hard-coded
 * demo values.
 */
function mapUser(backendUser: BackendUserRead): User {
  return {
    id: backendUser.id,
    name: backendUser.full_name || "Unknown",
    email: backendUser.email || "",
    role: (backendUser.role as User["role"]) ?? "student",
    // Filled in from /student/profile after login — never from a local mock.
    studentId: "",
    major: "Unknown",
    college: "Unknown",
    semester: "N/A",
    avatarUrl: "",
  };
}

const STORAGE_KEY_USER = "campus_pilot_auth_user";

// ─── Auth service ─────────────────────────────────────────────────────────────

/** Backend student profile returned by GET /student/profile. */
interface BackendStudentProfileForAuth {
  enrollment_number: string;
  major: string;
  college: string;
  semester: string;
  avatar_url: string | null;
  current_gpa?: number;
  target_gpa?: number;
  class_rank?: string | null;
  attendance_rate?: number;
  placement_readiness?: number;
  academic_health_score?: number;
  current_period?: string;
  grad_year?: string;
}

export const authService = {
  /**
   * Check if token and user exist in storage (used on app boot by AuthContext).
   */
  getStoredAuth(): { user: User | null; token: string | null } {
    try {
      const token = tokenStorage.getAccessToken();
      const userJson = localStorage.getItem(STORAGE_KEY_USER);
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        return { user, token };
      }
    } catch {
      tokenStorage.clearTokens();
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    return { user: null, token: null };
  },

  /**
   * Fetch the base auth user (/auth/me) and enrich it with the academic
   * profile (/student/profile) so the frontend has a single, complete
   * user object — no local mock fallbacks required.
   */
  async fetchAuthenticatedUser(): Promise<User> {
    const { data: backendUser } = await apiClient.get<BackendUserRead>("/auth/me");
    const base = mapUser(backendUser);

    try {
      const { data: profile } =
        await apiClient.get<BackendStudentProfileForAuth>("/student/profile");
      base.studentId = profile.enrollment_number || "";
      base.major = profile.major || "Unknown";
      base.college = profile.college || "Unknown";
      base.semester = profile.semester || "N/A";
      base.avatarUrl = profile.avatar_url || "";
    } catch (err: unknown) {
      // Profile may not exist for brand-new users — keep the /auth/me base.
      console.warn("Could not load student profile", err);
    }

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(base));
    return base;
  },

  /**
   * Log in with email + password — calls POST /auth/login.
   */
  async login(email: string, password?: string): Promise<AuthResponse> {
    const { data: tokens } = await apiClient.post<BackendTokenResponse>(
      "/auth/login",
      { email, password: password ?? "" }
    );

    tokenStorage.saveTokens(tokens.access_token, tokens.refresh_token);

    const user = await this.fetchAuthenticatedUser();

    return {
      user,
      token: tokens.access_token,
      expiresIn: tokens.expires_in,
    };
  },

  /**
   * Register a new account — calls POST /auth/register, then logs in.
   */
  async register(data: {
    name: string;
    email: string;
    studentId?: string;
    major?: string;
    semester?: string;
    password?: string;
  }): Promise<AuthResponse> {
    // Register the account (returns UserRead, no tokens).
    await apiClient.post<BackendUserRead>("/auth/register", {
      full_name: data.name,
      email: data.email,
      password: data.password ?? "",
    });

    // Immediately log in to obtain tokens.
    return this.login(data.email, data.password);
  },

  /**
   * Request a password-reset email.
   * The backend does not expose this endpoint yet — returns a UI-friendly
   * message without hitting a missing route.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    // TODO: wire to a real backend endpoint once available.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      message: `Password reset link has been dispatched to ${email}. Check your inbox for recovery instructions.`,
    };
  },

  /**
   * Change password.
   * The backend does not expose this endpoint yet — stubbed for UI continuity.
   */
  async changePassword(
    _currentPass: string,
    _newPass: string
  ): Promise<{ success: boolean }> {
    // TODO: wire to a real backend endpoint once available.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true };
  },

  /**
   * Persist an updated user profile to local storage (client-side only).
   */
  saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  },

  /**
   * Clear tokens and cached user (logout).
   */
  logout(): void {
    tokenStorage.clearTokens();
    localStorage.removeItem(STORAGE_KEY_USER);
  },
};
