import React, { useState } from "react";
import {
  FileText,
  UploadCloud,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  ChevronRight,
  Layers,
  Send,
  Download,
  Flame,
  Check,
  X,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { sendChatMessage, parseAiJson } from "../services/chatService";

interface NoteTopic {
  id: string;
  courseCode: string;
  courseName: string;
  unit: string;
  title: string;
  date: string;
  readTime: string;
  summary: {
    tldr: string;
    keyPoints: string[];
    formulas: string[];
    examWatchout: string;
  };
  flashcards: {
    id: string;
    question: string;
    answer: string;
    category: string;
  }[];
  quiz: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const PRESET_TOPICS: NoteTopic[] = [
  {
    id: "cs501-raft",
    courseCode: "CS501",
    courseName: "Distributed Systems",
    unit: "Unit 4 • Consensus Protocols",
    title: "Raft Consensus Algorithm & Leader Election",
    date: "Sep 12, 2026",
    readTime: "7 min read",
    summary: {
      tldr: "Raft decomposes distributed consensus into three independent subproblems: Leader Election, Log Replication, and Safety. Nodes always exist in one of three states: Leader, Follower, or Candidate.",
      keyPoints: [
        "Nodes start as Followers; if they do not hear heartbeats within an election timeout (150-300ms randomized), they become Candidates.",
        "A Candidate increments the current term, votes for itself, and broadcasts RequestVote RPCs to all peers.",
        "Consensus requires a majority quorum (N/2 + 1) votes. Split votes are resolved via randomized election timeouts.",
        "The Leader sends empty AppendEntries RPCs as periodic heartbeats to maintain authority.",
        "Log Matching Property: If two logs contain an entry with the same index and term, then the logs are identical in all preceding entries.",
      ],
      formulas: [
        "Quorum Majority: Q = ⌊N / 2⌋ + 1",
        "T_election ~ Uniform(150ms, 300ms) with T_heartbeat << T_election",
      ],
      examWatchout:
        "Frequent mid-term question: Why is election timeout randomized? Answer: To prevent split votes where two candidates start elections simultaneously and split the votes 50-50 repeatedly.",
    },
    flashcards: [
      {
        id: "fc-1",
        question: "What are the three possible states of a Raft server node?",
        answer: "Follower, Candidate, and Leader. All servers begin as Followers.",
        category: "State Machine",
      },
      {
        id: "fc-2",
        question: "How does Raft prevent split votes from deadlocking election rounds?",
        answer:
          "By using randomized election timeouts (e.g., 150ms to 300ms), ensuring one node usually times out before others and collects a quorum.",
        category: "Leader Election",
      },
      {
        id: "fc-3",
        question: "What constitutes a valid quorum in a 5-node cluster?",
        answer: "At least 3 nodes (⌊5/2⌋ + 1 = 3) must acknowledge an entry before commit.",
        category: "Quorum",
      },
      {
        id: "fc-4",
        question: "Which RPC does the Leader use to send heartbeats?",
        answer: "AppendEntries RPC with empty entries array (entries: []).",
        category: "RPC Messaging",
      },
      {
        id: "fc-5",
        question: "What is the Leader Completeness property?",
        answer:
          "If a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher-numbered terms.",
        category: "Safety Guarantee",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "In a 7-node distributed Raft cluster, how many nodes must vote to elect a Leader?",
        options: ["3 nodes", "4 nodes", "5 nodes", "7 nodes"],
        correctIndex: 1,
        explanation: "Quorum formula is ⌊N/2⌋ + 1 = ⌊7/2⌋ + 1 = 3 + 1 = 4 nodes.",
      },
      {
        id: "q-2",
        question: "What triggers a Follower to transition into the Candidate state?",
        options: [
          "Receiving an AppendEntries RPC with a lower term",
          "Expiration of its randomized election timeout without heartbeats",
          "A client request failure",
          "CPU utilization exceeding 85%",
        ],
        correctIndex: 1,
        explanation:
          "If a follower receives no communication over a period called the election timeout, it assumes there is no viable leader and begins an election.",
      },
      {
        id: "q-3",
        question: "Which of the following describes the purpose of the Log Matching Property?",
        options: [
          "Compress logs using gzip before network transmission",
          "Ensure that logs never exceed 1GB in size",
          "Guarantee that identical index and term entries have identical prefixes",
          "Ensure all nodes commit at the exact same millisecond timestamp",
        ],
        correctIndex: 2,
        explanation:
          "Log Matching ensures consistency: if entries across two logs share the same term and index, all previous entries are strictly identical.",
      },
    ],
  },
  {
    id: "cs502-bplus",
    courseCode: "CS502L",
    courseName: "Database Systems Lab",
    unit: "Unit 3 • Indexing & Physical Storage",
    title: "B+ Tree Indexing vs LSM Trees",
    date: "Sep 10, 2026",
    readTime: "6 min read",
    summary: {
      tldr: "B+ Trees store all real data records in leaf nodes connected by a linked list, optimizing range queries and disk block transfers. LSM Trees buffer writes in memory and flush sequentially to SSTables, optimizing write throughput.",
      keyPoints: [
        "Internal nodes store only keys and pointers to guide searches; leaf nodes contain either record pointers or clustered row data.",
        "All leaf nodes are linked sequentially at the bottom level, making SQL range queries (WHERE age BETWEEN 20 AND 30) O(log N + K).",
        "B+ Trees have high fan-out (order M), keeping tree height low (typically 3 to 4 levels for millions of records).",
        "LSM Trees (Log-Structured Merge-Trees) trade off read latency for ultra-high write speeds using MemTable + WAL + Compaction.",
      ],
      formulas: [
        "Max keys per node: M - 1, Min keys: ⌈M / 2⌉ - 1",
        "Search complexity: O(log_M N)",
      ],
      examWatchout:
        "Contrast B-Trees vs B+ Trees: In standard B-Trees, data pointers reside in both internal and leaf nodes. In B+ Trees, data pointers ONLY reside in leaf nodes, maximizing internal node fan-out.",
    },
    flashcards: [
      {
        id: "fc-21",
        question: "Why do B+ trees have a higher fan-out than traditional B-trees?",
        answer:
          "Because internal nodes only store routing keys and child pointers, not actual records or payloads, fitting more keys per disk page.",
        category: "Storage Design",
      },
      {
        id: "fc-22",
        question: "What enables efficient range scans in a B+ tree?",
        answer:
          "A doubly or singly linked list connecting all leaf nodes sequentially at the base level.",
        category: "Range Queries",
      },
      {
        id: "fc-23",
        question: "What is the worst-case time complexity of searching a key in a B+ tree?",
        answer: "O(h) where h is the tree height, equivalent to O(log_M N) disk page accesses.",
        category: "Complexity",
      },
    ],
    quiz: [
      {
        id: "q-21",
        question: "Where are data records or record pointers stored in a B+ tree?",
        options: [
          "Evenly distributed across all node levels",
          "Exclusively in leaf nodes",
          "Only in the root node",
          "In separate heap files outside the tree hierarchy",
        ],
        correctIndex: 1,
        explanation:
          "In a B+ Tree, internal nodes act strictly as an index guide. All actual records or tuple pointers exist solely in the leaf nodes.",
      },
      {
        id: "q-22",
        question: "What storage structure is optimal for heavy write workloads with append-only semantics?",
        options: ["B+ Tree", "LSM Tree (SSTables)", "Static Hash Table", "Binary Search Tree"],
        correctIndex: 1,
        explanation:
          "LSM Trees (Log-Structured Merge-Trees) buffer writes sequentially to memory and flush in batches, offering superior write throughput.",
      },
    ],
  },
  {
    id: "cs505-sched",
    courseCode: "CS505",
    courseName: "Operating Systems",
    unit: "Unit 2 • Process & CPU Scheduling",
    title: "Kernel CPU Scheduling Algorithms & Multi-level Feedback",
    date: "Sep 08, 2026",
    readTime: "8 min read",
    summary: {
      tldr: "CPU scheduling selects processes from the ready queue for CPU allocation. Modern OS kernels (like Linux CFS) balance turnaround time, fairness, and interactive responsiveness using Multilevel Feedback Queues (MLFQ) and Red-Black Trees.",
      keyPoints: [
        "Round Robin (RR) with a time quantum 'q': Too large behaves like FCFS; too small incurs excessive context switch overhead.",
        "Shortest Job First (SJF) is provably optimal for minimizing average waiting time, but requires predicting burst length using exponential smoothing.",
        "MLFQ dynamically adjusts priority: I/O bound interactive jobs stay in high-priority short-quantum queues; CPU-bound jobs drop to lower queues.",
        "Linux Completely Fair Scheduler (CFS) tracks 'vruntime' and uses a red-black tree to pick the process with the smallest runtime.",
      ],
      formulas: [
        "Exponential smoothing: τ_(n+1) = α * t_n + (1 - α) * τ_n",
        "Turnaround Time = Completion Time - Arrival Time",
        "Waiting Time = Turnaround Time - Burst Time",
      ],
      examWatchout:
        "Remember Convoy Effect: Occurs in FCFS when multiple I/O-bound processes wait behind a single CPU-heavy process, drastically dropping CPU & device utilization.",
    },
    flashcards: [
      {
        id: "fc-31",
        question: "What is the Convoy Effect?",
        answer:
          "A phenomenon in FCFS scheduling where small I/O-bound processes are blocked behind one large CPU-intensive process, lowering throughput.",
        category: "Scheduling Defects",
      },
      {
        id: "fc-32",
        question: "What data structure does the Linux CFS scheduler use to find the next runnable process?",
        answer: "A self-balancing Red-Black Tree keyed by virtual runtime (vruntime).",
        category: "Kernel Architecture",
      },
    ],
    quiz: [
      {
        id: "q-31",
        question: "Which scheduling algorithm is provably optimal for minimizing average waiting time?",
        options: [
          "First-Come, First-Served (FCFS)",
          "Shortest Job First (SJF)",
          "Round Robin (RR)",
          "Priority Scheduling without aging",
        ],
        correctIndex: 1,
        explanation:
          "Shortest Job First (SJF) produces the minimum average waiting time for a given set of processes.",
      },
    ],
  },
];

export const NotesAssistantPage: React.FC = () => {
  const [topicsList, setTopicsList] = useState<NoteTopic[]>(PRESET_TOPICS);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(PRESET_TOPICS[0].id);
  const [activeTab, setActiveTab] = useState<"summary" | "flashcards" | "quiz" | "upload">("summary");

  const currentTopic = topicsList.find((t) => t.id === selectedTopicId) || topicsList[0];

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  // Ask AI inline question
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswers, setAiAnswers] = useState<{ query: string; response: string }[]>([]);
  const [isAiAnswering, setIsAiAnswering] = useState(false);

  // Upload custom notes state
  const [customText, setCustomText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCardMastered = (cardId: string, known: boolean) => {
    setMasteredCards((prev) => ({ ...prev, [cardId]: known }));
    setIsFlipped(false);
    if (currentCardIndex < currentTopic.flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      toast.success("Deck Round Completed!", {
        description: `You've reviewed all ${currentTopic.flashcards.length} cards.`,
      });
    }
  };

  const handleQuizSubmit = () => {
    setIsQuizSubmitted(true);
    let correctCount = 0;
    currentTopic.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) correctCount++;
    });
    toast.success("Quiz Evaluated!", {
      description: `You scored ${correctCount} of ${currentTopic.quiz.length} correct.`,
    });
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
  };

  const handleAskBobAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiAnswering(true);
    const q = aiQuery.trim();
    setAiQuery("");

    try {
      const response = await sendChatMessage([
        {
          role: "user",
          content: `You are Bob AI, an expert academic tutor for course "${currentTopic.courseCode}: ${currentTopic.courseName}". Topic: "${currentTopic.title}". Summary context: "${currentTopic.summary.tldr}". Answer the following student question concisely and clearly: "${q}"`,
        },
      ]);
      const aiReply = response.reply.content;
      setAiAnswers((prev) => [{ query: q, response: aiReply }, ...prev]);
    } catch (err) {
      console.error("AI Error:", err);
      toast.error("Failed to fetch response from Gemini AI");
    } finally {
      setIsAiAnswering(false);
    }
  };

  const handleProcessCustomNotes = async () => {
    if (!customText.trim()) {
      toast.error("Please paste lecture notes or an outline to synthesize");
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze and synthesize the following lecture notes text:
"""
${customText}
"""

Please respond ONLY with a valid JSON object matching this structure (no markdown formatting, no code block backticks):
{
  "title": "A concise title",
  "courseCode": "NOTE",
  "courseName": "Custom Subject",
  "unit": "Unit 1 • AI Synthesis",
  "readTime": "5 min read",
  "summary": {
    "tldr": "2-3 sentence executive summary",
    "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
    "formulas": ["Equation or key rule 1", "Equation or key rule 2"],
    "examWatchout": "Common exam trap or mistake to watch out for"
  },
  "flashcards": [
    {"id": "fc-1", "question": "Question 1?", "answer": "Answer 1", "category": "Concept"},
    {"id": "fc-2", "question": "Question 2?", "answer": "Answer 2", "category": "Details"},
    {"id": "fc-3", "question": "Question 3?", "answer": "Answer 3", "category": "Application"}
  ],
  "quiz": [
    {
      "id": "q-1",
      "question": "Practice Quiz Question 1?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why Option A is correct."
    },
    {
      "id": "q-2",
      "question": "Practice Quiz Question 2?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Why Option B is correct."
    }
  ]
}`;

      const response = await sendChatMessage(
        [{ role: "user", content: prompt }],
        { maxTokens: 3000 }
      );
      let parsed = parseAiJson<any>(response.reply.content);

      // Fallback if LLM output couldn't be parsed strictly as JSON
      if (!parsed) {
        const rawContent = response.reply.content;
        const cleanContent = rawContent
          .replace(/[\{\}\[\]"]/g, "")
          .replace(/"?\w+"?:\s*/g, "")
          .replace(/\s+/g, " ")
          .trim();

        const lines = rawContent.split("\n").map((l) => l.trim()).filter(Boolean);
        const keyPoints = lines
          .filter((l) => l.startsWith("- ") || l.startsWith("* ") || /^\d+\./.test(l))
          .map((l) => l.replace(/^[-*\d.]+\s*/, "").replace(/[",]/g, ""))
          .slice(0, 4);

        const extractedTitle = customText.slice(0, 40).replace(/[\r\n]+/g, " ").trim() || "Synthesized Notes";

        parsed = {
          title: extractedTitle,
          courseCode: "NOTE",
          courseName: "Custom Notes",
          unit: "Unit 1 • AI Synthesis",
          readTime: "5 min read",
          summary: {
            tldr: cleanContent.slice(0, 250),
            keyPoints: keyPoints.length > 0 ? keyPoints : ["Key lecture takeaway 1", "Key lecture takeaway 2"],
            formulas: [],
            examWatchout: "Review core definitions and main takeaways carefully.",
          },
          flashcards: [
            {
              id: "fc-fallback-1",
              question: `What is the primary concept of ${extractedTitle}?`,
              answer: cleanContent.slice(0, 180),
              category: "Summary",
            },
          ],
          quiz: [
            {
              id: "q-fallback-1",
              question: "Which concept is emphasized in the uploaded text?",
              options: [keyPoints[0] || "Main concept", "Alternative concept A", "Alternative concept B", "None of the above"],
              correctIndex: 0,
              explanation: "Derived directly from your uploaded lecture text.",
            },
          ],
        };
      }

      const newTopic: NoteTopic = {
        id: `custom-${Date.now()}`,
        courseCode: parsed.courseCode || "NOTE101",
        courseName: parsed.courseName || "Synthesized Notes",
        unit: parsed.unit || "Unit 1",
        title: parsed.title || "Custom AI Synthesized Notes",
        date: "Just now",
        readTime: parsed.readTime || "5 min read",
        summary: parsed.summary || {
          tldr: customText.slice(0, 200),
          keyPoints: ["Synthesized using Gemini AI"],
          formulas: [],
          examWatchout: "Review synthesized key points carefully.",
        },
        flashcards: parsed.flashcards && parsed.flashcards.length > 0 ? parsed.flashcards : [
          {
            id: `fc-${Date.now()}`,
            question: "What is the key takeaway of this note?",
            answer: customText.slice(0, 150),
            category: "Core Concept"
          }
        ],
        quiz: parsed.quiz && parsed.quiz.length > 0 ? parsed.quiz : [
          {
            id: `q-${Date.now()}`,
            question: "What is the primary subject of the uploaded material?",
            options: ["Uploaded Topic", "Option B", "Option C", "Option D"],
            correctIndex: 0,
            explanation: "Extracted from uploaded notes."
          }
        ],
      };

      setTopicsList((prev) => [newTopic, ...prev]);
      setSelectedTopicId(newTopic.id);
      setActiveTab("summary");
      setCustomText("");
      toast.success("AI Synthesis Complete!", {
        description: `Generated ${newTopic.flashcards.length} flashcards and ${newTopic.quiz.length} practice questions using Gemini AI.`,
      });
    } catch (err) {
      console.error("Note synthesis error:", err);
      toast.error("An error occurred during synthesis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>AI Notes & Flashcard Companion</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Transform syllabus lecture notes into instant summaries, Leitner flashcard decks, and quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import / Paste Notes</span>
          </button>
        </div>
      </div>

      {/* Topic Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {topicsList.map((topic) => {
          const isSelected = topic.id === selectedTopicId;
          return (
            <button
              key={topic.id}
              onClick={() => {
                setSelectedTopicId(topic.id);
                setCurrentCardIndex(0);
                setIsFlipped(false);
                setSelectedAnswers({});
                setIsQuizSubmitted(false);
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-xs"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c28] hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    {topic.courseCode}
                  </span>
                  <span className="text-[11px] text-gray-400">{topic.readTime}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                  {topic.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {topic.unit}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">{topic.date}</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                  {topic.flashcards.length} Cards • Quiz
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Tab Controller */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 max-w-fit">
        {(
          [
            { id: "summary" as const, label: "AI Summary & Insights", icon: BookOpen },
            { id: "flashcards" as const, label: `Flashcards (${currentTopic.flashcards.length})`, icon: Layers },
            { id: "quiz" as const, label: `Quiz (${currentTopic.quiz.length} Qs)`, icon: HelpCircle },
            { id: "upload" as const, label: "Upload Custom Notes", icon: UploadCloud },
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

      {/* TAB 1: AI Summary View */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Executive TLDR */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-blue-200 dark:border-blue-900/40 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Executive AI Synthesis</span>
              </span>
              <span className="text-xs text-gray-400">{currentTopic.courseName}</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
              {currentTopic.summary.tldr}
            </p>
          </div>

          {/* Key Takeaways & Exam Watchout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>High-Yield Conceptual Takeaways</span>
              </h3>

              <ul className="space-y-3">
                {currentTopic.summary.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-800">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>

              {currentTopic.summary.formulas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Essential Equations & Rules
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentTopic.summary.formulas.map((formula, idx) => (
                      <code
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-mono text-blue-700 dark:text-blue-300 font-medium"
                      >
                        {formula}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Exam Watchout Box */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                  <Flame className="w-5 h-5" />
                  <h3 className="text-sm font-bold">Exam Trap & Watchout</h3>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200/90 leading-relaxed">
                  {currentTopic.summary.examWatchout}
                </p>
              </div>

              {/* Quick Prompt on this Note */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Ask Bob AI about this topic</span>
                </h4>
                <form onSubmit={handleAskBobAI} className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="e.g. Why not use 2-phase commit?"
                      className="w-full px-3.5 py-2 pr-9 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isAiAnswering || !aiQuery.trim()}
                      className="absolute right-2 top-2 p-1 rounded-lg text-blue-600 hover:text-blue-700 disabled:opacity-40 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {/* Answers feed */}
                {aiAnswers.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                    {aiAnswers.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs space-y-1">
                        <span className="font-semibold text-gray-900 dark:text-white block">
                          Q: {item.query}
                        </span>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          {item.response}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Interactive Flashcards */}
      {activeTab === "flashcards" && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Card {currentCardIndex + 1} of {currentTopic.flashcards.length}
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {Object.values(masteredCards).filter(Boolean).length} Mastered
            </span>
          </div>

          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{
                width: `${((currentCardIndex + 1) / currentTopic.flashcards.length) * 100}%`,
              }}
            />
          </div>

          {/* Flashcard Component */}
          {(() => {
            const card = currentTopic.flashcards[currentCardIndex];
            const isKnown = masteredCards[card.id];

            return (
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative min-h-64 p-8 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none shadow-sm ${
                  isFlipped
                    ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700"
                    : "bg-white dark:bg-[#161c28] border-gray-200 dark:border-gray-800 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {card.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isFlipped ? "Showing Answer (Click to flip)" : "Click to Reveal"}</span>
                  </span>
                </div>

                <div className="my-6 text-center">
                  {!isFlipped ? (
                    <div>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-2">
                        Question
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug">
                        {card.question}
                      </h2>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                        Answer & Key Insight
                      </span>
                      <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                        {card.answer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{currentTopic.title}</span>
                  {isKnown && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Marked Mastered
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Card Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                if (currentCardIndex > 0) {
                  setCurrentCardIndex(currentCardIndex - 1);
                  setIsFlipped(false);
                }
              }}
              disabled={currentCardIndex === 0}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
            >
              Previous Card
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardMastered(currentTopic.flashcards[currentCardIndex].id, false);
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Review Again
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardMastered(currentTopic.flashcards[currentCardIndex].id, true);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Mastered ✓
              </button>
            </div>

            <button
              onClick={() => {
                if (currentCardIndex < currentTopic.flashcards.length - 1) {
                  setCurrentCardIndex(currentCardIndex + 1);
                  setIsFlipped(false);
                }
              }}
              disabled={currentCardIndex === currentTopic.flashcards.length - 1}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 disabled:opacity-40 cursor-pointer"
            >
              Next Card
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Practice Quiz */}
      {activeTab === "quiz" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Concept Mastery Check: {currentTopic.title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Answer the {currentTopic.quiz.length} practice problems generated from this unit's notes.
              </p>
            </div>
            {isQuizSubmitted && (
              <button
                onClick={handleResetQuiz}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-blue-600 dark:text-blue-400 cursor-pointer"
              >
                Retake Quiz
              </button>
            )}
          </div>

          <div className="space-y-4">
            {currentTopic.quiz.map((q, qIndex) => {
              const selectedIdx = selectedAnswers[q.id];
              const hasAnswered = selectedIdx !== undefined;
              const isCorrect = selectedIdx === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                      <span className="text-blue-600 dark:text-blue-400 mr-2">Q{qIndex + 1}.</span>
                      {q.question}
                    </h3>
                    {isQuizSubmitted && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                          isCorrect
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedIdx === optIdx;
                      let optionStyle = "border-gray-200 dark:border-gray-700 hover:border-gray-300";

                      if (isQuizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          optionStyle =
                            "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold";
                        } else if (isOptionSelected && !isCorrect) {
                          optionStyle =
                            "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200";
                        }
                      } else if (isOptionSelected) {
                        optionStyle =
                          "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold";
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isQuizSubmitted}
                          onClick={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center gap-3 cursor-pointer ${optionStyle}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[11px] font-bold shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isQuizSubmitted && (
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border border-gray-200 dark:border-gray-700/60">
                      <strong className="text-gray-900 dark:text-white block mb-1">
                        Rationale & Explanation:
                      </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isQuizSubmitted && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleQuizSubmit}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                Evaluate Answers
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Upload Custom Notes */}
      {activeTab === "upload" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <span>Import & Parse Custom Notes</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Paste professor slides, lecture transcripts, or textbook chapters. Bob AI synthesizes structured notes, flashcards, and quizzes.
            </p>

            {/* Drag & Drop zone */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-800/20">
              <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Click to browse or drag & drop lecture PDFs / DOCX
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Supports files up to 25MB</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Or Paste Lecture Transcript / Raw Notes
              </label>
              <textarea
                rows={6}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste notes here (e.g. Memory Hierarchy, Cache Misses L1/L2, Amdahl's Law)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              disabled={isAnalyzing || !customText.trim()}
              onClick={handleProcessCustomNotes}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Flashcards & Quizzes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize with IBM Granite AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
