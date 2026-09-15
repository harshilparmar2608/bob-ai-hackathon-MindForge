import React, { useState } from "react";
import {
  Briefcase,
  Sparkles,
  Target,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileCheck,
  ChevronRight,
  Code2,
  Send,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { toast } from "sonner";

interface DreamCompany {
  id: string;
  name: string;
  logoLetter: string;
  role: string;
  matchScore: number;
  salaryRange: string;
  driveDate: string;
  requiredSkills: string[];
  acquiredSkills: string[];
  missingSkills: string[];
  recommendedProject: string;
}

const DREAM_COMPANIES: DreamCompany[] = [
  {
    id: "ibm-genai",
    name: "IBM Software Labs",
    logoLetter: "IBM",
    role: "Cloud & AI Software Engineer (Campus 2026)",
    matchScore: 88,
    salaryRange: "$115,000 - $135,000",
    driveDate: "Oct 15, 2026",
    requiredSkills: [
      "Python / TypeScript",
      "Distributed Systems",
      "LLM Fine-tuning & RAG",
      "Docker & Kubernetes",
      "REST & gRPC APIs",
      "Red Hat OpenShift",
    ],
    acquiredSkills: ["Python / TypeScript", "Distributed Systems", "REST & gRPC APIs"],
    missingSkills: ["Docker & Kubernetes", "LLM Fine-tuning & RAG", "Red Hat OpenShift"],
    recommendedProject:
      "Build a multi-agent RAG retrieval pipeline deployed via Docker containers using IBM Granite 7.1.",
  },
  {
    id: "google-swe",
    name: "Google Engineering",
    logoLetter: "G",
    role: "Associate Software Engineer - Systems",
    matchScore: 82,
    salaryRange: "$130,000 - $155,000",
    driveDate: "Nov 02, 2026",
    requiredSkills: [
      "C++ / Go / Java",
      "Data Structures & Algorithms",
      "Concurrency & Multithreading",
      "Operating System Internals",
      "Large-scale Systems",
    ],
    acquiredSkills: ["Data Structures & Algorithms", "Operating System Internals", "C++ / Go / Java"],
    missingSkills: ["Concurrency & Multithreading", "Large-scale Systems"],
    recommendedProject:
      "Implement a lock-free concurrent hash map and benchmark thread contention under 64 cores.",
  },
  {
    id: "microsoft-azure",
    name: "Microsoft Core Services",
    logoLetter: "MS",
    role: "Software Development Engineer - Azure Core",
    matchScore: 79,
    salaryRange: "$120,000 - $140,000",
    driveDate: "Oct 28, 2026",
    requiredSkills: [
      "C# / TypeScript",
      "Distributed Storage",
      "Cloud Architecture",
      "Database Sharding",
      "CI/CD Pipelines",
    ],
    acquiredSkills: ["TypeScript", "Distributed Storage"],
    missingSkills: ["Cloud Architecture", "Database Sharding", "CI/CD Pipelines"],
    recommendedProject:
      "Design an auto-sharded key-value store with consistent hashing and dynamic node discovery.",
  },
];

export const CareerCopilotPage: React.FC = () => {
  const { student } = useStudent();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(DREAM_COMPANIES[0].id);
  const [activeTab, setActiveTab] = useState<"gap" | "resume" | "interview">("gap");

  const selectedCompany =
    DREAM_COMPANIES.find((c) => c.id === selectedCompanyId) || DREAM_COMPANIES[0];

  // Resume Bullet Optimizer State
  const [inputBullet, setInputBullet] = useState(
    "Built a project using machine learning to classify student notes and help them study better for tests."
  );
  const [optimizedBullet, setOptimizedBullet] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Mock Interview State
  const [interviewQuestionIndex, setInterviewQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewFeedback, setInterviewFeedback] = useState<string | null>(null);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);

  const mockQuestions = [
    {
      id: "mq-1",
      topic: "Distributed Consensus (IBM Labs)",
      question:
        "Explain how the Raft consensus algorithm handles network partitions where the leader is isolated in a minority partition.",
      keyCriteria: [
        "Mention term incrementation in majority partition",
        "Explain why minority leader cannot commit client writes (cannot achieve quorum)",
        "Describe reconciliation when partition heals (leader with higher term forces rollback)",
      ],
      idealResponse:
        "When the network partitions, the leader isolated in the minority partition cannot reach a quorum of nodes, so it cannot commit any new client log entries. Meanwhile, the majority partition will timeout, elect a new leader with a higher term, and continue processing and committing writes. When the partition heals, the old leader receives heartbeats with the higher term, steps down to follower, and overwrites uncommitted entries with the authoritative majority log.",
    },
    {
      id: "mq-2",
      topic: "System Design & Storage (Google / Amazon)",
      question:
        "Why are B+ Trees preferred over Binary Search Trees for disk-resident database indexing?",
      keyCriteria: [
        "High fan-out reducing tree height",
        "Matching disk block / page size to minimize random I/O",
        "Sequential leaf pointer chaining for O(log N + K) range queries",
      ],
      idealResponse:
        "Disks read and write data in blocks (e.g. 4KB to 16KB). A Binary Search Tree has a fan-out of only 2, resulting in a tall tree that requires O(log2 N) random disk seeks. B+ Trees have a high fan-out (order 100+), keeping tree height to 3-4 levels for millions of rows. Furthermore, all leaf nodes are sequentially linked, enabling blazing-fast range scans without re-traversing internal nodes.",
    },
  ];

  const handleOptimizeBullet = () => {
    if (!inputBullet.trim()) {
      toast.error("Please enter a resume bullet point to rewrite");
      return;
    }
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimizedBullet(
        "Architected an automated multi-tenant study pipeline using IBM Granite 7B and TypeScript, reducing document synthesis latency by 44% and serving 1,400+ active students with 99.2% uptime."
      );
      toast.success("Resume Bullet Optimized!", {
        description: "Applied the Google XYZ impact formula (Accomplished [X] measured by [Y] by doing [Z]).",
      });
    }, 800);
  };

  const handleEvaluateInterview = () => {
    if (!userAnswer.trim()) {
      toast.error("Please enter your answer to receive Bob AI feedback");
      return;
    }
    setIsEvaluatingAnswer(true);
    setTimeout(() => {
      setIsEvaluatingAnswer(false);
      setInterviewFeedback(
        "Strong answer! You accurately highlighted that minority partitions cannot achieve a quorum. To make this an L4/Staff answer, explicitly cite that client requests in the minority will either hang or receive timeouts, and contrast with AP systems like DynamoDB."
      );
      toast.success("Interview Feedback Generated!");
    }, 900);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Campus Career Copilot</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Placement readiness index, dream company skill gap analysis, and ATS resume optimizer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Placement Readiness: 84 / 100</span>
          </span>
        </div>
      </div>

      {/* Overview Cards: Placement Readiness Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            DSA & Algorithms
          </span>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">88%</div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "88%" }} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">320+ LeetCode problems solved</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            System Design
          </span>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">82%</div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "82%" }} />
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Raft, B+ Trees, Sharding</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Cloud & DevOps Gap
          </span>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">72%</div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: "72%" }} />
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            Needs Docker & Kubernetes
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            ATS Resume Score
          </span>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white">91/100</div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: "91%" }} />
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Top 5% candidate profile
          </p>
        </div>
      </div>

      {/* Tab Controller */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 max-w-fit">
        {(
          [
            { id: "gap" as const, label: "Target Company Skill Gap", icon: Target },
            { id: "resume" as const, label: "ATS Resume Bullet Optimizer", icon: FileCheck },
            { id: "interview" as const, label: "Mock Technical Interview", icon: Code2 },
          ]
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-[#161c28] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Target Company Skill Gap Analysis */}
      {activeTab === "gap" && (
        <div className="space-y-6">
          {/* Company Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DREAM_COMPANIES.map((company) => {
              const isSelected = company.id === selectedCompanyId;
              return (
                <button
                  key={company.id}
                  onClick={() => setSelectedCompanyId(company.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-xs"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c28] hover:border-gray-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="w-8 h-8 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-extrabold flex items-center justify-center">
                        {company.logoLetter}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {company.matchScore}% Match
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                      {company.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {company.role}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Drive: {company.driveDate}</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {company.salaryRange}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Company Detail Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>{selectedCompany.name} • Candidate Fit Assessment</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Role: {selectedCompany.role}
                  </p>
                </div>

                <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Target Match: {selectedCompany.matchScore}%
                </span>
              </div>

              {/* Skills Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Acquired Skills */}
                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Skills You Possess ({selectedCompany.acquiredSkills.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCompany.acquiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Gap Skills */}
                <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Skills To Acquire ({selectedCompany.missingSkills.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCompany.missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Plan to Close Gap */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Bob AI Capstone Project Recommendation</span>
                </span>
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                  {selectedCompany.recommendedProject}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() =>
                      toast.success("Study Goal Added", {
                        description: `Saved project roadmap for ${selectedCompany.name} to AI Planner.`,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    <span>Add this project to my Study Planner</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Readiness Tips */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Campus Drive Checklist
                </h3>
                <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>GPA Eligibility (Req: 3.5+, Yours: {student.currentGpa})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>No active backlogs or academic probations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>GitHub portfolio with verified commit history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Docker containerization demo pending</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATS Resume Bullet Optimizer */}
      {activeTab === "resume" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span>Google XYZ Formula Resume Rewriter</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recruiters look for: Accomplished <strong>[X]</strong>, as measured by{" "}
                <strong>[Y]</strong>, by doing <strong>[Z]</strong>. Bob AI turns passive bullets
                into high-impact statements.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Your Draft Resume Bullet
              </label>
              <textarea
                rows={3}
                value={inputBullet}
                onChange={(e) => setInputBullet(e.target.value)}
                placeholder="e.g. Worked on web application with team for student attendance..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleOptimizeBullet}
                disabled={isOptimizing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rewriting with Metrics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Optimize with Bob AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Output comparison card */}
            {optimizedBullet && (
              <div className="p-5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-3 mt-4 animate-in fade-in">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Optimized Impact Bullet (Ready for Resume)</span>
                </span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                  "{optimizedBullet}"
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-blue-100 dark:border-blue-900/40">
                  <span>ATS Match Score: 98%</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(optimizedBullet);
                      toast.success("Copied to clipboard!");
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Copy Bullet Text
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Technical Mock Interview Simulator */}
      {activeTab === "interview" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {mockQuestions[interviewQuestionIndex].topic}
                </span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  Question {interviewQuestionIndex + 1} of {mockQuestions.length}
                </h2>
              </div>

              <button
                onClick={() => {
                  setInterviewQuestionIndex((prev) => (prev + 1) % mockQuestions.length);
                  setUserAnswer("");
                  setInterviewFeedback(null);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Switch Question →
              </button>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                "{mockQuestions[interviewQuestionIndex].question}"
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Your Answer (Explain as you would to an interviewer)
              </label>
              <textarea
                rows={4}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your explanation here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setUserAnswer(mockQuestions[interviewQuestionIndex].idealResponse);
                }}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
              >
                Load Sample Answer
              </button>

              <button
                type="button"
                onClick={handleEvaluateInterview}
                disabled={isEvaluatingAnswer || !userAnswer.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isEvaluatingAnswer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Response...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluate My Answer</span>
                  </>
                )}
              </button>
            </div>

            {interviewFeedback && (
              <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-3 mt-4 animate-in fade-in">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Bob AI Interviewer Evaluation</span>
                </span>
                <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                  {interviewFeedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
