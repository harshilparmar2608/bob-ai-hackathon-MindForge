import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";

export type NotificationVariant = "info" | "success" | "warning" | "error" | "ai";

export interface NotificationProps {
  id?: string;
  title: string;
  message: string;
  variant?: NotificationVariant;
  timestamp?: string;
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  variant = "info",
  timestamp,
  actionText,
  onAction,
  onClose,
  className,
}) => {
  const iconMap: Record<NotificationVariant, React.ReactNode> = {
    info: <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />,
    success: (
      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
    ),
    warning: (
      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
    ),
    error: <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
    ai: <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />,
  };

  const borderVariantMap: Record<NotificationVariant, string> = {
    info: "border-l-4 border-l-blue-600 bg-white dark:bg-[#161c28] border-gray-200/80 dark:border-gray-800",
    success:
      "border-l-4 border-l-emerald-600 bg-white dark:bg-[#161c28] border-gray-200/80 dark:border-gray-800",
    warning:
      "border-l-4 border-l-amber-500 bg-white dark:bg-[#161c28] border-gray-200/80 dark:border-gray-800",
    error:
      "border-l-4 border-l-rose-600 bg-white dark:bg-[#161c28] border-gray-200/80 dark:border-gray-800",
    ai: "border-l-4 border-l-purple-600 bg-white dark:bg-[#161c28] border-purple-200/60 dark:border-purple-900/40",
  };

  return (
    <div
      role="status"
      className={cn(
        "p-4 rounded-lg border shadow-xs transition-all",
        borderVariantMap[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{iconMap[variant]}</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                {title}
              </h4>
              {timestamp && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {timestamp}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
            {actionText && onAction && (
              <button
                type="button"
                onClick={onAction}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-1 inline-flex items-center gap-1 cursor-pointer"
              >
                {actionText} →
              </button>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md shrink-0 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
