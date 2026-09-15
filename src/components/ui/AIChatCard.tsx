import React from "react";
import { Sparkles, Bot, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";

export interface AIChatCardProps {
  source?: string;
  timestamp?: string;
  badge?: string;
  message: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const AIChatCard: React.FC<AIChatCardProps> = ({
  source = "Bob AI - Academic",
  timestamp = "Just now",
  badge = "Actionable",
  message,
  primaryAction,
  secondaryAction,
  className,
}) => {
  return (
    <Card
      variant="ai"
      className={cn(
        "relative overflow-hidden border-purple-200/90 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/30 via-white to-white dark:from-purple-950/20 dark:via-[#161c28] dark:to-[#161c28]",
        className
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
              {source}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                {badge}
              </span>
            )}
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {timestamp}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-normal">
          {message}
        </p>

        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-purple-100 dark:border-purple-950/60">
            {primaryAction && (
              <Button
                variant="ai"
                size="sm"
                onClick={primaryAction.onClick}
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={secondaryAction.onClick}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
