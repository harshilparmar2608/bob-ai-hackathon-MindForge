import React from "react";
import { Sparkles, ArrowRight, X, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";

export interface RecommendationCardProps {
  id: string;
  title: string;
  recommendation: string;
  reason: string;
  expectedImpact: string;
  category?: "academic" | "attendance" | "career" | "exam_prep";
  urgency?: "critical" | "high" | "medium" | "low";
  actionLabel?: string;
  timestamp?: string;
  onAction?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  id,
  title,
  recommendation,
  reason,
  expectedImpact,
  category = "academic",
  urgency = "medium",
  actionLabel = "Take Action",
  timestamp,
  onAction,
  onDismiss,
  className,
}) => {
  const categoryBadges = {
    academic: { label: "Academic Health", variant: "primary" as const },
    attendance: { label: "Attendance Alert", variant: "danger" as const },
    career: { label: "Career & Placement", variant: "purple" as const },
    exam_prep: { label: "Exam Readiness", variant: "warning" as const },
  };

  const urgencyVariants = {
    critical: "border-l-4 border-l-rose-600 dark:border-l-rose-500",
    high: "border-l-4 border-l-amber-500 dark:border-l-amber-400",
    medium: "border-l-4 border-l-blue-600 dark:border-l-blue-500",
    low: "border-l-4 border-l-gray-400 dark:border-l-gray-600",
  };

  const currentCategory = categoryBadges[category] || categoryBadges.academic;

  return (
    <Card
      className={cn(
        "transition-all shadow-xs relative",
        urgencyVariants[urgency],
        className
      )}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Header Badges and Dismiss Button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={currentCategory.variant} size="sm">
              {currentCategory.label}
            </Badge>
            {urgency === "critical" && (
              <Badge variant="danger" size="sm" dot>
                Immediate Action Required
              </Badge>
            )}
            {timestamp && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {timestamp}
              </span>
            )}
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md transition-colors"
              aria-label="Dismiss recommendation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          {title}
        </h4>

        {/* 1. RECOMMENDATION */}
        <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 mb-3">
          <span className="block text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider mb-0.5">
            AI Recommendation
          </span>
          <p className="text-xs text-blue-950 dark:text-blue-100 font-medium leading-relaxed">
            {recommendation}
          </p>
        </div>

        {/* 2. REASON & 3. EXPECTED IMPACT Triad Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mb-3.5">
          {/* Reason */}
          <div className="p-2.5 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <span className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-1">
              Reason
            </span>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-normal">
              {reason}
            </p>
          </div>

          {/* Expected Impact */}
          <div className="p-2.5 rounded-md bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <span className="block text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider mb-1">
              Expected Impact
            </span>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-normal font-medium">
              {expectedImpact}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {onAction && (
          <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-gray-800/80">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAction(id)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
