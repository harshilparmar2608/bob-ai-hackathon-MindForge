import React, { useState } from "react";
import { cn } from "../../lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = "top",
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2 py-1 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-800 rounded shadow-md pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100",
            positionStyles[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
