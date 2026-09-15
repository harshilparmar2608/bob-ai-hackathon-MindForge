import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Target,
  Brain,
  Award,
  Play,
  Check,
} from "lucide-react";
import { useAcademicData } from "../context/AcademicDataContext";
import { useStudent } from "../context/StudentContext";
import { toast } from "sonner";

export const StudyPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { schedule, productivity, isLoading } = useAcademicData();
  const { student } = useStudent();

  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({
    "study-1": true,
  });

  const studyRoadmap = [
    {
      id: "study-1",
      title: "Distributed Systems Raft Consensus",
      subject: "Computer Networks (CS501)",
      duration: "90 mins",
      priority: "Critical",
      focusType: "Deep Work",
      recommendedSlot: "04:30 PM - 06:00 PM",
      completed: !!completedBlocks["study-1"],
    },
    {
      id: "study-2",
      title: "B+ Tree Indexing & Transaction Concurrency",
      subject: "Database Systems Lab (CS502L)",
      duration: "60 mins",
      priority: "High",
      focusType: "Lab Preparation",
      recommendedSlot: "07:00 PM - 08:00 PM",
      completed: !!completedBlocks["study-2"],
    },
    {
      id: "study-3",
      title: "Kernel CPU Scheduling Algorithms Revision",
      subject: "Operating Systems (CS505)",
      duration: "45 mins",
      priority: "Medium",
      focusType: "Spaced Repetition",
      recommendedSlot: "08:30 PM - 09:15 PM",
      completed: !!completedBlocks["study-3"],
    },
  ];

  const handleToggleBlock = (id: string, title: string) => {
    const nextState = !completedBlocks[id];
    setCompletedBlocks((prev) => ({ ...prev, [id]: nextState }));
    if (nextState) {
      toast.success("Study Session Logged!", {
        description: `Marked "${title}" as completed (+1.5 hrs logged).`,
      });
    } else {
      toast.info("Session Reopened", {
        description: `"${title}" moved back to pending.`,
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>AI Study Planner</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Personalized cognitive study roadmap synthesized by IBM Granite AI.
          </p>
        </div>

        <button
          id="ask-ai-study-plan-btn"
          onClick={() => navigate("/assistant")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI For New Study Plan</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold uppercase tracking-wider">Weekly Target</span>
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
            24.5 / 28.0 <span className="text-sm font-semibold text-gray-400">hrs</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: "87.5%" }} />
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            87.5% completed • 3.5 hrs remaining this week
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold uppercase tracking-wider">Cognitive Load</span>
            <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Balanced <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">62/100</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Peak retention window: 04:00 PM – 07:30 PM based on past attention logs.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold uppercase tracking-wider">Dean's List Pace</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
            GPA {student.currentGpa}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Target: {student.targetGpa} • Top 7% of 2026 Batch
          </p>
        </div>
      </div>

      {/* Today's Focus Blocks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Recommended Daily Study Blocks
          </h2>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            AI Auto-Scheduled
          </span>
        </div>

        <div className="space-y-3">
          {studyRoadmap.map((item) => {
            const isDone = !!completedBlocks[item.id];

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-white dark:bg-[#161c28] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? "border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/10"
                    : "border-gray-200 dark:border-gray-800 hover:border-blue-400"
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleBlock(item.id, item.title)}
                    className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isDone
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {item.subject}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {item.focusType}
                      </span>
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-bold text-gray-900 dark:text-white ${
                        isDone ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.recommendedSlot} ({item.duration})</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleBlock(item.id, item.title)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isDone
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isDone ? "Completed ✓" : "Mark Done"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
