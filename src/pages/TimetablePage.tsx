import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Filter,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";

interface ClassSession {
  id: string;
  subjectCode: string;
  subjectName: string;
  faculty: string;
  time: string;
  room: string;
  status: "ongoing" | "upcoming" | "completed";
  type: "Lecture" | "Lab" | "Mentor Sync" | "Self-Study";
  isUrgent?: boolean;
  notesTopic?: string;
  attendanceMarked?: boolean;
}

export const TimetablePage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>("Mon");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All");

  const days = [
    { key: "Mon", label: "Monday", date: "Sep 14", isToday: true, count: 4 },
    { key: "Tue", label: "Tuesday", date: "Sep 15", isToday: false, count: 3 },
    { key: "Wed", label: "Wednesday", date: "Sep 16", isToday: false, count: 3 },
    { key: "Thu", label: "Thursday", date: "Sep 17", isToday: false, count: 4 },
    { key: "Fri", label: "Friday", date: "Sep 18", isToday: false, count: 2 },
    { key: "Sat", label: "Saturday", date: "Sep 19", isToday: false, count: 1 },
  ];

  // Realistic mock schedule by day
  const scheduleByDay: Record<string, ClassSession[]> = {
    Mon: [
      {
        id: "class-1",
        subjectCode: "CS505",
        subjectName: "Operating Systems",
        faculty: "Prof. Kenneth Vance",
        time: "09:00 AM - 10:30 AM",
        room: "Lecture Hall B (2nd Floor)",
        status: "ongoing",
        type: "Lecture",
        isUrgent: false,
        notesTopic: "Process Synchronization & Semaphore Deadlocks",
        attendanceMarked: true,
      },
      {
        id: "class-2",
        subjectCode: "CS502L",
        subjectName: "Database Systems Lab",
        faculty: "Dr. Evelyn Reed",
        time: "11:00 AM - 01:00 PM",
        room: "Computing Lab 03 • CS Dept",
        status: "upcoming",
        type: "Lab",
        isUrgent: true,
        notesTopic: "Query Execution Plans & B+ Tree Latch Benchmarks",
        attendanceMarked: false,
      },
      {
        id: "class-3",
        subjectCode: "CP101",
        subjectName: "CampusPilot AI Mentor Session",
        faculty: "IBM Watsonx Academic Mentor",
        time: "02:30 PM - 03:30 PM",
        room: "Virtual Room (Online)",
        status: "upcoming",
        type: "Mentor Sync",
        isUrgent: false,
        notesTopic: "Granite 3.0 Hackathon Pitch & Architecture Review",
        attendanceMarked: false,
      },
      {
        id: "class-4",
        subjectCode: "CS501",
        subjectName: "Computer Networks Self-Study",
        faculty: "Self-Paced Guided Study",
        time: "04:00 PM - 06:00 PM",
        room: "Library Media Room 4A",
        status: "upcoming",
        type: "Self-Study",
        isUrgent: false,
        notesTopic: "TCP/IP Sliding Window Simulation Submission Prep",
        attendanceMarked: false,
      },
    ],
    Tue: [
      {
        id: "class-5",
        subjectCode: "CS503",
        subjectName: "Data Science & AI",
        faculty: "Dr. Priya Sharma",
        time: "09:30 AM - 11:00 AM",
        room: "Smart Class 104",
        status: "upcoming",
        type: "Lecture",
        isUrgent: false,
        notesTopic: "Transformer Attention Mechanisms & BERT Fine-tuning",
      },
      {
        id: "class-6",
        subjectCode: "CS504",
        subjectName: "Cloud Architecture",
        faculty: "Prof. Marcus Thorne",
        time: "11:30 AM - 01:00 PM",
        room: "Hall C • Tech Block",
        status: "upcoming",
        type: "Lecture",
        isUrgent: false,
        notesTopic: "Microservices Resilience & Circuit Breakers",
      },
      {
        id: "class-7",
        subjectCode: "CS503L",
        subjectName: "Data Science Lab",
        faculty: "Dr. Priya Sharma",
        time: "02:00 PM - 04:00 PM",
        room: "AI Sandbox Lab 01",
        status: "upcoming",
        type: "Lab",
        isUrgent: false,
        notesTopic: "NLP Legal Document Tokenization Pipeline",
      },
    ],
    Wed: [
      {
        id: "class-8",
        subjectCode: "CS501",
        subjectName: "Computer Networks",
        faculty: "Prof. Kenneth Vance",
        time: "10:00 AM - 11:30 AM",
        room: "Hall B",
        status: "upcoming",
        type: "Lecture",
        isUrgent: false,
        notesTopic: "BGP Routing & Autonomous Systems",
      },
      {
        id: "class-9",
        subjectCode: "CS502",
        subjectName: "Database Systems",
        faculty: "Dr. Evelyn Reed",
        time: "12:00 PM - 01:30 PM",
        room: "Hall A",
        status: "upcoming",
        type: "Lecture",
        isUrgent: false,
        notesTopic: "ACID Transactions & Two-Phase Locking",
      },
      {
        id: "class-10",
        subjectCode: "CS599",
        subjectName: "Senior Capstone Seminar",
        faculty: "Dean's Advisory Panel",
        time: "03:00 PM - 05:00 PM",
        room: "Auditorium Annex",
        status: "upcoming",
        type: "Lecture",
        isUrgent: false,
        notesTopic: "Milestone 1 Architecture Critique",
      },
    ],
    Thu: [
      {
        id: "class-11",
        subjectCode: "CS502L",
        subjectName: "Database Systems Lab (Practical Exam)",
        faculty: "Dr. Evelyn Reed",
        time: "10:00 AM - 01:00 PM",
        room: "Computing Lab 03 • CS Dept",
        status: "upcoming",
        type: "Lab",
        isUrgent: true,
        notesTopic: "3-Hour Practical SQL Tuning & Normalization Test",
      },
      {
        id: "class-12",
        subjectCode: "CS505",
        subjectName: "Operating Systems",
        faculty: "Prof. Kenneth Vance",
        time: "02:00 PM - 03:30 PM",
        room: "Hall B",
        status: "upcoming",
        type: "Lecture",
        isUrgent: false,
        notesTopic: "Paging & Virtual Memory Management",
      },
    ],
    Fri: [
      {
        id: "class-13",
        subjectCode: "CS504",
        subjectName: "Cloud Architecture Lab",
        faculty: "Prof. Marcus Thorne",
        time: "10:00 AM - 12:00 PM",
        room: "Cloud Computing Lab 02",
        status: "upcoming",
        type: "Lab",
        isUrgent: false,
        notesTopic: "Kubernetes Cluster Deployment & Helm Charts",
      },
      {
        id: "class-14",
        subjectCode: "CS503",
        subjectName: "Data Science & AI",
        faculty: "Dr. Priya Sharma",
        time: "02:00 PM - 03:30 PM",
        room: "Smart Class 104",
        status: "upcoming",
        type: "Lecture",
        isUrgent: false,
        notesTopic: "Evaluation Metrics: ROC-AUC & Multi-Class Confusion Matrix",
      },
    ],
    Sat: [
      {
        id: "class-15",
        subjectCode: "IBM101",
        subjectName: "IBM Granite Hackathon Mentorship Office Hours",
        faculty: "IBM Cloud Specialists",
        time: "11:00 AM - 01:00 PM",
        room: "Innovation Hub / Online",
        status: "upcoming",
        type: "Mentor Sync",
        isUrgent: false,
        notesTopic: "Enterprise Agent Architecture Q&A",
      },
    ],
  };

  const currentDayClasses = scheduleByDay[selectedDay] || scheduleByDay["Mon"];
  const filteredClasses =
    selectedTypeFilter === "All"
      ? currentDayClasses
      : currentDayClasses.filter((c) => c.type === selectedTypeFilter);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Campus Class Timetable</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Weekly class schedule with real-time room tracking and attendance status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI: "What classes do I have today?"</span>
          </Link>
        </div>
      </div>

      {/* 1. Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {days.map((day) => {
          const isSelected = day.key === selectedDay;
          return (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`flex flex-col items-center min-w-[84px] sm:min-w-[105px] p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white dark:bg-[#161c28] border-gray-200 dark:border-gray-800 hover:border-blue-400 text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-semibold">
                <span>{day.label}</span>
                {day.isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-white" : "bg-blue-600 animate-pulse"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[11px] mt-0.5 ${
                  isSelected ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {day.date}
              </span>
              <span
                className={`text-[10px] mt-1 font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {day.count} {day.count === 1 ? "Class" : "Classes"}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Type Filter Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {["All", "Lecture", "Lab", "Mentor Sync"].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedTypeFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTypeFilter === filter
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-2xs font-semibold"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
          Showing {filteredClasses.length} sessions
        </span>
      </div>

      {/* 3. Class Cards Grid (Replaced tables with beautiful cards) */}
      <div className="space-y-4">
        {filteredClasses.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 text-gray-500 text-sm">
            No classes scheduled for this category on {selectedDay}.
          </div>
        ) : (
          filteredClasses.map((item) => {
            const isCurrentClass = item.status === "ongoing";

            return (
              <div
                key={item.id}
                id={`class-card-${item.id}`}
                className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all border shadow-xs ${
                  isCurrentClass
                    ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                    : "bg-white dark:bg-[#161c28] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                {/* Current Class Indicator Bar */}
                {isCurrentClass && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600 animate-pulse" />
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Time & Status */}
                  <div className="flex items-start sm:items-center gap-4 min-w-[240px]">
                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shrink-0">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{item.time}</span>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 mt-1">
                        {isCurrentClass ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            Ongoing Now
                          </span>
                        ) : item.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Upcoming
                          </span>
                        )}

                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Subject, Faculty, Room */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {item.subjectCode}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {item.subjectName}
                      </h3>
                      {item.isUrgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Critical Attendance Course
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <strong>Faculty:</strong> {item.faculty}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <strong>Room:</strong> {item.room}
                      </span>
                    </div>

                    {item.notesTopic && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 pt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Topic:</span>
                        <span>{item.notesTopic}</span>
                      </p>
                    )}
                  </div>

                  {/* Right Column: Attendance / Action */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                    {item.attendanceMarked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Present Marked
                      </span>
                    ) : (
                      <Link
                        to="/attendance"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Attendance Status</span>
                      </Link>
                    )}

                    <Link
                      to="/assistant"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-2xs transition-colors"
                      title="Ask AI about this lecture"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Prep with AI</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
