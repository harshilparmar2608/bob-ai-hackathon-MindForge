import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Layers,
  GraduationCap,
  Briefcase,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronDown,
  CalendarDays,
  FileText,
  Building,
  Target,
  Share2,
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
  Input,
  Select,
} from "../ui";
import { AcademicEvent, AcademicEventCategory, PriorityLevel } from "../../types";
import { MOCK_ACADEMIC_EVENTS } from "../../services/mockData";
import { useStudent } from "../../context/StudentContext";

export interface AcademicTimelineCalendarProps {
  className?: string;
  initialEvents?: AcademicEvent[];
  defaultView?: "timeline" | "calendar" | "deadlines" | "exams" | "career";
}

type ViewMode = "timeline" | "calendar" | "deadlines" | "exams" | "career";

export const AcademicTimelineCalendar: React.FC<AcademicTimelineCalendarProps> = ({
  className,
  initialEvents = MOCK_ACADEMIC_EVENTS,
  defaultView = "timeline",
}) => {
  // Authenticated student context drives the identity strip (no hardcoded values).
  const { student } = useStudent();
  const identityLabel =
    student?.semester && student?.major
      ? `${student.semester} • ${student.major}`
      : "Academic Timeline";

  // State
  const [events, setEvents] = useState<AcademicEvent[]>(initialEvents);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");

  // Interactive Calendar State (September 2026 default)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 is September
  const [selectedDateStr, setSelectedDateStr] = useState("2026-09-14"); // Today

  // Modals
  const [activeEventDetail, setActiveEventDetail] = useState<AcademicEvent | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<AcademicEventCategory>("deadline");
  const [newEventCourse, setNewEventCourse] = useState("CS501");
  const [newEventDate, setNewEventDate] = useState("2026-09-21");
  const [newEventTime, setNewEventTime] = useState("05:00 PM");
  const [newEventLocation, setNewEventLocation] = useState("Campus LMS Portal");
  const [newEventUrgency, setNewEventUrgency] = useState<PriorityLevel>("high");
  const [newEventWeightage, setNewEventWeightage] = useState("15% of Grade");

  // Courses list
  const courseOptions = useMemo(() => {
    const list = new Set(events.map((e) => e.courseCode).filter(Boolean) as string[]);
    return Array.from(list).sort();
  }, [events]);

  // Filtered Events Pipeline
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Category / View Filter
      if (viewMode === "deadlines" && e.category !== "deadline") return false;
      if (viewMode === "exams" && e.category !== "exam") return false;
      if (viewMode === "career" && e.category !== "career") return false;

      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchCourse = e.courseCode?.toLowerCase().includes(q) || false;
        const matchCompany = e.companyOrHost?.toLowerCase().includes(q) || false;
        const matchLoc = e.location.toLowerCase().includes(q);
        if (!matchTitle && !matchCourse && !matchCompany && !matchLoc) return false;
      }

      // Course Filter
      if (selectedCourse !== "all" && e.courseCode !== selectedCourse) return false;

      // Urgency Filter
      if (selectedUrgency !== "all" && e.urgency !== selectedUrgency) return false;

      return true;
    });
  }, [events, viewMode, searchQuery, selectedCourse, selectedUrgency]);

  // Chronological Sorting
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEvents]);

  // Grouped for Timeline View
  const timelineGroups = useMemo(() => {
    const groups: { title: string; subtitle: string; events: AcademicEvent[] }[] = [
      {
        title: "Today's Milestones (Sep 14)",
        subtitle: "Immediate submissions and scheduled evaluations",
        events: sortedEvents.filter((e) => e.date === "2026-09-14"),
      },
      {
        title: "This Week (Sep 15 - Sep 21)",
        subtitle: "Midterm exams, project submissions & recruitment presentations",
        events: sortedEvents.filter((e) => e.date > "2026-09-14" && e.date <= "2026-09-21"),
      },
      {
        title: "Upcoming (Sep 22 - Oct 02)",
        subtitle: "Hackathons, technical evaluations & capstone milestones",
        events: sortedEvents.filter((e) => e.date > "2026-09-21" && e.date <= "2026-10-02"),
      },
      {
        title: "Later This Semester",
        subtitle: "Final placement cutoffs and project phase deliverables",
        events: sortedEvents.filter((e) => e.date > "2026-10-02"),
      },
    ];

    return groups.filter((g) => g.events.length > 0);
  }, [sortedEvents]);

  // Calendar Math
  const monthName = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    return d.toLocaleString("default", { month: "long" });
  }, [currentYear, currentMonth]);

  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    // 0 is Sunday, 1 is Monday, etc.
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  // Map events to date strings
  const eventsByDate = useMemo(() => {
    const map = new Map<string, AcademicEvent[]>();
    events.forEach((ev) => {
      const existing = map.get(ev.date) || [];
      existing.push(ev);
      map.set(ev.date, existing);
    });
    return map;
  }, [events]);

  // Events on currently selected date in calendar
  const selectedDateEvents = useMemo(() => {
    return eventsByDate.get(selectedDateStr) || [];
  }, [eventsByDate, selectedDateStr]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September
    setSelectedDateStr("2026-09-14");
  };

  // Add event handler
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEv: AcademicEvent = {
      id: `evt-user-${Date.now()}`,
      title: newEventTitle.trim(),
      type: newEventCategory === "exam" ? "Exam" : newEventCategory === "career" ? "Career" : "Deadline",
      category: newEventCategory,
      courseCode: newEventCategory !== "career" ? newEventCourse : undefined,
      courseName: newEventCategory === "career" ? "Campus Placement" : "Coursework",
      date: newEventDate,
      displayDate: newEventDate,
      time: newEventTime,
      location: newEventLocation,
      daysRemaining: Math.max(0, Math.floor((new Date(newEventDate).getTime() - new Date("2026-09-14").getTime()) / (1000 * 3600 * 24))),
      urgency: newEventUrgency,
      weightage: newEventWeightage,
      status: "upcoming",
    };

    setEvents((prev) => [newEv, ...prev]);
    setIsAddEventOpen(false);
    setNewEventTitle("");
  };

  // Badges & Styling Helpers
  const renderTypeIcon = (category: AcademicEventCategory) => {
    switch (category) {
      case "exam":
        return <GraduationCap className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "deadline":
        return <CalendarIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "career":
        return <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const renderUrgencyBadge = (urgency: PriorityLevel) => {
    switch (urgency) {
      case "critical":
        return (
          <Badge variant="danger" size="sm" dot>
            Critical
          </Badge>
        );
      case "high":
        return (
          <Badge variant="warning" size="sm">
            High Priority
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="default" size="sm">
            Medium
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            Low
          </Badge>
        );
    }
  };

  return (
    <div id="academic-timeline-calendar-suite" className={`space-y-4 ${className || ""}`}>
      {/* Header with Navigation Views */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-2xs">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Academic Timeline & Calendar Suite
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Synchronized view of course assignment deadlines, exam schedules, and campus career events
            </p>
          </div>
        </div>

        {/* Action Controls: Add Event & Quick Jump */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleJumpToToday}
            className="text-xs h-8"
          >
            Today (Sep 14)
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddEventOpen(true)}
            className="text-xs h-8 flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Milestone / Event
          </Button>
        </div>
      </div>

      {/* Main Suite Card */}
      <Card variant="default" className="border-gray-200/90 dark:border-gray-800 overflow-hidden">
        {/* Navigation Switcher Tabs & Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3.5 bg-gray-50/40 dark:bg-gray-800/20">
          {/* Top Primary View Modes */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { key: "timeline", label: "Academic Timeline", count: events.length },
                { key: "calendar", label: "Calendar Grid", count: daysInMonth },
                {
                  key: "deadlines",
                  label: "Deadlines",
                  count: events.filter((e) => e.category === "deadline").length,
                },
                {
                  key: "exams",
                  label: "Exams",
                  count: events.filter((e) => e.category === "exam").length,
                },
                {
                  key: "career",
                  label: "Career Events",
                  count: events.filter((e) => e.category === "career").length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setViewMode(tab.key as ViewMode)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                    viewMode === tab.key
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white dark:bg-[#161c28] text-gray-600 dark:text-gray-300 border border-gray-200/90 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      viewMode === tab.key
                        ? "bg-blue-800 text-white font-bold"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {identityLabel}
            </div>
          </div>

          {/* Search and Secondary Filter Row (Visible in non-calendar or all views) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search (6 Cols) */}
            <div className="sm:col-span-6 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search deadlines, exams, companies, topics, or halls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-9 pr-3 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161c28] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all"
              />
            </div>

            {/* Course Filter (3 Cols) */}
            <div className="sm:col-span-3">
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                options={[
                  { value: "all", label: "All Subjects & Programs" },
                  ...courseOptions.map((code) => ({ value: code, label: `${code} Course` })),
                ]}
                className="h-8 text-xs"
              />
            </div>

            {/* Urgency Filter (3 Cols) */}
            <div className="sm:col-span-3">
              <Select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                options={[
                  { value: "all", label: "All Priority Levels" },
                  { value: "critical", label: "Critical Priority Only" },
                  { value: "high", label: "High Priority Only" },
                  { value: "medium", label: "Medium / Normal" },
                ]}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* VIEW 1: ACADEMIC TIMELINE VIEW */}
        {viewMode === "timeline" && (
          <div className="p-4 sm:p-6 space-y-8">
            {timelineGroups.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No academic timeline events match your current filters.
              </div>
            ) : (
              timelineGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-3">
                  {/* Group Header */}
                  <div className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-800 pb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        {group.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {group.subtitle}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-400">
                      {group.events.length} item{group.events.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Vertical Timeline Items with Connecting Line */}
                  <div className="relative pl-6 space-y-4 border-l-2 border-gray-200 dark:border-gray-800 ml-3">
                    {group.events.map((ev) => {
                      const isToday = ev.date === "2026-09-14";
                      const isCritical = ev.urgency === "critical";

                      return (
                        <div key={ev.id} className="relative group">
                          {/* Timeline Dot Marker */}
                          <div
                            className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-[#161c28] flex items-center justify-center transition-all ${
                              isCritical
                                ? "border-rose-600 ring-4 ring-rose-100 dark:ring-rose-950/50"
                                : isToday
                                ? "border-blue-600 ring-4 ring-blue-100 dark:ring-blue-950/50"
                                : "border-gray-400 dark:border-gray-600"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCritical ? "bg-rose-600" : isToday ? "bg-blue-600" : "bg-gray-400"
                              }`}
                            />
                          </div>

                          {/* Event Card */}
                          <div
                            onClick={() => setActiveEventDetail(ev)}
                            className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                              isCritical
                                ? "bg-rose-50/20 hover:bg-rose-50/40 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 border-rose-200/90 dark:border-rose-900/60"
                                : "bg-white hover:bg-gray-50/80 dark:bg-[#161c28] dark:hover:bg-gray-800/60 border-gray-200/90 dark:border-gray-800"
                            } shadow-2xs hover:shadow-xs`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="p-1 rounded bg-gray-100 dark:bg-gray-800">
                                  {renderTypeIcon(ev.category)}
                                </span>
                                <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                                  {ev.displayDate} • {ev.time}
                                </span>
                                {ev.courseCode && (
                                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold">
                                    {ev.courseCode}
                                  </span>
                                )}
                                {ev.companyOrHost && (
                                  <span className="text-[11px] px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1">
                                    <Building className="w-2.5 h-2.5" />
                                    {ev.companyOrHost}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {renderUrgencyBadge(ev.urgency)}
                                <span
                                  className={`text-xs font-mono font-bold ${
                                    ev.daysRemaining === 0
                                      ? "text-rose-600 animate-pulse"
                                      : ev.daysRemaining === 1
                                      ? "text-amber-600"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {ev.daysRemaining === 0
                                    ? "Due Today"
                                    : ev.daysRemaining === 1
                                    ? "Tomorrow"
                                    : `${ev.daysRemaining} days left`}
                                </span>
                              </div>
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {ev.title}
                            </h4>

                            {ev.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                                {ev.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                              <span className="flex items-center gap-1 text-[11px]">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {ev.location}
                              </span>

                              {ev.weightage && (
                                <span className="font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                                  {ev.weightage}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VIEW 2: INTERACTIVE CALENDAR VIEW */}
        {viewMode === "calendar" && (
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar Grid (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Calendar Month Header & Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {monthName} {currentYear}
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    ({daysInMonth} Days)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleJumpToToday}
                    className="px-2 py-1 text-xs font-semibold rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 uppercase py-1 border-b border-gray-100 dark:border-gray-800">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Cells Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {/* Empty cells before month start */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-lg bg-gray-50/50 dark:bg-gray-800/10 opacity-40" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const isToday = dateStr === "2026-09-14";
                  const isSelected = dateStr === selectedDateStr;
                  const dayEvents = eventsByDate.get(dateStr) || [];

                  const hasExam = dayEvents.some((e) => e.category === "exam");
                  const hasDeadline = dayEvents.some((e) => e.category === "deadline");
                  const hasCareer = dayEvents.some((e) => e.category === "career");

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`h-16 sm:h-20 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer select-none ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-2xs ring-2 ring-blue-500/40"
                          : isToday
                          ? "border-blue-300 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-950/20"
                          : "border-gray-200/80 dark:border-gray-800 bg-white dark:bg-[#161c28] hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-mono font-bold ${
                            isToday
                              ? "w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]"
                              : isSelected
                              ? "text-blue-600 dark:text-blue-400 font-extrabold"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {dayNum}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="text-[10px] font-mono font-semibold text-gray-400">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Event Dot Indicators */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {hasExam && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" title="Exam scheduled" />
                        )}
                        {hasDeadline && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="Course deadline" />
                        )}
                        {hasCareer && (
                          <span className="w-2 h-2 rounded-full bg-purple-500" title="Career / placement" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Examination
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Assignment Deadline
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Career / Recruitment
                </span>
              </div>
            </div>

            {/* Day Agenda Drawer (4 Cols) */}
            <div className="lg:col-span-4 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-800/30 border border-gray-200/90 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-700/80 pb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                    Day Agenda: {selectedDateStr}
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    {selectedDateEvents.length} scheduled event{selectedDateEvents.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs space-y-2">
                  <CalendarDays className="w-6 h-6 mx-auto stroke-1 text-gray-400" />
                  <p>No milestones scheduled for this date.</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setNewEventDate(selectedDateStr);
                      setIsAddEventOpen(true);
                    }}
                    className="text-xs mt-2"
                  >
                    + Schedule on {selectedDateStr}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDateEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setActiveEventDetail(ev)}
                      className="p-3 rounded-lg bg-white dark:bg-[#161c28] border border-gray-200/90 dark:border-gray-700/80 shadow-2xs hover:border-blue-500 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-gray-500 font-semibold">{ev.time}</span>
                        {renderUrgencyBadge(ev.urgency)}
                      </div>
                      <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                        {ev.title}
                      </h5>
                      <div className="text-[11px] text-gray-500 mt-0.5 flex items-center justify-between">
                        <span>{ev.location}</span>
                        {ev.courseCode && <span className="font-mono font-semibold">{ev.courseCode}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: DEADLINES VIEW */}
        {viewMode === "deadlines" && (
          <div className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Upcoming Coursework Submissions & Project Deadlines
              </span>
              <span className="text-xs font-mono text-gray-400">
                Sorted by Immediate Urgency
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {sortedEvents
                .filter((e) => e.category === "deadline")
                .map((dl) => (
                  <div
                    key={dl.id}
                    onClick={() => setActiveEventDetail(dl)}
                    className="p-4 rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-[#161c28] hover:border-blue-500/80 shadow-2xs transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                        {dl.courseCode} • {dl.courseName}
                      </span>
                      {renderUrgencyBadge(dl.urgency)}
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {dl.title}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                      {dl.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Due Time</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {dl.displayDate}, {dl.time}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Grade Weight</span>
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {dl.weightage}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                        {dl.daysRemaining === 0 ? "⚡ Due Today" : `${dl.daysRemaining} days remaining`}
                      </span>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs h-7 py-0 px-2.5 flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Submission Details
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 4: EXAMS VIEW */}
        {viewMode === "exams" && (
          <div className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Formal Examinations, Practical Lab Tests & Diagnostics
              </span>
              <span className="text-xs font-mono text-gray-400">
                Hall Tickets & Seat Allotments
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {sortedEvents
                .filter((e) => e.category === "exam")
                .map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => setActiveEventDetail(ex)}
                    className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/20 via-white to-white dark:from-rose-950/10 dark:via-[#161c28] dark:to-[#161c28] shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {ex.courseCode}
                      </span>

                      <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                        {ex.daysRemaining} days countdown
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {ex.title}
                    </h4>

                    <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-white/80 dark:bg-gray-800/60 border border-rose-100 dark:border-rose-900/40 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Date & Time</span>
                        <span className="font-mono text-gray-900 dark:text-white text-[11px] font-semibold">
                          {ex.displayDate}
                        </span>
                        <span className="font-mono text-gray-500 block text-[10px]">{ex.time}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Location</span>
                        <span className="text-gray-900 dark:text-white text-[11px] font-semibold">
                          {ex.location}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Weightage</span>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-[11px]">
                          {ex.weightage}
                        </span>
                      </div>
                    </div>

                    {ex.syllabusOrTopics && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">
                          Syllabus Coverage:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {ex.syllabusOrTopics.map((topic, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VIEW 5: CAREER EVENTS VIEW */}
        {viewMode === "career" && (
          <div className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Campus Recruitment Drives, Hackathons & Placement Preparation
              </span>
              <span className="text-xs font-mono text-gray-400">
                Tier-1 Corporate Schedules
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {sortedEvents
                .filter((e) => e.category === "career")
                .map((cr) => (
                  <div
                    key={cr.id}
                    onClick={() => setActiveEventDetail(cr)}
                    className="p-4 rounded-xl border border-purple-200/80 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/20 via-white to-white dark:from-purple-950/10 dark:via-[#161c28] dark:to-[#161c28] shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {cr.companyOrHost}
                      </span>
                      {renderUrgencyBadge(cr.urgency)}
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {cr.title}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {cr.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Timing</span>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {cr.displayDate}, {cr.time}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Location / Portal</span>
                        <span className="font-semibold text-gray-900 dark:text-white truncate block">
                          {cr.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono font-semibold text-purple-700 dark:text-purple-300">
                        {cr.weightage}
                      </span>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs h-7 py-0 px-2.5 flex items-center gap-1 text-purple-700 dark:text-purple-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Event Details
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Card>

      {/* Event Details Modal */}
      {activeEventDetail && (
        <Modal
          isOpen={Boolean(activeEventDetail)}
          onClose={() => setActiveEventDetail(null)}
          title={activeEventDetail.title}
          description={`${activeEventDetail.type} • ${activeEventDetail.displayDate} at ${activeEventDetail.time}`}
          size="md"
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white">
                  Location & Session Link
                </span>
                {renderUrgencyBadge(activeEventDetail.urgency)}
              </div>
              <p className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {activeEventDetail.location}
              </p>
              {activeEventDetail.description && (
                <p className="text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                  {activeEventDetail.description}
                </p>
              )}
            </div>

            {activeEventDetail.syllabusOrTopics && (
              <div className="space-y-1.5">
                <span className="font-bold text-gray-900 dark:text-white block">
                  Relevant Topics & Evaluation Rubric:
                </span>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  {activeEventDetail.syllabusOrTopics.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="font-mono text-gray-400 font-bold">
                {activeEventDetail.weightage || "Academic Calendar Sync"}
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveEventDetail(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    alert(`Event synced to your Google Calendar & LMS Reminders!`);
                    setActiveEventDetail(null);
                  }}
                  className="text-xs flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  Sync to Calendar
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Milestone Modal */}
      {isAddEventOpen && (
        <Modal
          isOpen={isAddEventOpen}
          onClose={() => setIsAddEventOpen(false)}
          title="Add Milestone / Event"
          description="Schedule a coursework deadline, examination, or career recruitment date"
          size="md"
        >
          <form onSubmit={handleCreateEvent} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Event Title
              </label>
              <Input
                placeholder="e.g. Distributed Systems Final Paper Submission"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Event Category
                </label>
                <Select
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value as AcademicEventCategory)}
                  options={[
                    { value: "deadline", label: "Assignment / Submission Deadline" },
                    { value: "exam", label: "Midterm or Lab Examination" },
                    { value: "career", label: "Career / Placement Drive" },
                    { value: "academic", label: "Academic Milestone" },
                  ]}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Course Code
                </label>
                <Select
                  value={newEventCourse}
                  onChange={(e) => setNewEventCourse(e.target.value)}
                  options={[
                    { value: "CS501", label: "CS501 - Computer Networks" },
                    { value: "CS502", label: "CS502 - Database Systems" },
                    { value: "CS503", label: "CS503 - Data Science & AI" },
                    { value: "CS504", label: "CS504 - Cloud Architecture" },
                    { value: "CS505", label: "CS505 - Operating Systems" },
                    { value: "CS599", label: "CS599 - Capstone Project" },
                  ]}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Date (YYYY-MM-DD)
                </label>
                <Input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Time
                </label>
                <Input
                  placeholder="e.g. 05:00 PM"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Priority
                </label>
                <Select
                  value={newEventUrgency}
                  onChange={(e) => setNewEventUrgency(e.target.value as PriorityLevel)}
                  options={[
                    { value: "critical", label: "Critical Priority" },
                    { value: "high", label: "High Priority" },
                    { value: "medium", label: "Medium Priority" },
                    { value: "low", label: "Low Priority" },
                  ]}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Location / Portal
                </label>
                <Input
                  placeholder="e.g. Hall A or Canvas LMS"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddEventOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="text-xs"
              >
                Save to Academic Schedule
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
