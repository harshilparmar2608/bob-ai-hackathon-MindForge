import React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "outline"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  dot = false,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    primary:
      "bg-blue-600 text-white border-transparent dark:bg-blue-600 dark:text-white",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    warning:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    danger:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    purple:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    neutral:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    outline:
      "bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700",
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: "bg-blue-500",
    primary: "bg-white",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    purple: "bg-purple-500",
    neutral: "bg-gray-500",
    outline: "bg-gray-400",
  };

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.2 rounded font-medium",
    md: "text-[11px] px-2 py-0.5 rounded-md font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border tracking-tight shrink-0 select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};
