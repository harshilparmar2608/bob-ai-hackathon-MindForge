import React from "react";
import { cn } from "../../lib/utils";

export interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = "rectangular",
  count = 1,
}) => {
  const variantStyles = {
    text: "h-3.5 w-full rounded-sm",
    circular: "rounded-full shrink-0",
    rectangular: "h-12 w-full rounded-lg",
    card: "h-32 w-full rounded-xl",
  };

  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-gray-200/80 dark:bg-gray-800/80 transition-colors",
            variantStyles[variant],
            className
          )}
          aria-hidden="true"
        />
      ))}
    </>
  );
};
