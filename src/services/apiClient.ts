/**
 * Axios API client for CampusPilot.
 *
 * - Base URL is read from VITE_API_BASE_URL (falls back to localhost:8000/api/v1).
 * - Attaches the stored JWT access token to every outgoing request.
 * - On 401 responses it attempts a single silent token refresh; if the refresh
 *   also fails it clears storage so the app can redirect to login.
 * - On any other error the rejected value is normalised to a plain Error so
 *   callers never have to inspect raw Axios internals.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { tokenStorage } from "../lib/tokenStorage";

const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:8000/api/v1";

/** 10-second request timeout — prevents silent hangs. */
const REQUEST_TIMEOUT_MS = 10_000;

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor — attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ─── Response interceptor — refresh on 401, normalise errors ─────────────────
let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pendingQueue: Array<{ resolve: (value: any) => void; reject: (reason?: unknown) => void }> = [];

function drainQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean;
    };

    // Attempt a silent token refresh on 401, but only once per request.
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried
    ) {
      originalRequest._retried = true;

      if (isRefreshing) {
        // Queue the request until the ongoing refresh completes.
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clearTokens();
        isRefreshing = false;
        drainQueue(error, null);
        return Promise.reject(normaliseError(error));
      }

      try {
        const { data } = await apiClient.post<{
          access_token: string;
          refresh_token: string;
        }>("/auth/refresh", { refresh_token: refreshToken });

        tokenStorage.saveTokens(data.access_token, data.refresh_token);
        isRefreshing = false;
        drainQueue(null, data.access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenStorage.clearTokens();
        isRefreshing = false;
        drainQueue(refreshError, null);
        return Promise.reject(normaliseError(refreshError));
      }
    }

    return Promise.reject(normaliseError(error));
  }
);

/**
 * Converts an Axios error (or any unknown throw) into a plain Error whose
 * message is the API's `error.message` envelope field, a `detail` string, or a
 * generic fallback.
 */
function normaliseError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { error?: { message?: string }; detail?: string; message?: string }
      | undefined;

    const message =
      payload?.error?.message ??
      payload?.message ??
      (typeof payload?.detail === "string" ? payload.detail : undefined) ??
      error.message;

    return new Error(message || "An unexpected error occurred");
  }
  if (error instanceof Error) return error;
  return new Error("An unexpected error occurred");
}
