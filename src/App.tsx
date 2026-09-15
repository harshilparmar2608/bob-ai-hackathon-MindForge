import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/ThemeContext";
import { CustomCursor } from "./components/common/CustomCursor";
import { AuthProvider } from "./context/AuthContext";
import { StudentProvider } from "./context/StudentContext";
import { AcademicDataProvider } from "./context/AcademicDataContext";
import { AiCopilotProvider } from "./context/AiCopilotContext";
import { AppRoutes } from "./app/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <CustomCursor />
          <AuthProvider>
            <StudentProvider>
              <AcademicDataProvider>
                <AiCopilotProvider>
                  <AppRoutes />
                  <Toaster position="top-right" richColors />
                </AiCopilotProvider>
              </AcademicDataProvider>
            </StudentProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
