import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Brain,
  AlertTriangle,
  BookOpen,
  Briefcase,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Database,
  ShieldCheck,
  ArrowRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import { MOCK_SMART_RECOMMENDATIONS } from "../services/mockData";
import { SmartRecommendation } from "../types";
import { toast } from "sonner";
import { sendChatMessage, parseAiJson } from "../services/chatService";

// ─── Category configuration ──────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  attendance: {
    label: "Attendance",
    Icon: BookOpen,
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-50 dark:bg-rose-950/60",
    borderClass: "border-rose-200 dark:border-rose-800",
  },
  exam_prep: {
    label: "Exam Prep",
    Icon: Brain,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-50 dark:bg-purple-950/60",
    borderClass: "border-purple-200 dark:border-purple-800",
  },
  career: {
    label: "Career",
    Icon: Briefcase,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-50 dark:bg-blue-950/60",
    borderClass: "border-blue-200 dark:border-blue-800",
  },
  academic: {
    label: "Academic",
    Icon: Target,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-950/60",
    borderClass: "border-amber-200 dark:border-amber-800",
  },
} as const;

const URGENCY_CONFIG = {
  critical: {
    label: "Critical",
    textClass: "text-rose-700 dark:text-rose-300",
    bgClass: "bg-rose-100 dark:bg-rose-950/80",
    borderClass: "border-rose-300 dark:border-rose-700",
    ringClass: "ring-1 ring-rose-300 dark:ring-rose-800",
    cardBorder: "border-rose-300 dark:border-rose-800",
  },
  high: {
    label: "High",
    textClass: "text-amber-700 dark:text-amber-300",
    bgClass: "bg-amber-100 dark:bg-amber-950/80",
    borderClass: "border-amber-300 dark:border-amber-700",
    ringClass: "",
    cardBorder: "border-amber-200 dark:border-amber-900",
  },
  medium: {
    label: "Medium",
    textClass: "text-blue-700 dark:text-blue-300",
    bgClass: "bg-blue-100 dark:bg-blue-950/80",
    borderClass: "border-blue-300 dark:border-blue-700",
    ringClass: "",
    cardBorder: "border-gray-200 dark:border-gray-800",
  },
  low: {
    label: "Low",
    textClass: "text-gray-600 dark:text-gray-400",
    bgClass: "bg-gray-100 dark:bg-gray-800",
    borderClass: "border-gray-300 dark:border-gray-600",
    ringClass: "",
    cardBorder: "border-gray-200 dark:border-gray-800",
  },
} as const;

// ─── Sub-component: Recommendation Card ──────────────────────────────────────

interface RecCardProps {
  rec: SmartRecommendation;
  onAction: (rec: SmartRecommendation) => void;
}

const RecCard: React.FC<RecCardProps> = ({ rec, onAction }) => {
  const [expanded, setExpanded] = useState(false);

  const cat = CATEGORY_CONFIG[rec.category];
  const urg = URGENCY_CONFIG[rec.urgency];
  const CatIcon = cat.Icon;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#161c28] border shadow-xs transition-all hover:shadow-md ${urg.cardBorder} ${urg.ringClass}`}
    >
      {/* Card body */}
      <div className="p-5">
        {/* Row 1: Category icon + title + urgency badge + confidence */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`p-2.5 rounded-xl shrink-0 border ${cat.bgClass} ${cat.borderClass} ${cat.colorClass}`}
            >
              <CatIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urg.bgClass} ${urg.textClass} ${urg.borderClass}`}
                >
                  {urg.label} Priority
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.bgClass} ${cat.colorClass} border ${cat.borderClass}`}
                >
                  {cat.label}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                {rec.title}
              </h3>
            </div>
          </div>

          {/* Confidence Score Ring */}
          {rec.confidenceScore !== undefined && (
            <div className="shrink-0 flex flex-col items-center gap-0.5 text-center">
              <span className="text-[11px] font-bold text-gray-900 dark:text-white">
                {rec.confidenceScore}%
              </span>
              <span className="text-[9px] text-gray-400 uppercase tracking-wide font-medium">
                Confidence
              </span>
            </div>
          )}
        </div>

        {/* Row 2: Recommendation text */}
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed mb-3">
          {rec.recommendation}
        </p>

        {/* Row 3: Reason + Impact chips */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <span>
              <strong className="text-gray-800 dark:text-gray-300 font-semibold">Why: </strong>
              {rec.reason}
            </span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">Impact: </strong>
              {rec.expectedImpact}
            </span>
          </div>
        </div>

        {/* Row 4: Timestamp + Actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{rec.timestamp}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <span>{expanded ? "Hide Details" : "Why AI?"}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={() => onAction(rec)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors active:scale-98 cursor-pointer"
            >
              <span>{rec.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable: Why This Recommendation */}
      {expanded && rec.whyThisRecommendation && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-gray-800 space-y-3 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              AI Decision Transparency
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-1">
              <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Target className="w-3 h-3 text-rose-500" /> Primary Trigger
              </span>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {rec.whyThisRecommendation.primaryTrigger}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-1">
              <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> Projected Outcome
              </span>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {rec.whyThisRecommendation.projectedOutcome}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-1">
              <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-blue-500" /> Historical Context
              </span>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {rec.whyThisRecommendation.historicalContext}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-1">
              <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> Risk If Ignored
              </span>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {rec.whyThisRecommendation.riskIfIgnored}
              </p>
            </div>
          </div>

          {/* Data sources */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Database className="w-3 h-3" /> Data Sources:
            </span>
            {rec.whyThisRecommendation.dataSources.map((src) => (
              <span
                key={src}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                {src}
              </span>
            ))}
          </div>

          {/* Confidence reason */}
          {rec.confidenceReason && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              {rec.confidenceReason}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [allRecs, setAllRecs] = useState<SmartRecommendation[]>(MOCK_SMART_RECOMMENDATIONS);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredRecs =
    activeFilter === "all"
      ? allRecs
      : allRecs.filter((r) => r.category === activeFilter);

  const criticalCount = allRecs.filter((r) => r.urgency === "critical").length;
  const highCount = allRecs.filter((r) => r.urgency === "high").length;
  const avgConfidence = Math.round(
    allRecs.reduce((sum, r) => sum + (r.confidenceScore ?? 0), 0) / (allRecs.length || 1)
  );

  const handleAction = (rec: SmartRecommendation) => {
    toast.success("Creating Study Plan", {
      description: `Gemini AI is generating a plan for "${rec.title}".`,
    });
    navigate("/planner");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const prompt = `You are Bob AI Decision Intelligence. Analyze a university student's academic profile (GPA 3.75, CS Major, upcoming exam in Raft Consensus, placement drive in 4 weeks for IBM/Google).
Return ONLY a valid JSON array containing 4 structured recommendation objects (no markdown, no backticks).
Each object must have this exact structure:
[
  {
    "id": "rec-gemini-1",
    "title": "Short title",
    "category": "attendance" | "exam_prep" | "career" | "academic",
    "urgency": "critical" | "high" | "medium" | "low",
    "recommendation": "Detailed actionable recommendation text",
    "reason": "Clear explanation of why this matters now",
    "expectedImpact": "Quantitative or concrete expected benefit",
    "actionLabel": "Button label e.g. Start Prep",
    "confidenceScore": 95,
    "confidenceReason": "High correlation with upcoming campus drive criteria",
    "timestamp": "Just now",
    "whyThisRecommendation": {
      "primaryTrigger": "Automated trigger description",
      "projectedOutcome": "Projected outcome description",
      "historicalContext": "Historical context",
      "riskIfIgnored": "Risk description if ignored",
      "dataSources": ["LMS Analytics", "Attendance Portal", "Career Index"]
    }
  }
]`;
      const response = await sendChatMessage([{ role: "user", content: prompt }]);
      const parsed = parseAiJson<SmartRecommendation[]>(response.reply.content);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setAllRecs(parsed);
        toast.success("Recommendations Refreshed with Live AI!", {
          description: "Gemini AI re-analyzed your academic status and updated decision insights.",
        });
      }
    } catch (err) {
      console.error("Refresh recommendations error:", err);
      toast.error("Could not refresh with live AI, using cached insights.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const FILTER_TABS = [
    { id: "all", label: "All Insights" },
    { id: "attendance", label: "Attendance" },
    { id: "exam_prep", label: "Exam Prep" },
    { id: "academic", label: "Academic" },
    { id: "career", label: "Career" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>AI Recommendations Hub</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Explainable AI decision intelligence — Recommendation · Reason · Expected Impact.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-blue-500 text-gray-700 dark:text-gray-300 text-xs font-semibold shadow-2xs transition-all active:scale-98 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Refreshing…" : "Refresh AI Analysis"}</span>
        </button>
      </div>

      {/* ── Stat Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Insights
          </span>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
            {allRecs.length}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Active recommendations</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-rose-200 dark:border-rose-900/50 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Critical
          </span>
          <div className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {criticalCount}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Require immediate action</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-amber-200 dark:border-amber-900/50 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            High Priority
          </span>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
            {highCount}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Act within 24 hours</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Avg Confidence
          </span>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {avgConfidence}%
          </div>
          <p className="text-xs text-gray-400 mt-0.5">IBM Granite AI certainty</p>
        </div>
      </div>

      {/* ── AI Engine Banner ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-700 to-blue-900 text-white p-5 sm:p-6 border border-blue-500/20 shadow-sm">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>IBM Granite AI Engine Active</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Explainable AI Decision Intelligence
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed max-w-xl">
              Every recommendation below is traceable — see exactly what data triggered it, what the
              model predicted, and what happens if you ignore it. No black-box AI here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/assistant")}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 font-semibold text-sm hover:bg-blue-50 active:scale-98 transition-all shadow-sm cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
            <span>Ask AI Copilot</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Filter Tabs ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-white dark:bg-[#161c28] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
          <Filter className="w-3 h-3" />
          Showing {filteredRecs.length} of {allRecs.length} recommendations
        </span>
      </div>

      {/* ── Recommendation Cards ───────────────────────────────────────────── */}
      {filteredRecs.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-[#161c28] border border-dashed border-gray-300 dark:border-gray-700">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No recommendations in this category</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            IBM Granite AI found no active insights for this filter. Try another category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecs.map((rec) => (
            <RecCard key={rec.id} rec={rec} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
};
