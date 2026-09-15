import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Calendar,
  Layers,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  BadgeVariant,
  Button,
  Input,
  Select,
  Checkbox,
  Tooltip,
  Modal,
} from "../ui";
import { AssignmentItem, PriorityLevel, TaskStatus, RiskLevel } from "../../types";
import { MOCK_ASSIGNMENTS } from "../../services/mockData";

export interface AssignmentsTableSectionProps {
  className?: string;
  initialAssignments?: AssignmentItem[];
}

type SortField = "title" | "courseCode" | "deadline" | "priority" | "status" | "estimatedHours";
type SortDirection = "asc" | "desc";

const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const STATUS_ORDER: Record<TaskStatus, number> = {
  in_progress: 1,
  todo: 2,
  planning: 3,
  completed: 4,
};

export const AssignmentsTableSection: React.FC<AssignmentsTableSectionProps> = ({
  className,
  initialAssignments = MOCK_ASSIGNMENTS,
}) => {
  // Local state for assignments to allow interactive updates (status changes, additions, deletions)
  const [assignments, setAssignments] = useState<AssignmentItem[]>(initialAssignments);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  // Sorting States
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Selection States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal / Detail states
  const [activeDetailItem, setActiveDetailItem] = useState<AssignmentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New assignment form state
  const [newTitle, setNewTitle] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("CS501");
  const [newSubject, setNewSubject] = useState("Computer Networks");
  const [newDeadline, setNewDeadline] = useState("Sep 28, 11:59 PM");
  const [newPriority, setNewPriority] = useState<PriorityLevel>("high");
  const [newHours, setNewHours] = useState(3.0);

  // Dynamic list of unique courses for course filter
  const uniqueCourses = useMemo(() => {
    const courses = new Set(assignments.map((a) => a.courseCode));
    return Array.from(courses).sort();
  }, [assignments]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter & Sort Pipeline
  const filteredAndSortedAssignments = useMemo(() => {
    return assignments
      .filter((item) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchCourse = item.courseCode.toLowerCase().includes(q);
          const matchSubject = item.subject.toLowerCase().includes(q);
          if (!matchTitle && !matchCourse && !matchSubject) return false;
        }

        // Status filter
        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== "all" && item.priority !== priorityFilter) {
          return false;
        }

        // Course filter
        if (courseFilter !== "all" && item.courseCode !== courseFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "courseCode":
            comparison = a.courseCode.localeCompare(b.courseCode);
            break;
          case "deadline":
            comparison = a.deadline.localeCompare(b.deadline);
            break;
          case "priority":
            comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
            break;
          case "status":
            comparison = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
            break;
          case "estimatedHours":
            comparison = a.estimatedHours - b.estimatedHours;
            break;
          default:
            comparison = 0;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [assignments, searchQuery, statusFilter, priorityFilter, courseFilter, sortField, sortDirection]);

  // Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedAssignments.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(filteredAndSortedAssignments.map((a) => a.id));
      setSelectedIds(allIds);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Status cycling action (todo -> in_progress -> completed -> planning)
  const handleCycleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssignments((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let nextStatus: TaskStatus = "todo";
        if (item.status === "todo") nextStatus = "in_progress";
        else if (item.status === "in_progress") nextStatus = "completed";
        else if (item.status === "completed") nextStatus = "planning";
        else nextStatus = "todo";
        return { ...item, status: nextStatus };
      })
    );
  };

  // Batch actions
  const handleBatchMarkCompleted = () => {
    setAssignments((prev) =>
      prev.map((item) => (selectedIds.has(item.id) ? { ...item, status: "completed" as TaskStatus } : item))
    );
    setSelectedIds(new Set());
  };

  const handleBatchDelete = () => {
    setAssignments((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
  };

  // Add Assignment
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: AssignmentItem = {
      id: `asg-${Date.now()}`,
      title: newTitle.trim(),
      courseCode: newCourseCode,
      subject: newSubject,
      deadline: newDeadline,
      priority: newPriority,
      status: "todo",
      estimatedHours: newHours,
      riskLevel: newPriority === "critical" ? "critical" : newPriority === "high" ? "high" : "moderate",
    };

    setAssignments((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setNewTitle("");
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setCourseFilter("all");
  };

  const isFiltered = searchQuery !== "" || statusFilter !== "all" || priorityFilter !== "all" || courseFilter !== "all";

  // Priority Badge Styling
  const renderPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "critical":
        return (
          <Badge variant="danger" size="sm" dot>
            <span className="flex items-center gap-1 font-bold">
              <AlertTriangle className="w-2.5 h-2.5" />
              Critical
            </span>
          </Badge>
        );
      case "high":
        return (
          <Badge variant="warning" size="sm">
            <span className="flex items-center gap-1 font-semibold">
              <AlertCircle className="w-2.5 h-2.5" />
              High
            </span>
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="default" size="sm">
            <span className="font-medium">Medium</span>
          </Badge>
        );
      case "low":
        return (
          <Badge variant="neutral" size="sm">
            <span className="text-gray-500 font-medium">Low</span>
          </Badge>
        );
    }
  };

  // Status Badge Styling
  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" size="sm">
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Completed
            </span>
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="primary" size="sm" dot>
            <span className="flex items-center gap-1 font-semibold">
              In Progress
            </span>
          </Badge>
        );
      case "todo":
        return (
          <Badge variant="warning" size="sm">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-2.5 h-2.5" />
              To Do
            </span>
          </Badge>
        );
      case "planning":
        return (
          <Badge variant="purple" size="sm">
            <span className="flex items-center gap-1 font-medium">
              <Layers className="w-2.5 h-2.5" />
              Planning
            </span>
          </Badge>
        );
    }
  };

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: assignments.length,
      in_progress: assignments.filter((a) => a.status === "in_progress").length,
      todo: assignments.filter((a) => a.status === "todo").length,
      planning: assignments.filter((a) => a.status === "planning").length,
      completed: assignments.filter((a) => a.status === "completed").length,
    };
  }, [assignments]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 ml-1 opacity-60" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ml-1" />
    );
  };

  return (
    <div id="assignments-table-section" className={`space-y-4 ${className || ""}`}>
      {/* Section Header & Metrics Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Assignments & Course Submissions
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Interactive coursework tracking, priority sorting, status filters, and AI study breakdowns
            </p>
          </div>
        </div>

        {/* Action Controls: Add New Assignment */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 shadow-2xs text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Assignment
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card variant="default" className="border-gray-200/90 dark:border-gray-800 overflow-hidden">
        {/* Toolbar: Status Tabs + Search + Multi-Select Filter Controls */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3.5 bg-gray-50/40 dark:bg-gray-800/20">
          {/* Status Quick Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { key: "all", label: "All Items", count: statusCounts.all },
                { key: "in_progress", label: "In Progress", count: statusCounts.in_progress },
                { key: "todo", label: "To Do", count: statusCounts.todo },
                { key: "planning", label: "Planning", count: statusCounts.planning },
                { key: "completed", label: "Completed", count: statusCounts.completed },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                    statusFilter === tab.key
                      ? "bg-white dark:bg-[#1b2230] text-blue-600 dark:text-blue-400 shadow-2xs border border-gray-200/90 dark:border-gray-700"
                      : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      statusFilter === tab.key
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Showing count indicator */}
            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              Showing <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedAssignments.length}</span> of {assignments.length}
            </div>
          </div>

          {/* Search and Secondary Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input (5 Cols) */}
            <div className="sm:col-span-5 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, subject, or course code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161c28] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/80 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Priority Filter (3 Cols) */}
            <div className="sm:col-span-3">
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Priorities" },
                  { value: "critical", label: "Critical Priority" },
                  { value: "high", label: "High Priority" },
                  { value: "medium", label: "Medium Priority" },
                  { value: "low", label: "Low Priority" },
                ]}
                className="h-9 text-xs"
              />
            </div>

            {/* Course Filter (3 Cols) */}
            <div className="sm:col-span-3">
              <Select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Courses" },
                  ...uniqueCourses.map((code) => ({ value: code, label: `${code} Coursework` })),
                ]}
                className="h-9 text-xs"
              />
            </div>

            {/* Reset Filters (1 Col) */}
            <div className="sm:col-span-1 flex justify-end">
              {isFiltered ? (
                <Tooltip content="Reset all active filters">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-9 w-full sm:w-9 p-0 flex items-center justify-center text-gray-500 hover:text-gray-900 border-dashed"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </Tooltip>
              ) : (
                <Tooltip content="Filters are at default state">
                  <div className="h-9 w-9 flex items-center justify-center text-gray-300 dark:text-gray-700">
                    <Filter className="w-3.5 h-3.5" />
                  </div>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Batch Action Toolbar when items are selected */}
          {selectedIds.size > 0 && (
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                {selectedIds.size} assignment{selectedIds.size > 1 ? "s" : ""} selected
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleBatchMarkCompleted}
                  className="text-xs h-7 py-0 px-2.5 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark Completed
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBatchDelete}
                  className="text-xs h-7 py-0 px-2.5 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-1 underline cursor-pointer"
                >
                  Deselect all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* The Assignments Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {/* Checkbox Column */}
              <TableHead className="w-10 text-center">
                <Checkbox
                  checked={
                    filteredAndSortedAssignments.length > 0 &&
                    selectedIds.size === filteredAndSortedAssignments.length
                  }
                  onChange={handleToggleSelectAll}
                  aria-label="Select all assignments"
                />
              </TableHead>

              {/* Title / Subject (Sortable) */}
              <TableHead>
                <button
                  type="button"
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-1 group text-left cursor-pointer select-none"
                >
                  <span>Assignment Title & Subject</span>
                  {renderSortIndicator("title")}
                </button>
              </TableHead>

              {/* Course Code (Sortable) */}
              <TableHead className="w-28">
                <button
                  type="button"
                  onClick={() => handleSort("courseCode")}
                  className="flex items-center gap-1 group text-left cursor-pointer select-none"
                >
                  <span>Course</span>
                  {renderSortIndicator("courseCode")}
                </button>
              </TableHead>

              {/* Deadline (Sortable) */}
              <TableHead className="w-36">
                <button
                  type="button"
                  onClick={() => handleSort("deadline")}
                  className="flex items-center gap-1 group text-left cursor-pointer select-none"
                >
                  <span>Deadline</span>
                  {renderSortIndicator("deadline")}
                </button>
              </TableHead>

              {/* Priority Badge (Sortable) */}
              <TableHead className="w-28">
                <button
                  type="button"
                  onClick={() => handleSort("priority")}
                  className="flex items-center gap-1 group text-left cursor-pointer select-none"
                >
                  <span>Priority</span>
                  {renderSortIndicator("priority")}
                </button>
              </TableHead>

              {/* Status Badge (Sortable) */}
              <TableHead className="w-32">
                <button
                  type="button"
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1 group text-left cursor-pointer select-none"
                >
                  <span>Status</span>
                  {renderSortIndicator("status")}
                </button>
              </TableHead>

              {/* Effort / Estimated Hours (Sortable) */}
              <TableHead className="w-24 text-right">
                <button
                  type="button"
                  onClick={() => handleSort("estimatedHours")}
                  className="flex items-center justify-end gap-1 group w-full cursor-pointer select-none"
                >
                  <span>Effort</span>
                  {renderSortIndicator("estimatedHours")}
                </button>
              </TableHead>

              {/* Quick Actions */}
              <TableHead className="w-24 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredAndSortedAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 space-y-1.5">
                    <BookOpen className="w-6 h-6 stroke-1 text-gray-400" />
                    <p className="text-sm font-medium">No matching assignments found</p>
                    <p className="text-xs text-gray-400">
                      Try clearing or adjusting your search filters.
                    </p>
                    {isFiltered && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleResetFilters}
                        className="mt-2 text-xs"
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedAssignments.map((assignment) => {
                const isSelected = selectedIds.has(assignment.id);
                const isUrgent = assignment.deadline.includes("Today") || assignment.priority === "critical";

                return (
                  <TableRow
                    key={assignment.id}
                    data-state={isSelected ? "selected" : undefined}
                    className="cursor-pointer group"
                    onClick={() => setActiveDetailItem(assignment)}
                  >
                    {/* Select Checkbox */}
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(assignment.id)}
                        aria-label={`Select ${assignment.title}`}
                      />
                    </TableCell>

                    {/* Title and Subject */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                          <span className={assignment.status === "completed" ? "line-through text-gray-400 dark:text-gray-500" : ""}>
                            {assignment.title}
                          </span>
                          {isUrgent && assignment.status !== "completed" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {assignment.subject}
                        </div>
                      </div>
                    </TableCell>

                    {/* Course Code */}
                    <TableCell>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {assignment.courseCode}
                      </span>
                    </TableCell>

                    {/* Deadline */}
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                        <span
                          className={`font-mono ${
                            assignment.deadline.includes("Today")
                              ? "font-bold text-rose-600 dark:text-rose-400"
                              : assignment.deadline.includes("Tomorrow")
                              ? "font-semibold text-amber-600 dark:text-amber-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {assignment.deadline}
                        </span>
                      </div>
                    </TableCell>

                    {/* Priority Badge */}
                    <TableCell>
                      {renderPriorityBadge(assignment.priority)}
                    </TableCell>

                    {/* Status Badge (Click to quick cycle) */}
                    <TableCell onClick={(e) => handleCycleStatus(assignment.id, e)}>
                      <Tooltip content="Click to cycle status: To Do → In Progress → Completed → Planning">
                        <button
                          type="button"
                          className="transition-transform active:scale-95 cursor-pointer text-left"
                        >
                          {renderStatusBadge(assignment.status)}
                        </button>
                      </Tooltip>
                    </TableCell>

                    {/* Effort / Estimated Hours */}
                    <TableCell className="text-right font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {assignment.estimatedHours} hrs
                    </TableCell>

                    {/* Row Actions */}
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip content="AI Study Breakdown & Rubric">
                          <button
                            type="button"
                            onClick={() => setActiveDetailItem(assignment)}
                            className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Quick toggle completed">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssignments((prev) =>
                                prev.map((a) =>
                                  a.id === assignment.id
                                    ? { ...a, status: a.status === "completed" ? "todo" : "completed" }
                                    : a
                                )
                              );
                            }}
                            className={`p-1 rounded transition-colors ${
                              assignment.status === "completed"
                                ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                                : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Table Footer with Summary Stats */}
        <CardFooter className="py-3 px-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Critical: {assignments.filter((a) => a.priority === "critical").length}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              In Progress: {statusCounts.in_progress}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Completed: {statusCounts.completed} / {assignments.length} (
              {Math.round((statusCounts.completed / (assignments.length || 1)) * 100)}%)
            </span>
          </div>

          <div className="text-gray-400 font-mono text-[11px]">
            Tip: Click any status badge to cycle progress
          </div>
        </CardFooter>
      </Card>

      {/* Assignment Detail & AI Guidance Modal */}
      {activeDetailItem && (
        <Modal
          isOpen={Boolean(activeDetailItem)}
          onClose={() => setActiveDetailItem(null)}
          title={activeDetailItem.title}
          description={`${activeDetailItem.courseCode} • ${activeDetailItem.subject}`}
          size="lg"
        >
          <div className="space-y-4 pt-1">
            {/* Metadata Ribbons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700/80 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Deadline</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {activeDetailItem.deadline}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Estimated Effort</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {activeDetailItem.estimatedHours} Hours
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Priority</span>
                <div className="mt-0.5">{renderPriorityBadge(activeDetailItem.priority)}</div>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Status</span>
                <div className="mt-0.5">{renderStatusBadge(activeDetailItem.status)}</div>
              </div>
            </div>

            {/* AI Granite Smart Study Steps */}
            <div className="p-3.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                IBM Granite AI Suggested Milestone Plan
              </div>
              <ul className="text-xs text-blue-950 dark:text-blue-100/90 space-y-1.5 list-disc list-inside">
                <li>Review course lecture notes and reference implementation slides on Canvas.</li>
                <li>Write baseline unit tests before implementing the primary data structure / logic.</li>
                <li>Simulate edge conditions and verify memory overhead / algorithmic complexity.</li>
                <li>Package clean submission archive with code documentation and execution instructions.</li>
              </ul>
            </div>

            {/* Quick Status Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Set Status:</span>
                {(["todo", "in_progress", "completed"] as TaskStatus[]).map((st) => (
                  <Button
                    key={st}
                    variant={activeDetailItem.status === st ? "primary" : "secondary"}
                    size="sm"
                    className="text-xs py-1 h-7"
                    onClick={() => {
                      setAssignments((prev) =>
                        prev.map((a) => (a.id === activeDetailItem.id ? { ...a, status: st } : a))
                      );
                      setActiveDetailItem((prev) => (prev ? { ...prev, status: st } : null));
                    }}
                  >
                    {st === "todo" ? "To Do" : st === "in_progress" ? "In Progress" : "Completed"}
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveDetailItem(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Assignment Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Assignment"
          description="Create a new coursework task with priority and deadline tracking"
          size="md"
        >
          <form onSubmit={handleAddAssignment} className="space-y-3.5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                Assignment Title
              </label>
              <Input
                placeholder="e.g. Distributed Consensus Raft Implementation"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Course Code
                </label>
                <Select
                  value={newCourseCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setNewCourseCode(code);
                    if (code === "CS501") setNewSubject("Computer Networks");
                    else if (code === "CS502") setNewSubject("Database Systems");
                    else if (code === "CS503") setNewSubject("Data Science & AI");
                    else if (code === "CS504") setNewSubject("Cloud Architecture");
                    else if (code === "CS505") setNewSubject("Operating Systems");
                    else setNewSubject("Capstone Project");
                  }}
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Deadline
                </label>
                <Input
                  placeholder="e.g. Sep 30, 11:59 PM"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
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
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
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
                  Estimated Effort (Hours)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="40"
                  value={newHours}
                  onChange={(e) => setNewHours(parseFloat(e.target.value) || 1)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
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
                Save Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
