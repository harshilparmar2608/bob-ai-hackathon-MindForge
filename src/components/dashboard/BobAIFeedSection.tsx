import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Bot,
  Brain,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Layers,
  Info,
  HelpCircle,
  RotateCcw,
  Plus,
  Play,
  Flame,
  Check,
  ExternalLink,
  BookOpen,
  Sliders,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Modal,
  Tooltip,
  ProgressRing,
  Notification,
} from "../ui";
import { SmartRecommendation, PriorityLevel } from "../../types";
import { MOCK_SMART_RECOMMENDATIONS } from "../../services/mockData";

export interface BobAIFeedSectionProps {
  className?: string;
  initialRecommendations?: SmartRecommendation[];
  onStudyPlanCreated?: (plan: { title: string; duration: number; time: string }) => void;
}

export const BobAIFeedSection: React.FC<BobAIFeedSectionProps> = ({
  className,
  initialRecommendations = MOCK_SMART_RECOMMENDATIONS,
  onStudyPlanCreated,
}) => {
  // Feed state (supports dismiss and undo)
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>(initialRecommendations);
  const [dismissedItems, setDismissedItems] = useState<SmartRecommendation[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Accordion state for "Why this recommendation?"
  const [expandedWhyIds, setExpandedWhyIds] = useState<Set<string>>(new Set(["rec-1"]));

  // Study Plan Modal State
  const [studyPlanItem, setStudyPlanItem] = useState<SmartRecommendation | null>(null);
  const [studyPlanDuration, setStudyPlanDuration] = useState<number>(60);
  const [studyPlanTime, setStudyPlanTime] = useState<string>("04:30 PM Today");
  const [studyPlanFocusMode, setStudyPlanFocusMode] = useState<string>("Deep Work (Pomodoro)");
  const [planSuccessNotice, setPlanSuccessNotice] = useState<string | null>(null);

  // Explain XAI Modal State
  const [explainItem, setExplainItem] = useState<SmartRecommendation | null>(null);

  // Category filter tabs
  const filteredRecommendations = useMemo(() => {
    if (activeCategory === "all") return recommendations;
    return recommendations.filter((item) => item.category === activeCategory);
  }, [recommendations, activeCategory]);

  // Toggle "Why this recommendation?"
  const handleToggleWhy = (id: string) => {
    setExpandedWhyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Dismiss a recommendation
  const handleDismiss = (item: SmartRecommendation) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== item.id));
    setDismissedItems((prev) => [item, ...prev]);
  };

  // Undo dismiss
  const handleUndoDismiss = () => {
    if (dismissedItems.length === 0) return;
    const [lastItem, ...rest] = dismissedItems;
    setRecommendations((prev) => [lastItem, ...prev]);
    setDismissedItems(rest);
  };

  // Create study plan submit
  const handleConfirmStudyPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyPlanItem) return;

    onStudyPlanCreated?.({
      title: studyPlanItem.title,
      duration: studyPlanDuration,
      time: studyPlanTime,
    });

    setPlanSuccessNotice(`Study plan scheduled for "${studyPlanItem.title}" at ${studyPlanTime} (${studyPlanDuration} mins)!`);
    setStudyPlanItem(null);

    // Auto clear notification after 5s
    setTimeout(() => {
      setPlanSuccessNotice(null);
    }, 5000);
  };

  // Render Category Badge
  const renderCategoryBadge = (category: SmartRecommendation["category"]) => {
    switch (category) {
      case "attendance":
        return (
          <Badge variant="danger" size="sm" dot>
            Attendance Warning
          </Badge>
        );
      case "exam_prep":
        return (
          <Badge variant="warning" size="sm">
            Exam Readiness
          </Badge>
        );
      case "career":
        return (
          <Badge variant="purple" size="sm">
            Career & Placement
          </Badge>
        );
      case "academic":
      default:
        return (
          <Badge variant="primary" size="sm">
            Academic Priority
          </Badge>
        );
    }
  };

  return (
    <div id="bob-ai-feed-section" className={`space-y-4 ${className || ""}`}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Bob AI Copilot Feed & Smart Recommendations
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Brain className="w-3 h-3" />
                IBM Granite 3.0
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Prescriptive interventions with causal telemetry, explainable confidence, and one-click study plans
            </p>
          </div>
        </div>

        {/* Confidence & Filter Badges */}
        <div className="flex items-center gap-2">
          {dismissedItems.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUndoDismiss}
              className="text-xs h-7 py-0 px-2.5 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Undo Dismiss ({dismissedItems.length})
            </Button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>94.2% Copilot Accuracy</span>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {planSuccessNotice && (
        <Notification
          variant="success"
          title="Study Plan Scheduled"
          message={planSuccessNotice}
          onClose={() => setPlanSuccessNotice(null)}
        />
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5">
          {[
            { key: "all", label: "All Insights", count: recommendations.length },
            {
              key: "attendance",
              label: "Attendance Alerts",
              count: recommendations.filter((r) => r.category === "attendance").length,
            },
            {
              key: "exam_prep",
              label: "Exam Prep",
              count: recommendations.filter((r) => r.category === "exam_prep").length,
            },
            {
              key: "career",
              label: "Career & Placement",
              count: recommendations.filter((r) => r.category === "career").length,
            },
            {
              key: "academic",
              label: "Coursework",
              count: recommendations.filter((r) => r.category === "academic").length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                activeCategory === tab.key
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "bg-white dark:bg-[#161c28] text-gray-600 dark:text-gray-300 border border-gray-200/90 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeCategory === tab.key
                    ? "bg-purple-800 text-white font-bold"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 font-mono hidden md:inline">
          {recommendations.length} Active Interventions
        </span>
      </div>

      {/* Feed Cards List */}
      <div className="space-y-3.5">
        {filteredRecommendations.length === 0 ? (
          <Card variant="default" className="p-8 text-center border-gray-200/90 dark:border-gray-800">
            <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                All Recommendations Handled
              </p>
              <p className="text-xs text-gray-400 max-w-sm">
                You have resolved or dismissed all insights in this category. Bob AI will continuously monitor your LMS for updates.
              </p>
              {dismissedItems.length > 0 && (
                <Button variant="secondary" size="sm" onClick={handleUndoDismiss} className="mt-2 text-xs">
                  Restore Dismissed Insights
                </Button>
              )}
            </div>
          </Card>
        ) : (
          filteredRecommendations.map((rec) => {
            const isWhyExpanded = expandedWhyIds.has(rec.id);
            const isUrgent = rec.urgency === "critical";

            return (
              <Card
                key={rec.id}
                variant="default"
                className={`border-l-4 transition-all duration-200 overflow-hidden ${
                  isUrgent
                    ? "border-l-rose-600 dark:border-l-rose-500 bg-gradient-to-r from-rose-50/20 via-white to-white dark:from-rose-950/10 dark:via-[#161c28] dark:to-[#161c28]"
                    : rec.urgency === "high"
                    ? "border-l-amber-500 dark:border-l-amber-400"
                    : "border-l-blue-600 dark:border-l-blue-500"
                } border-gray-200/90 dark:border-gray-800`}
              >
                <CardContent className="p-4 sm:p-5 space-y-3.5">
                  {/* Card Header: Badges, Confidence Metric, Timestamp, and Dismiss Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {renderCategoryBadge(rec.category)}
                      
                      {/* Confidence Score Badge */}
                      {rec.confidenceScore && (
                        <Tooltip
                          content={
                            rec.confidenceReason ||
                            `AI Confidence: ${rec.confidenceScore}% certainty based on validated university records.`
                          }
                        >
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                            <span>{rec.confidenceScore}% Confidence</span>
                          </div>
                        </Tooltip>
                      )}

                      {rec.urgency === "critical" && (
                        <Badge variant="danger" size="sm">
                          Immediate Action
                        </Badge>
                      )}

                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">
                        {rec.timestamp}
                      </span>
                    </div>

                    {/* Dismiss Button */}
                    <div className="flex items-center gap-1">
                      <Tooltip content="Dismiss this recommendation from your feed">
                        <button
                          type="button"
                          onClick={() => handleDismiss(rec)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          aria-label="Dismiss recommendation"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                    {rec.title}
                  </h3>

                  {/* 1. Core Recommendation Box */}
                  <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                    <span className="block text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider mb-0.5">
                      Bob AI Prescriptive Guidance
                    </span>
                    <p className="text-xs text-blue-950 dark:text-blue-100 font-medium leading-relaxed">
                      {rec.recommendation}
                    </p>
                  </div>

                  {/* 2. Reason & Expected Impact Dual Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <span className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-1">
                        Algorithmic Trigger & Reason
                      </span>
                      <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-normal">
                        {rec.reason}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                      <span className="block text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider mb-1">
                        Expected Impact & Recovery
                      </span>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium leading-normal">
                        {rec.expectedImpact}
                      </p>
                    </div>
                  </div>

                  {/* 3. "Why this recommendation?" Expandable XAI Drawer */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleWhy(rec.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer select-none"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Why this recommendation?</span>
                      {isWhyExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                      )}
                    </button>

                    {isWhyExpanded && rec.whyThisRecommendation && (
                      <div className="mt-2.5 p-3.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/50 space-y-2.5 text-xs animate-in fade-in duration-150">
                        <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/60 pb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                            <Brain className="w-3 h-3" />
                            Causal Diagnostic Evidence & Transparency
                          </span>
                          <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                            Model: Granite-3-StudentSuccess
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[11px] text-gray-700 dark:text-gray-300">
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              Primary Trigger:{" "}
                            </span>
                            <span>{rec.whyThisRecommendation.primaryTrigger}</span>
                          </div>

                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              Historical Cohort Data:{" "}
                            </span>
                            <span>{rec.whyThisRecommendation.historicalContext}</span>
                          </div>

                          <div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              Risk If Ignored:{" "}
                            </span>
                            <span className="text-rose-600 dark:text-rose-400 font-medium">
                              {rec.whyThisRecommendation.riskIfIgnored}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-gray-500 dark:text-gray-400 flex-wrap">
                            <span className="font-semibold">Grounding Data Sources:</span>
                            {rec.whyThisRecommendation.dataSources.map((ds, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px]"
                              >
                                {ds}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Action Row: Create Study Plan, Explain, Dismiss */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setStudyPlanItem(rec)}
                        className="text-xs h-8 flex items-center gap-1.5 shadow-2xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Create Study Plan
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setExplainItem(rec)}
                        className="text-xs h-8 flex items-center gap-1.5 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      >
                        <Info className="w-3.5 h-3.5" />
                        Explain
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(rec)}
                      className="text-xs h-8 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Study Plan Modal */}
      {studyPlanItem && (
        <Modal
          isOpen={Boolean(studyPlanItem)}
          onClose={() => setStudyPlanItem(null)}
          title="Create Targeted Study Plan"
          description={`Auto-configuring focused revision block for: ${studyPlanItem.title}`}
          size="md"
        >
          <form onSubmit={handleConfirmStudyPlan} className="space-y-4 pt-1">
            <div className="p-3 rounded-lg bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-xs">
              <span className="font-bold text-purple-900 dark:text-purple-200 block mb-1">
                AI Target Objective
              </span>
              <p className="text-purple-950 dark:text-purple-100 leading-relaxed">
                {studyPlanItem.recommendation}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Duration (Minutes)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setStudyPlanDuration(mins)}
                      className={`h-8 rounded text-xs font-semibold border transition-all cursor-pointer ${
                        studyPlanDuration === mins
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Schedule Time
                </label>
                <input
                  type="text"
                  value={studyPlanTime}
                  onChange={(e) => setStudyPlanTime(e.target.value)}
                  className="w-full h-8 px-3 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Focus Methodology
              </label>
              <select
                value={studyPlanFocusMode}
                onChange={(e) => setStudyPlanFocusMode(e.target.value)}
                className="w-full h-8 px-3 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer"
              >
                <option value="Deep Work (Pomodoro)">Deep Work: 25m Focus + 5m Recovery</option>
                <option value="Spaced Repetition Active Recall">Spaced Repetition: Active Diagnostic Drill</option>
                <option value="Flow State Continuous">Flow State: Continuous 90m without interruption</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80 space-y-1.5 text-xs">
              <span className="font-bold text-gray-700 dark:text-gray-300 block text-[11px] uppercase">
                Generated Milestones for this Session:
              </span>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300 list-disc list-inside text-[11px]">
                <li>00:00 - 00:10: Review core concepts and error analysis logs.</li>
                <li>00:10 - 00:45: Deep implementation and verification against past test cases.</li>
                <li>00:45 - 01:00: Diagnostic quiz submission to register mastery boost in Bob AI.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStudyPlanItem(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="text-xs flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700"
              >
                <Check className="w-3.5 h-3.5" />
                Schedule to Calendar
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Explainable AI (XAI) Model Transparency Modal */}
      {explainItem && (
        <Modal
          isOpen={Boolean(explainItem)}
          onClose={() => setExplainItem(null)}
          title="Explainable AI (XAI) Diagnostic Card"
          description={`Full algorithmic provenance and weighting matrix for: ${explainItem.title}`}
          size="lg"
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* Model Provenance Banner */}
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-900 dark:text-purple-200 block text-xs">
                  Model: IBM Granite 3.0 Student Success Copilot
                </span>
                <span className="text-[11px] text-purple-700 dark:text-purple-300">
                  Zero-data retention policy • Grounded in institutional syllabus and attendance guidelines
                </span>
              </div>
              <div className="text-right font-mono text-purple-900 dark:text-purple-200 font-bold">
                {explainItem.confidenceScore}% Confidence
              </div>
            </div>

            {/* Feature Weighting Breakdown */}
            <div className="space-y-2">
              <span className="font-bold text-gray-900 dark:text-white block text-xs">
                Relative Feature Weighting in this Decision
              </span>
              <div className="space-y-2">
                {[
                  { feature: "Regulatory Cutoff Proximity (Attendance)", weight: 42, color: "bg-rose-500" },
                  { feature: "Time Urgency / Deadline Immediacy", weight: 28, color: "bg-amber-500" },
                  { feature: "Historical Grade Impact Yield", weight: 18, color: "bg-blue-500" },
                  { feature: "Cognitive Load & Fatigue Assessment", weight: 12, color: "bg-emerald-500" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {item.feature}
                      </span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {item.weight}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethical AI & Student Agency Guarantees */}
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
              <span className="font-bold text-gray-900 dark:text-white block">
                Student Autonomy & Control:
              </span>
              <p>
                Bob AI recommendations are purely prescriptive suggestions. You maintain full autonomy to accept, modify, or dismiss any plan without penalty. Data inputs are never used to train public LLMs.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExplainItem(null)}
                className="text-xs"
              >
                Close Explanation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
