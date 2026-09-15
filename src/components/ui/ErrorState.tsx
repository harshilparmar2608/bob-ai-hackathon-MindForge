import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to load data",
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-6 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-center flex flex-col items-center justify-center",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-rose-700 dark:text-rose-300 max-w-sm mt-1 mb-3">
        {message}
      </p>
      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Retry
        </Button>
      )}
    </div>
  );
};
