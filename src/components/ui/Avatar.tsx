import React, { useState } from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away";
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Student Avatar",
  fallback = "AR",
  size = "md",
  status,
  className,
  ...props
}) => {
  const [hasError, setHasError] = useState(!src);

  const sizeStyles = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm",
    xl: "w-14 h-14 text-base",
  };

  const statusDotSizes = {
    sm: "w-2 h-2 bottom-0 right-0 border",
    md: "w-2.5 h-2.5 bottom-0 right-0 border-2",
    lg: "w-3 h-3 bottom-0.5 right-0.5 border-2",
    xl: "w-3.5 h-3.5 bottom-0.5 right-0.5 border-2",
  };

  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-gray-400",
    busy: "bg-rose-500",
    away: "bg-amber-500",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 rounded-full font-semibold select-none border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 overflow-visible",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {!hasError && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="uppercase tracking-wider">{fallback}</span>
      )}

      {status && (
        <span
          className={cn(
            "absolute rounded-full border-white dark:border-[#161c28]",
            statusDotSizes[size],
            statusColors[status]
          )}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};
