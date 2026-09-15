import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-3 shadow-2xs">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
