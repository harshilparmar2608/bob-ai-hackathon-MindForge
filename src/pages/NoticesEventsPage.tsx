import React, { useState } from "react";
import {
  BellRing,
  Calendar,
  Sparkles,
  Trophy,
  Briefcase,
  BookOpen,
  ArrowUpRight,
  Clock,
  MapPin,
  Bookmark,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { APP_CONFIG } from "../lib/constants";

interface NoticeItem {
  id: string;
  title: string;
  category: "Academic" | "Exam" | "Placement" | "Campus Life";
  date: string;
  description: string;
  isUrgent?: boolean;
  department: string;
  actionUrl?: string;
  read?: boolean;
}

interface EventItem {
  id: string;
  title: string;
  type: "Hackathon" | "Seminar" | "Placement Drive" | "Workshop";
  date: string;
  time: string;
  location: string;
  daysRemaining: number;
  prizeOrCriteria: string;
  badgeColor: string;
  description: string;
  organizer: string;
  registered?: boolean;
}

export const NoticesEventsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [bookmarkedNotices, setBookmarkedNotices] = useState<Record<string, boolean>>({});
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({
    "evt-1": true, // IBM Granite Hackathon pre-registered
  });

  const notices: NoticeItem[] = [
    {
      id: "ntc-1",
      title: "IBM Granite AI Hackathon Registration Extended",
      category: "Placement",
      date: "Sep 14, 2026",
      description:
        "The national hackathon registration deadline has been extended by 48 hours. Participants will gain access to watsonx.ai foundation models, IBM mentors, and an exclusive fast-track hiring interview pipeline.",
      isUrgent: true,
      department: "Innovation & Placement Cell",
    },
    {
      id: "ntc-2",
      title: "Mid-Semester Lab Practical Examination Schedule (Fall 2024)",
      category: "Exam",
      date: "Sep 13, 2026",
      description:
        "Practical examinations for CS502L (Database Systems Lab) and CS505L (Operating Systems Lab) will begin on September 17. Hall ticket allocation is active in the student portal.",
      isUrgent: true,
      department: "Office of the Controller of Examinations",
    },
    {
      id: "ntc-3",
      title: "75% Mandatory Attendance Compliance Audit Notice",
      category: "Academic",
      date: "Sep 12, 2026",
      description:
        "Biometric logs will be audited on September 25. Students currently below 75% attendance in any theory or lab component must meet their respective faculty advisors for remedial logging.",
      isUrgent: false,
      department: "Dean of Academic Affairs",
    },
    {
      id: "ntc-4",
      title: "Pre-Placement Drive Announcement: IBM Early Careers 2026",
      category: "Placement",
      date: "Sep 11, 2026",
      description:
        "IBM Cloud & AI Software Engineering roles will open applications for 5th & 7th semester students. Minimum CGPA criterion: 3.50. Shortlisting will prioritize verifiable GitHub projects in AI & containerization.",
      isUrgent: false,
      department: "Career & Placement Office",
    },
    {
      id: "ntc-5",
      title: "Campus Library & AI Computing Sandbox Extended Hours",
      category: "Campus Life",
      date: "Sep 10, 2026",
      description:
        "To support upcoming midterms and hackathon submissions, the central library GPU workstations and 4th-floor study pods will remain accessible 24/7 through October 05.",
      isUrgent: false,
      department: "University Facilities & Services",
    },
  ];

  const upcomingEvents: EventItem[] = [
    {
      id: "evt-1",
      title: "IBM Granite AI Hackathon & Pitch Day",
      type: "Hackathon",
      date: "Sep 24, 2026",
      time: "09:00 AM - 06:00 PM",
      location: "University Innovation Hub & Virtual",
      daysRemaining: 10,
      prizeOrCriteria: "$10,000 Prize Pool • Fast-Track IBM Interviews",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      description:
        "Build enterprise AI agents utilizing IBM Granite 3.0 foundation models. Mentored directly by IBM software architects.",
      organizer: `IBM Academic Initiative & ${APP_CONFIG.universityName}`,
    },
    {
      id: "evt-2",
      title: "Cloud Infrastructure & Kubernetes Architecture Workshop",
      type: "Seminar",
      date: "Sep 28, 2026",
      time: "02:00 PM - 04:30 PM",
      location: "Auditorium Hall 2",
      daysRemaining: 14,
      prizeOrCriteria: "Hands-on Lab Certificate Provided",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      description:
        "Deep dive into multi-region container orchestration, service meshes, and enterprise deployment resilience.",
      organizer: "CS Dept Cloud Computing SIG",
    },
    {
      id: "evt-3",
      title: "IBM Early Careers Pre-Placement Talk & Q&A",
      type: "Placement Drive",
      date: "Oct 05, 2026",
      time: "10:30 AM - 12:30 PM",
      location: "Main Convention Center",
      daysRemaining: 21,
      prizeOrCriteria: "Open to Students with GPA >= 3.5",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      description:
        "Interact with senior hiring managers and university alumni currently working on Watsonx, OpenShift, and AI research.",
      organizer: `${APP_CONFIG.universityName} Placement Directorate`,
    },
  ];

  const filteredNotices =
    activeTab === "all"
      ? notices
      : notices.filter(
          (n) => n.category.toLowerCase() === activeTab.toLowerCase()
        );

  const toggleBookmark = (id: string) => {
    setBookmarkedNotices((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleRegister = (id: string) => {
    setRegisteredEvents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <BellRing className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Notices & Upcoming Events</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Official campus broadcasts, exam circulations, hackathons, and placement schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summarize with AI</span>
          </Link>
        </div>
      </div>

      {/* 1. UPCOMING EVENTS SECTION (Hackathons, Seminars, Placement drives) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Featured Events & Hackathons
            </h2>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            3 High-Priority Events
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {upcomingEvents.map((evt) => {
            const isRegistered = !!registeredEvents[evt.id];

            return (
              <div
                key={evt.id}
                id={`event-card-${evt.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category Pill & Countdown */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${evt.badgeColor}`}
                    >
                      {evt.type}
                    </span>

                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                      {evt.daysRemaining} days left
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {evt.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
                      <Trophy className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{evt.prizeOrCriteria}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400 truncate">
                    {evt.organizer}
                  </span>

                  <button
                    onClick={() => toggleRegister(evt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isRegistered
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
                    }`}
                  >
                    {isRegistered ? "Registered ✓" : "RSVP / Register"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. CAMPUS NOTICES & CIRCULARS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Campus Circulars & Bulletins
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {["all", "academic", "exam", "placement"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-blue-600 text-white font-semibold shadow-2xs"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Notices Cards */}
        <div className="space-y-3.5">
          {filteredNotices.map((notice) => {
            const isBookmarked = !!bookmarkedNotices[notice.id];

            return (
              <div
                key={notice.id}
                id={`notice-card-${notice.id}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {notice.category}
                    </span>

                    {notice.isUrgent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        Urgent Circular
                      </span>
                    )}

                    <span className="text-xs text-gray-400">
                      {notice.date}
                    </span>

                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {notice.department}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {notice.title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
                    {notice.description}
                  </p>
                </div>

                {/* Bookmark & AI Ask */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => toggleBookmark(notice.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isBookmarked
                        ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:border-amber-800"
                        : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-gray-200 dark:border-gray-700"
                    }`}
                    title={isBookmarked ? "Remove Bookmark" : "Save Notice"}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <Link
                    to="/assistant"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Explain Notice</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
