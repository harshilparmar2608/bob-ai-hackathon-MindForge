/**
 * Token storage utility for CampusPilot.
 * Centralises all localStorage access for auth tokens so the rest of the
 * codebase never touches raw storage keys directly.
 */

const ACCESS_TOKEN_KEY = "campus_pilot_auth_token";
const REFRESH_TOKEN_KEY = "campus_pilot_refresh_token";

export const tokenStorage = {
  /** Persist both access and (optionally) refresh tokens. */
  saveTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  /** Return the stored access token, or null if absent. */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /** Return the stored refresh token, or null if absent. */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /** Replace the access token in place (e.g. after a silent refresh). */
  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  /** Remove both tokens (logout). */
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /** Convenience: true when an access token is present. */
  hasToken(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};
