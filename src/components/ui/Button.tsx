import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "danger"
  | "ghost"
  | "ai";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium tracking-normal transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.99]";

    const variantStyles: Record<ButtonVariant, string> = {
      // Carbon Primary: Solid IBM Blue #0f62fe
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-xs border border-transparent dark:bg-blue-600 dark:hover:bg-blue-500",
      // Carbon Secondary: Gray tone with subtle border
      secondary:
        "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-700",
      // Carbon Tertiary: High-contrast outlined
      tertiary:
        "bg-transparent hover:bg-blue-50 text-blue-600 border border-blue-600 dark:text-blue-400 dark:border-blue-500 dark:hover:bg-blue-950/40",
      // Carbon Danger: Red tone for destructive actions
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-xs border border-transparent dark:bg-red-700 dark:hover:bg-red-600",
      // Carbon Ghost: Minimal text button with hover fill
      ghost:
        "bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/80 dark:hover:text-white",
      // IBM Bob AI signature style: Purple/Indigo accent
      ai: "bg-purple-600 hover:bg-purple-700 text-white shadow-xs border border-transparent dark:bg-purple-600 dark:hover:bg-purple-500",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5",
      md: "h-9 px-4 text-xs font-semibold rounded-lg gap-2",
      lg: "h-11 px-5 text-sm font-semibold rounded-lg gap-2.5",
      icon: "h-9 w-9 p-0 rounded-lg justify-center",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
