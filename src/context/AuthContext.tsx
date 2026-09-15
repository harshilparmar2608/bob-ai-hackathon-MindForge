import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService, User } from "../services/authService";
import { APP_CONFIG } from "../lib/constants";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    studentId?: string;
    major?: string;
    semester?: string;
    password?: string;
  }) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage on mount and validate with backend
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const stored = authService.getStoredAuth();
                if (stored.token && stored.user) {
          // Validate token with backend by calling /auth/me (+ /student/profile)
          try {
            const refreshedUser = await authService.fetchAuthenticatedUser();
            setUser(refreshedUser);
            setToken(stored.token);
          } catch (error) {
            // Token is invalid, clear everything
            console.error("Token validation failed", error);
            authService.logout();
            setUser(null);
            setToken(null);
          }
        } else {
          // If not explicitly authenticated yet, we remain in unauthenticated state
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.error("Error restoring auth state", e);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setUser(res.user);
      setToken(res.token);
      toast.success(`Welcome back, ${res.user.name.split(" ")[0]}!`, {
        description: `Authenticated with ${APP_CONFIG.universityName} SSO / Granite AI Core.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to sign in";
      toast.error("Authentication failed", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    studentId?: string;
    major?: string;
    semester?: string;
    password?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      setUser(res.user);
      setToken(res.token);
      toast.success("Account created successfully!", {
        description: `Welcome to CampusPilot, ${res.user.name}!`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error("Registration failed", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    queryClient.clear();
    toast.info("Logged out successfully", {
      description: "You have ended your secure session.",
    });
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await authService.forgotPassword(email);
      toast.success("Recovery Email Sent", { description: res.message });
      return res;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      toast.error("Error", { description: message });
      throw error;
    }
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    try {
      await authService.changePassword(currentPass, newPass);
      toast.success("Password Updated", {
        description: "Your security credentials have been updated successfully.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update password";
      toast.error("Password Update Failed", { description: message });
      throw error;
    }
  };

    const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    authService.saveUser(updated);
    toast.success("Profile Updated", {
      description: "Your student credentials were saved successfully.",
    });
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const refreshedUser = await authService.fetchAuthenticatedUser();
      setUser(refreshedUser);
    } catch (error) {
      console.error("Failed to refresh user", error);
      throw error;
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        changePassword,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
