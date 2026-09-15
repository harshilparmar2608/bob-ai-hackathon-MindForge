import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-gray-700 dark:text-gray-200"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center justify-center w-4 h-4">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-9 rounded-lg border bg-white dark:bg-gray-800/80 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-blue-500",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error
                ? "border-rose-300 dark:border-rose-800 focus:ring-rose-500/80 focus:border-rose-500 text-rose-900 dark:text-rose-100"
                : "border-gray-200 dark:border-gray-700/80",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 text-gray-400 dark:text-gray-500 flex items-center justify-center w-4 h-4">
              {rightIcon}
            </span>
          )}
        </div>

        {error ? (
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
