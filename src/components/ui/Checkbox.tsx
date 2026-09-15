import React, { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, onChange, disabled, id, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="inline-flex items-start gap-2.5 select-none">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer",
              "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800",
              "peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              className
            )}
          >
            {checked && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
          </label>
        </div>

        {(label || description) && (
          <div className="text-xs">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  "font-medium text-gray-900 dark:text-gray-100 cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
