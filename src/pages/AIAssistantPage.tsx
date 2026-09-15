import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Plus,
  Paperclip,
  Mic,
  Copy,
  Check,
  ChevronRight,
  Calendar,
  BookOpen,
  ShieldCheck,
  Lightbulb,
  Trash2,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useStudent } from "../context/StudentContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  sendChatMessage,
  fetchAiStatus,
  streamText,
  type AiStatusResponse,
} from "../services/chatService";
import { toast } from "sonner";
import { APP_CONFIG } from "../lib/constants";

// ─── Local types ──────────────────────────────────────────────────────────────

interface Message {
  id: string;
  sender: "user" | "assistant";
  /** Full resolved text (may still be partially displayed during streaming). */
  text: string;
  /** Displayed text — grows during the streaming animation. */
  displayText: string;
  timestamp: string;
  isStreaming?: boolean;
  actionButtons?: { label: string; path: string; icon?: React.ElementType }[];
  confidenceScore?: number;
  sources?: string[];
  isError?: boolean;
}

interface ConversationSession {
  id: string;
  title: string;
  preview: string;
  time: string;
  messages: Message[];
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

/**
 * Minimal markdown → React renderer that handles the patterns used by Granite:
 *  - `**bold**`, `*italic*`
 *  - `## Heading`, `### Sub-heading`
 *  - `` `inline code` ``, ``` ```code blocks``` ```
 *  - `- list items`, `1. numbered items`
 *  - `> blockquote`
 *  - Bare URLs turned into links
 *
 * Rendered entirely without external deps so bundle stays small.
 */
function MarkdownContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const inlineRender = (raw: string, key: string | number): React.ReactNode => {
    // Code block is handled at line level; here handle inline only
    const parts = raw.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <span key={key}>
        {parts.map((part, idx) => {
          if (part.startsWith("`") && part.endsWith("`"))
            return (
              <code
                key={idx}
                className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs font-mono text-blue-700 dark:text-blue-300"
              >
                {part.slice(1, -1)}
              </code>
            );
          if (part.startsWith("**") && part.endsWith("**"))
            return <strong key={idx} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
          if (part.startsWith("*") && part.endsWith("*"))
            return <em key={idx}>{part.slice(1, -1)}</em>;
          return part;
        })}
      </span>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code block ````lang ... ``` ─────────────────────────────────
    if (line.trimStart().startsWith("```")) {
      const lang = line.replace(/```/, "").trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <CodeBlock key={`cb-${i}`} lang={lang} code={codeLines.join("\n")} />
      );
      i++;
      continue;
    }

    // ── Headings ────────────────────────────────────────────────────────────
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-gray-900 dark:text-white mt-3 mb-1">
          {inlineRender(line.slice(4), i)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-gray-900 dark:text-white mt-4 mb-1.5 border-b border-gray-200 dark:border-gray-700 pb-1">
          {inlineRender(line.slice(3), i)}
        </h2>
      );
      i++;
      continue;
    }

    // ── Blockquote ──────────────────────────────────────────────────────────
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-blue-500 pl-3 my-2 text-gray-600 dark:text-gray-300 text-xs italic"
        >
          {inlineRender(line.slice(2), i)}
        </blockquote>
      );
      i++;
      continue;
    }

    // ── Horizontal rule ─────────────────────────────────────────────────────
    if (line.trim() === "---" || line.trim() === "***") {
      elements.push(<hr key={i} className="my-3 border-gray-200 dark:border-gray-700" />);
      i++;
      continue;
    }

    // ── Unordered list ──────────────────────────────────────────────────────
    if (/^[-*+] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+] /, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-none space-y-1 my-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>{inlineRender(item, idx)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Ordered list ─────────────────────────────────────────────────────────
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      let num = 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
        num++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1 my-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="shrink-0 w-5 text-right font-semibold text-blue-600 dark:text-blue-400 text-xs mt-0.5">
                {idx + 1}.
              </span>
              <span>{inlineRender(item, idx)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Table (GitHub-flavoured) ─────────────────────────────────────────────
    if (line.includes("|") && lines[i + 1]?.includes("---")) {
      const headers = line.split("|").filter((c) => c.trim());
      i += 2; // skip separator row
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").filter((c) => c.trim()));
        i++;
      }
      elements.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-3 rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-gray-700 dark:text-gray-300">
                      {inlineRender(cell.trim(), ci)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ── Empty line ──────────────────────────────────────────────────────────
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
      i++;
      continue;
    }

    // ── Plain paragraph ─────────────────────────────────────────────────────
    elements.push(
      <p key={i} className="text-sm leading-relaxed">
        {inlineRender(line, i)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

// ─── Code block component ─────────────────────────────────────────────────────

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code area */}
      <pre className="p-4 bg-gray-950 dark:bg-gray-900 overflow-x-auto text-xs leading-relaxed text-emerald-300 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Typing dots indicator ────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-center">
      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
        <Bot className="w-4 h-4" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-gray-100 dark:bg-gray-800 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.15s]" />
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.3s]" />
        <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          IBM Granite reasoning…
        </span>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function MessageSkeleton() {
  return (
    <div className="flex gap-3 items-start animate-pulse">
      <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0 mt-1" />
      <div className="space-y-2 flex-1 max-w-md">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  );
}

// ─── Timestamp helper ─────────────────────────────────────────────────────────

function nowTimestamp(): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date());
}

// ─── Initial welcome message ──────────────────────────────────────────────────

function makeWelcomeMessage(): Message {
  return {
    id: "msg-welcome",
    sender: "assistant",
    text: `Hello! I am your **CampusPilot AI Assistant**, powered by **IBM Granite 3.0** and connected to your campus knowledge graph.

Here is your snapshot for today:
- 📅 **4 Classes scheduled** — starting with *Operating Systems* at 9:00 AM (Ongoing)
- ⚠️ **Attendance Alert**: Database Systems Lab is at **73.7%** (below 75% cutoff)
- 📝 **Critical Deadline**: TCP/IP Simulation due today at **04:00 PM**
- 🚀 **Hackathon**: IBM Granite AI Hackathon pitch deadline in 10 days

How can I assist your studies today?`,
    displayText: `Hello! I am your **CampusPilot AI Assistant**, powered by **IBM Granite 3.0** and connected to your campus knowledge graph.

Here is your snapshot for today:
- 📅 **4 Classes scheduled** — starting with *Operating Systems* at 9:00 AM (Ongoing)
- ⚠️ **Attendance Alert**: Database Systems Lab is at **73.7%** (below 75% cutoff)
- 📝 **Critical Deadline**: TCP/IP Simulation due today at **04:00 PM**
- 🚀 **Hackathon**: IBM Granite AI Hackathon pitch deadline in 10 days

How can I assist your studies today?`,
    timestamp: nowTimestamp(),
    confidenceScore: 98,
    sources: [`${APP_CONFIG.universityName} ERP Biometrics`, "CS Dept Fall 2024 Timetable", "Canvas LMS API"],
    actionButtons: [
      { label: "View Timetable", path: "/timetable", icon: Calendar },
      { label: "Check Attendance", path: "/attendance", icon: BookOpen },
    ],
  };
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const AIAssistantPage: React.FC = () => {
  const { student } = useStudent();
  const { user } = useAuth();

  // Use authenticated user data, fallback to student context for academic data.
  // Only null-safe "Unknown" fallbacks are used — never a hardcoded identity.
  const displayName = user?.name || student?.name || "Unknown";
  const displayAvatar = user?.avatarUrl || student?.avatarUrl || "";

  // AI status (online / mock / offline)
  const [aiStatus, setAiStatus] = useState<AiStatusResponse | null>(null);

  // Conversation sessions
  const [sessions, setSessions] = useState<ConversationSession[]>([
    {
      id: "sess-1",
      title: "Today's Academic Morning Brief",
      preview: "Schedule overview and attendance alert for CS502L…",
      time: "Today",
      messages: [makeWelcomeMessage()],
    },
    {
      id: "sess-2",
      title: "OS Midterm & Semaphore Revision",
      preview: "Dining philosophers problem and deadlock prevention…",
      time: "Yesterday",
      messages: [],
    },
    {
      id: "sess-3",
      title: "IBM Granite Hackathon Prep",
      preview: "System architecture and containerisation guidance…",
      time: "Sep 12",
      messages: [],
    },
    {
      id: "sess-4",
      title: "Resume & Placement Review",
      preview: "Cloud AI skill alignment with IBM Early Careers…",
      time: "Sep 10",
      messages: [],
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState("sess-1");
  const activeSession = sessions.find((s) => s.id === activeSessionId)!;
  const messages = activeSession?.messages ?? [];

  const [inputText, setInputText] = useState("");
  const [isBusy, setIsBusy] = useState(false); // true while waiting for API or streaming
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamAbortRef = useRef<boolean>(false); // flag to cancel ongoing stream

  const suggestedPrompts = [
    "What classes do I have today?",
    "Show my attendance report",
    "What assignments are due soon?",
    "Summarize today's notices",
    "Help me plan my study session",
  ];

  // ── Scroll to bottom ─────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Fetch AI status on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetchAiStatus()
      .then(setAiStatus)
      .catch(() => {
        setAiStatus({
          enabled: false,
          model_id: "mock/granite-3-8b-instruct",
          status: "mock",
          message: "Running in mock mode",
        });
      });
  }, []);

  // ── Helpers to mutate messages inside the active session ──────────────────
  const setMessages = useCallback(
    (updater: (prev: Message[]) => Message[]) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: updater(s.messages) }
            : s
        )
      );
    },
    [activeSessionId]
  );

  const updateSessionPreview = useCallback(
    (sessionId: string, title: string, preview: string) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, title, preview } : s
        )
      );
    },
    []
  );

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const query = (textToSend ?? inputText).trim();
      if (!query || isBusy) return;

      setInputText("");
      setIsBusy(true);
      streamAbortRef.current = false;

      // Add user message immediately
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: query,
        displayText: query,
        timestamp: nowTimestamp(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Build context from all prior messages in this session (excluding
      // the user message we just added so we don't duplicate)
      const priorMessages = messages.map<{ role: "user" | "assistant"; content: string }>(
        (m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })
      );
      const fullHistory = [...priorMessages, { role: "user" as const, content: query }];

      // Add a streaming placeholder
      const assistantId = `assistant-${Date.now()}`;
      const streamingPlaceholder: Message = {
        id: assistantId,
        sender: "assistant",
        text: "",
        displayText: "",
        timestamp: nowTimestamp(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, streamingPlaceholder]);

      try {
        const response = await sendChatMessage(fullHistory);
        const fullText = response.reply.content;

        // Update session title/preview from first non-welcome exchange
        if (messages.length <= 1) {
          const preview = query.length > 60 ? query.slice(0, 57) + "…" : query;
          updateSessionPreview(activeSessionId, query.slice(0, 45), preview);
        }

        // Stream the text character by character
        for await (const partialText of streamText(fullText, 10)) {
          if (streamAbortRef.current) break;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, displayText: partialText, text: fullText }
                : m
            )
          );
        }

        // Finalise with full metadata
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  text: fullText,
                  displayText: fullText,
                  isStreaming: false,
                  confidenceScore: 96,
                  sources: ["Campus ERP", "Canvas LMS", `${response.model_id}`],
                }
              : m
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "AI request failed";
        toast.error("AI Assistant Error", { description: msg });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  text: `**Error:** ${msg}\n\nPlease try again or check your connection.`,
                  displayText: `**Error:** ${msg}\n\nPlease try again or check your connection.`,
                  isStreaming: false,
                  isError: true,
                }
              : m
          )
        );
      } finally {
        setIsBusy(false);
        inputRef.current?.focus();
      }
    },
    [inputText, isBusy, messages, activeSessionId, setMessages, updateSessionPreview]
  );

  // ── Regenerate last response ──────────────────────────────────────────────
  const handleRegenerate = useCallback(() => {
    // Find the last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user");
    if (!lastUserMsg || isBusy) return;

    // Remove the last assistant message
    setMessages((prev) => {
      const lastAssistantIdx = [...prev].reverse().findIndex((m) => m.sender === "assistant");
      if (lastAssistantIdx === -1) return prev;
      const realIdx = prev.length - 1 - lastAssistantIdx;
      return prev.filter((_, i) => i !== realIdx);
    });

    handleSendMessage(lastUserMsg.text);
  }, [messages, isBusy, setMessages, handleSendMessage]);

  // ── Copy message text ─────────────────────────────────────────────────────
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── New chat ──────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    streamAbortRef.current = true; // cancel any ongoing stream
    const newId = `sess-${Date.now()}`;
    setSessions((prev) => [
      {
        id: newId,
        title: "New Conversation",
        preview: "Ask anything about campus life…",
        time: "Just now",
        messages: [makeWelcomeMessage()],
      },
      ...prev,
    ]);
    setActiveSessionId(newId);
    setInputText("");
    setIsBusy(false);
  };

  // ── Clear current chat ────────────────────────────────────────────────────
  const handleClearChat = () => {
    streamAbortRef.current = true;
    setMessages(() => [makeWelcomeMessage()]);
    setIsBusy(false);
  };

  // ── Switch session ────────────────────────────────────────────────────────
  const handleSelectSession = (id: string) => {
    streamAbortRef.current = true;
    setActiveSessionId(id);
    setIsBusy(false);
    setInputText("");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-6.5rem)] max-w-7xl mx-auto rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161c28] shadow-sm">
      {/* ── Left sidebar ────────────────────────────────────────────────── */}
      <aside
        id="ai-chat-history-sidebar"
        className="hidden md:flex flex-col w-64 lg:w-72 border-r border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#131822] shrink-0"
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                AI Sessions
              </h2>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                IBM Granite 3.0
              </span>
            </div>
          </div>

          <button
            id="new-chat-button"
            onClick={handleNewChat}
            className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-2xs cursor-pointer"
            title="Start New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Recent Conversations
          </div>

          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <button
                key={sess.id}
                onClick={() => handleSelectSession(sess.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1 border cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-[#1a2232] border-blue-500/50 shadow-xs"
                    : "border-transparent hover:bg-white/60 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold truncate ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {sess.title}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0 ml-1">{sess.time}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {sess.preview}
                </p>
              </button>
            );
          })}
        </div>

        {/* Model spec footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/40 text-[11px] text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              {aiStatus?.model_id ?? "Granite 3.0 8B"}
            </span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                aiStatus?.status === "online"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {aiStatus?.status === "online" ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>Live</span>
                </>
              ) : aiStatus?.status === "offline" ? (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Mock</span>
                </>
              )}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 truncate">
            Grounding: Campus ERP · LMS · Biometrics
          </p>
        </div>
      </aside>

      {/* ── Main chat area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#161c28]">
        {/* Top chat header */}
        <div className="h-14 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#161c28]/80 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  CampusPilot AI Assistant
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  IBM Watsonx
                </span>
                {/* Live/mock badge */}
                {aiStatus && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                      aiStatus.status === "online"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {aiStatus.status === "online" ? "● Live" : "● Mock"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:block">
                Contextual reasoning on schedule, attendance, and exam preparation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Regenerate last response */}
            {messages.length > 1 && !isBusy && (
              <button
                onClick={handleRegenerate}
                className="p-1.5 text-xs rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="Regenerate last response"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Regenerate</span>
              </button>
            )}

            {/* Clear chat */}
            <button
              onClick={handleClearChat}
              className="p-1.5 text-xs rounded-lg text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Clear</span>
            </button>
          </div>
        </div>

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 sm:p-5 shadow-xs relative group ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-xs"
                      : msg.isError
                      ? "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-tl-xs"
                      : "bg-gray-50 dark:bg-[#1c2433] text-gray-800 dark:text-gray-200 rounded-tl-xs border border-gray-200/80 dark:border-gray-800"
                  }`}
                >
                  {/* Sender + timestamp */}
                  <div className="flex items-center justify-between gap-3 mb-2 text-xs opacity-80">
                    <span className="font-semibold flex items-center gap-1.5">
                      {isUser ? (
                        "You"
                      ) : msg.isError ? (
                        <>
                          <AlertCircle className="w-3 h-3 text-rose-500" />
                          <span className="text-rose-600 dark:text-rose-400">Error</span>
                        </>
                      ) : (
                        "IBM Granite Copilot"
                      )}
                    </span>
                    <span className="text-[11px]">{msg.timestamp}</span>
                  </div>

                  {/* Message body */}
                  <div className={`text-sm leading-relaxed ${isUser ? "text-white" : ""}`}>
                    {isUser ? (
                      <p>{msg.displayText}</p>
                    ) : (
                      <>
                        <MarkdownContent text={msg.displayText} />
                        {msg.isStreaming && (
                          <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom" />
                        )}
                      </>
                    )}
                  </div>

                  {/* Sources grounding */}
                  {!isUser && !msg.isStreaming && msg.sources && (
                    <div className="mt-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          Grounding:
                        </span>
                        {msg.sources.map((src, si) => (
                          <span key={si} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-medium">
                            {src}
                          </span>
                        ))}
                      </div>
                      {msg.confidenceScore && (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {msg.confidenceScore}% Confidence
                        </span>
                      )}
                    </div>
                  )}

                  {/* Embedded action buttons */}
                  {!isUser && !msg.isStreaming && msg.actionButtons && msg.actionButtons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                      {msg.actionButtons.map((btn, idx) => {
                        const Icon = btn.icon || ChevronRight;
                        return (
                          <Link
                            key={idx}
                            to={btn.path}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium text-xs border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-2xs transition-all"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{btn.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Copy button (appears on hover) */}
                  {!msg.isStreaming && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className={`absolute bottom-2 right-2 p-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                        isUser
                          ? "bg-blue-700 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700"
                      }`}
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center shrink-0 shadow-xs mt-1 overflow-hidden">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Fetching from API — show skeleton before streaming starts */}
          {isBusy && messages[messages.length - 1]?.sender !== "assistant" && (
            <MessageSkeleton />
          )}

          {/* Typing indicator — only while waiting for the first response token */}
          {isBusy &&
            messages.length > 0 &&
            messages[messages.length - 1]?.sender === "assistant" &&
            messages[messages.length - 1]?.displayText === "" && (
              <TypingIndicator />
            )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts */}
        <div className="px-4 sm:px-6 pt-2 pb-1 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" /> Suggestions:
            </span>
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isBusy}
                className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 border border-gray-200 dark:border-gray-700 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-default"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="p-4 sm:p-6 pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 p-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-[#1a2232] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
          >
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              title="Attach assignment or syllabus doc (coming soon)"
              onClick={() =>
                toast.info("File Upload", {
                  description: "Document upload will be available in the next release.",
                })
              }
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              ref={inputRef}
              id="ai-assistant-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about classes, attendance, deadlines, or exams…"
              disabled={isBusy}
              className="flex-1 bg-transparent border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none px-2 disabled:opacity-60"
            />

            <button
              type="button"
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors hidden sm:block cursor-pointer"
              title="Voice input (coming soon)"
              onClick={() =>
                toast.info("Voice Input", {
                  description: "Voice prompts will be available in the next release.",
                })
              }
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              id="ai-assistant-send-btn"
              type="submit"
              disabled={!inputText.trim() || isBusy}
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-400 mt-2">
            CampusPilot AI leverages IBM Granite 3.0. Responses are grounded in
            official course regulations and biometric records.
          </p>
        </div>
      </div>
    </div>
  );
};
