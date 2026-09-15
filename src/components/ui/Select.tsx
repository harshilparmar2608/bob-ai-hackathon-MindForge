import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      options = [],
      helperText,
      error,
      children,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-gray-700 dark:text-gray-200"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full h-9 rounded-lg border bg-white dark:bg-gray-800/80 px-3 pr-8 py-1.5 text-xs text-gray-900 dark:text-gray-100 shadow-2xs transition-colors appearance-none cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-blue-500",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-rose-300 dark:border-rose-800 focus:ring-rose-500/80 focus:border-rose-500"
                : "border-gray-200 dark:border-gray-700/80",
              className
            )}
            {...props}
          >
            {children ||
              options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
          </select>

          <ChevronDown className="absolute right-2.5 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
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

Select.displayName = "Select";
