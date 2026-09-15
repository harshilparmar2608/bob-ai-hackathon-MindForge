import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ThemeContextType, ThemeMode } from "../types/theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_STORAGE_KEY = "campuspilot_theme_mode";

const getSystemPreference = (): "light" | "dark" => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
};

const applyThemeToDOM = (resolved: "light" | "dark") => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read saved theme from localStorage, or default to "system" if no preference exists
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        if (stored && ["light", "dark", "system"].includes(stored)) {
          return stored;
        }
      } catch {
        // Fallback if storage access is restricted
      }
    }
    return "system";
  });

  // Calculate the active resolved theme ("light" or "dark") synchronously
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        if (stored === "dark") return "dark";
        if (stored === "light") return "light";
      } catch {
        // Continue
      }
      return getSystemPreference();
    }
    return "light";
  });

  // Update theme and apply instantly to DOM and storage
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors in sandboxed environments
    }

    const active = newTheme === "system" ? getSystemPreference() : newTheme;
    setResolvedTheme(active);
    applyThemeToDOM(active);
  }, []);

  // Toggle between light and dark instantly
  const toggleTheme = useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  // Synchronize on mount and monitor system preference changes
  useEffect(() => {
    const active = theme === "system" ? getSystemPreference() : theme;
    setResolvedTheme(active);
    applyThemeToDOM(active);

    // Watch for OS system preference changes if in system mode
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = (e: MediaQueryListEvent) => {
        if (theme === "system") {
          const sysActive = e.matches ? "dark" : "light";
          setResolvedTheme(sysActive);
          applyThemeToDOM(sysActive);
        }
      };

      mediaQuery.addEventListener("change", handleSystemChange);

      // Listen for changes from other tabs
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === THEME_STORAGE_KEY && e.newValue) {
          if (["light", "dark", "system"].includes(e.newValue)) {
            const nextMode = e.newValue as ThemeMode;
            setThemeState(nextMode);
            const nextActive = nextMode === "system" ? getSystemPreference() : nextMode;
            setResolvedTheme(nextActive);
            applyThemeToDOM(nextActive);
          }
        }
      };
      window.addEventListener("storage", handleStorageChange);

      return () => {
        mediaQuery.removeEventListener("change", handleSystemChange);
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

