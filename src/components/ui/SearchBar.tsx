import React, { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = "Search assignments, notes, topics, or ask Bob AI...",
      className,
      size = "md",
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: "h-8 text-xs pl-8 pr-7",
      md: "h-9 text-xs pl-9 pr-8",
      lg: "h-11 text-sm pl-10 pr-9",
    };

    const iconSizes = {
      sm: "w-3.5 h-3.5 left-2.5",
      md: "w-4 h-4 left-3",
      lg: "w-5 h-5 left-3.5",
    };

    return (
      <div className={cn("relative flex items-center w-full", className)}>
        <Search
          className={cn(
            "absolute text-gray-400 dark:text-gray-500 pointer-events-none transition-colors",
            iconSizes[size]
          )}
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80",
            "text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-blue-500",
            "transition-all duration-150",
            sizeStyles[size]
          )}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
