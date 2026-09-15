import React from "react";
import { cn } from "../../lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./Card";

export interface ChartContainerProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  legend?: React.ReactNode;
  children: React.ReactNode;
  height?: number | string;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  action,
  legend,
  children,
  height = 300,
  className,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description || action) && (
        <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </CardHeader>
      )}

      <CardContent className="p-4 sm:p-5 pt-3">
        <div
          style={{ height: typeof height === "number" ? `${height}px` : height }}
          className="w-full relative"
        >
          {children}
        </div>

        {legend && (
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/80 text-[11px] text-gray-500 dark:text-gray-400">
            {legend}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
