import React, { ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error caught by CampusPilot ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-[360px] flex items-center justify-center p-6 bg-white dark:bg-[#161c28] rounded-xl border border-red-200 dark:border-red-900/50 shadow-xs text-center"
        >
          <div className="max-w-md space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {this.props.fallbackTitle || "Application Component Error"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A rendering exception occurred in this module. Your academic session data remains safe.
              </p>
              {this.state.error && (
                <div className="mt-2 p-2.5 rounded bg-gray-50 dark:bg-gray-900 text-left font-mono text-[11px] text-red-700 dark:text-red-300 overflow-x-auto border border-gray-200 dark:border-gray-800">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Component
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

