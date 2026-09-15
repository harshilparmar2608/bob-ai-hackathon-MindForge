import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  BookOpen,
  Laptop,
  Users,
  Brain,
  ChevronRight,
  Sparkles,
  CalendarCheck2,
  BellRing,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Timeline,
  TimelineItem,
  CalendarCard,
  Badge,
  Button,
  Tooltip,
} from "../ui";
import { ScheduleItem, UpcomingEvent } from "../../types";
import {
  MOCK_TODAYS_SCHEDULE,
  MOCK_UPCOMING_EVENTS,
  MOCK_SCHEDULE_CALENDAR_DAYS,
} from "../../services/mockData";

export interface DashboardScheduleSectionProps {
  schedule?: ScheduleItem[];
  upcomingEvents?: UpcomingEvent[];
  className?: string;
  onSelectEvent?: (eventId: string) => void;
  onJoinMeeting?: (item: ScheduleItem) => void;
}

const getScheduleIcon = (type: ScheduleItem["type"]) => {
  switch (type) {
    case "Lecture":
      return <BookOpen className="w-3.5 h-3.5" />;
    case "Lab":
      return <Laptop className="w-3.5 h-3.5" />;
    case "Mentor Sync":
      return <Users className="w-3.5 h-3.5" />;
    case "Self-Paced Study":
      return <Brain className="w-3.5 h-3.5" />;
    case "Exam":
      return <AlertTriangle className="w-3.5 h-3.5" />;
    default:
      return <Clock className="w-3.5 h-3.5" />;
  }
};

const getScheduleBadgeColor = (type: ScheduleItem["type"], isUrgent?: boolean) => {
  if (isUrgent) return "rose";
  switch (type) {
    case "Lecture":
      return "blue";
    case "Lab":
      return "purple";
    case "Mentor Sync":
      return "green";
    case "Self-Paced Study":
      return "amber";
    case "Exam":
      return "rose";
    default:
      return "gray";
  }
};

export const DashboardScheduleSection: React.FC<DashboardScheduleSectionProps> = ({
  schedule = MOCK_TODAYS_SCHEDULE,
  upcomingEvents = MOCK_UPCOMING_EVENTS,
  className,
  onSelectEvent,
  onJoinMeeting,
}) => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<number>(14);

  // Map ScheduleItem to TimelineItem for the reusable Timeline component
  const timelineItems: TimelineItem[] = schedule.map((item, index) => {
    const isCurrent = index === 1; // Mark the 11:00 AM Lab as currently active/approaching
    const isCompleted = index === 0; // Mark the 09:00 AM Lecture as completed

    return {
      id: item.id,
      time: item.timeRange,
      title: item.title,
      description: `${item.location} • ${item.mode}`,
      badge: item.isUrgent ? "Attendance Critical" : item.type,
      badgeColor: getScheduleBadgeColor(item.type, item.isUrgent),
      status: isCurrent ? "current" : isCompleted ? "completed" : "upcoming",
      icon: getScheduleIcon(item.type),
    };
  });

  return (
    <div
      id="dashboard-schedule-section"
      aria-label="Today's Schedule & Academic Calendar"
      className={`space-y-4 ${className || ""}`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <CalendarCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Today's Schedule & Academic Timeline
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Interactive timeline, 7-day calendar preview, and upcoming deadlines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm" dot>
            4 Sessions Today
          </Badge>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 hidden sm:inline">
            Sep 14, 2026
          </span>
        </div>
      </div>

      {/* 12-Column Responsive Layout: Left (7 Cols) = Today's Timeline, Right (5 Cols) = Calendar Strip + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Today's Interactive Schedule Timeline */}
        <Card
          variant="default"
          className="lg:col-span-7 flex flex-col justify-between border-gray-200/90 dark:border-gray-800"
        >
          <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800/80">
            <div className="flex items-center justify-between w-full">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Today's Sequence</span>
                  <span className="text-[11px] font-normal text-gray-400">
                    (Monday, Sep 14)
                  </span>
                </CardTitle>
                <CardDescription>
                  Real-time schedule synchronized with university timetable & Canvas LMS
                </CardDescription>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Live Track
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-4">
            {/* Urgent Alert Banner within Timeline */}
            <div className="mb-4 p-2.5 rounded-lg bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 dark:text-rose-200">
                <span className="font-bold">Next Session Alert:</span> Database Systems
                Lab starts at 11:00 AM (Lab 03). Current attendance is 73.5% — presence is
                required to remain examination eligible.
              </div>
            </div>

            {/* Reusable Phase 2 Timeline Component */}
            <Timeline items={timelineItems} />
          </CardContent>

          <CardFooter className="py-3 px-5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Completed (1)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Active / Next (1)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                Upcoming (2)
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-xs font-semibold"
              onClick={() => onJoinMeeting?.(schedule[1])}
            >
              Session Details
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </CardFooter>
        </Card>

        {/* Right Column: 7-Day Calendar Strip + Upcoming Events Deck */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* 1. Calendar Preview Card */}
          <Card
            variant="default"
            className="border-gray-200/90 dark:border-gray-800"
          >
            <CardHeader className="pb-2.5">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">
                    7-Day Calendar Strip
                  </CardTitle>
                </div>
                <span className="text-xs font-mono font-medium text-gray-500 dark:text-gray-400">
                  Week 3 of Term
                </span>
              </div>
              <CardDescription>
                Select day to preview classes, deadlines, and exam schedules
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-1 pb-3">
              {/* Reusable CalendarCard component from Phase 2 */}
              <CalendarCard
                days={MOCK_SCHEDULE_CALENDAR_DAYS}
                selectedDay={selectedDay}
                onSelectDay={(day) => setSelectedDay(day)}
              />

              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Red dot: Exam
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Amber dot: Assignment Due
                </span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Day {selectedDay}: {selectedDay === 14 ? "4 Events" : "Standard Schedule"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 2. Upcoming Academic Events Card */}
          <Card
            variant="default"
            className="border-gray-200/90 dark:border-gray-800 flex-1 flex flex-col justify-between"
          >
            <CardHeader className="pb-2.5">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">
                    Upcoming Deadlines & Events
                  </CardTitle>
                </div>
                <Badge variant="purple" size="sm">
                  5 Key Milestones
                </Badge>
              </div>
              <CardDescription>
                Critical examinations, assignment cutoffs, and campus hackathons
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 pb-2 space-y-2.5">
              {upcomingEvents.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent?.(evt.id)}
                  className="p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50/40 dark:bg-gray-800/30 transition-all hover:shadow-2xs cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {evt.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {evt.date} • {evt.time}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {evt.location}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <Badge variant={evt.badgeVariant || "neutral"} size="sm">
                      {evt.daysRemaining === 0 ? "Today" : `${evt.daysRemaining}d left`}
                    </Badge>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      {evt.type}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>

            <CardFooter className="py-2.5 px-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                Synced with Google Calendar & LMS
              </span>
              <button
                type="button"
                onClick={() => navigate("/calendar")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-0.5"
              >
                View Academic Timeline & Calendar
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
