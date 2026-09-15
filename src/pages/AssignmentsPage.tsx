import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import { useAcademicData } from "../context/AcademicDataContext";
import { AssignmentItem, PriorityLevel, TaskStatus } from "../types";
import { toast } from "sonner";

export const AssignmentsPage: React.FC = () => {
  const { assignments, isLoading, updateAssignmentStatus, addAssignment } = useAcademicData();

  const [activeTab, setActiveTab] = useState<"all" | TaskStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New assignment form state
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Database Systems Lab");
  const [newCourseCode, setNewCourseCode] = useState("CS502L");
  const [newDeadline, setNewDeadline] = useState("Tomorrow, 11:59 PM");
  const [newPriority, setNewPriority] = useState<PriorityLevel>("high");
  const [newEstimatedHours, setNewEstimatedHours] = useState(3.5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered assignments
  const filteredAssignments = assignments.filter((item) => {
    const matchesTab = activeTab === "all" ? true : item.status === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate metrics
  const totalCount = assignments.length;
  const pendingCount = assignments.filter((a) => a.status === "todo" || a.status === "in_progress").length;
  const completedCount = assignments.filter((a) => a.status === "completed").length;
  const criticalCount = assignments.filter((a) => a.priority === "critical" && a.status !== "completed").length;

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    try {
      await updateAssignmentStatus(id, newStatus);
      const target = assignments.find((a) => a.id === id);
      toast.success("Status Updated", {
        description: `"${target?.title || "Task"}" marked as ${newStatus.replace("_", " ")}.`,
      });
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a title for the assignment");
      return;
    }

    setIsSubmitting(true);
    try {
      await addAssignment({
        title: newTitle.trim(),
        subject: newSubject,
        courseCode: newCourseCode,
        deadline: newDeadline,
        priority: newPriority,
        status: "todo",
        estimatedHours: Number(newEstimatedHours) || 2,
        riskLevel: newPriority === "critical" ? "critical" : "moderate",
      });

      toast.success("Assignment Added", {
        description: `Scheduled "${newTitle}" with Bob AI timeline evaluation.`,
      });

      setNewTitle("");
      setIsModalOpen(false);
    } catch {
      toast.error("Failed to add assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Assignments & Deadlines</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track coursework, deadlines, and IBM Granite AI completion risk assessments.
          </p>
        </div>

        <button
          id="add-assignment-btn"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Coursework
          </span>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
            {totalCount}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Across 5 enrolled courses</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Pending / In Progress
          </span>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
            {pendingCount}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Action required</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Completed Tasks
          </span>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
            {completedCount}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}% completion rate` : "No tasks"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xs">
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Critical Risk
          </span>
          <div className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
            {criticalCount}
          </div>
          <p className="text-xs text-rose-500 mt-0.5">High urgency cutoff</p>
        </div>
      </div>

      {/* Controls Bar: Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
          {(
            [
              { id: "all" as const, label: "All Tasks" },
              { id: "todo" as const, label: "To Do" },
              { id: "in_progress" as const, label: "In Progress" },
              { id: "completed" as const, label: "Completed" },
            ]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#161c28] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#161c28] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 animate-pulse flex items-center justify-between"
            >
              <div className="space-y-2 w-2/3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-24" />
            </div>
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-[#161c28] border border-dashed border-gray-300 dark:border-gray-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No assignments found
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No coursework matched "${searchQuery}". Try a different keyword.`
              : "All tasks in this category are clear! Enjoy your study break."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((task) => {
            const isDone = task.status === "completed";
            const isCritical = task.priority === "critical";

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`p-5 rounded-2xl bg-white dark:bg-[#161c28] border transition-all ${
                  isDone
                    ? "border-gray-200 dark:border-gray-800/60 opacity-75"
                    : isCritical
                    ? "border-rose-300 dark:border-rose-900/60 shadow-2xs"
                    : "border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Quick Complete Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(task.id, isDone ? "todo" : "completed")
                      }
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isDone
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                      }`}
                      title={isDone ? "Mark as To Do" : "Mark as Completed"}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {task.courseCode}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {task.subject}
                        </span>

                        {isCritical && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Critical Priority</span>
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold text-gray-900 dark:text-white ${
                          isDone ? "line-through text-gray-400 dark:text-gray-500" : ""
                        }`}
                      >
                        {task.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Due: {task.deadline}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Est: {task.estimatedHours}h</span>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                          <Sparkles className="w-3 h-3" />
                          <span>Bob AI Risk: {task.riskLevel.toUpperCase()}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown Selector */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value as TaskStatus)
                      }
                      className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Add Academic Assignment</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus Raft Protocol Implementation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    placeholder="CS501"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Course / Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Computer Networks"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Deadline Description
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    placeholder="Friday, 05:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="critical">Critical (Immediate)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Estimated Hours Required
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="40"
                  value={newEstimatedHours}
                  onChange={(e) => setNewEstimatedHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a2232] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Create Assignment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
