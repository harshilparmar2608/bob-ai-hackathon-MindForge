import { NavItem } from "../types/navigation";

export const APP_CONFIG = {
  name: "CampusPilot",
  tagline: "AI Student Success Copilot",
  organization: "MindForge AI • Powered by IBM Granite",
  // Institution branding — kept in one place instead of scattered literals.
  // Student identity (name, email, major, college, semester) always comes from
  // the authenticated backend user via AuthContext / StudentContext.
  universityName: "Techford University",
  studentEmailDomain: "techford.edu",
  version: "1.0.0-carbon",
  thresholdAttendance: 75,
};

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    iconName: "LayoutDashboard",
    description: "Academic overview & quick campus metrics",
  },
  {
    id: "assistant",
    label: "AI Assistant",
    path: "/assistant",
    iconName: "Bot",
    badge: "Granite",
    badgeVariant: "purple",
    description: "ChatGPT-style AI campus copilot",
  },
  {
    id: "assignments",
    label: "Assignments",
    path: "/assignments",
    iconName: "CheckSquare",
    badge: 2,
    badgeVariant: "amber",
    description: "Active coursework, submissions & deadlines",
  },
  {
    id: "planner",
    label: "Study Planner",
    path: "/planner",
    iconName: "Compass",
    badge: "AI",
    badgeVariant: "blue",
    description: "AI-generated study schedule & exam roadmap",
  },
  {
    id: "attendance",
    label: "Attendance",
    path: "/attendance",
    iconName: "BookOpen",
    badge: "86.4%",
    badgeVariant: "blue",
    description: "Subject-wise attendance & recovery insights",
  },
  {
    id: "notes",
    label: "AI Notes",
    path: "/notes",
    iconName: "FileText",
    description: "Lecture summaries, Leitner flashcards & quizzes",
  },
  {
    id: "career",
    label: "Career Copilot",
    path: "/career",
    iconName: "Briefcase",
    badge: "84/100",
    badgeVariant: "blue",
    description: "Placement readiness & dream company skill gaps",
  },
  {
    id: "recommendations",
    label: "AI Recommendations",
    path: "/recommendations",
    iconName: "Sparkles",
    badge: "AI",
    badgeVariant: "purple",
    description: "IBM Granite AI-powered personalised insights",
  },
  {
    id: "timetable",
    label: "Timetable",
    path: "/timetable",
    iconName: "Calendar",
    description: "Daily class schedule & active room status",
  },
  {
    id: "notices",
    label: "Notices & Events",
    path: "/notices",
    iconName: "BellRing",
    badge: 3,
    badgeVariant: "amber",
    description: "Campus announcements, hackathons & placement drives",
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    iconName: "Settings",
    description: "Student profile, preferences & AI settings",
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [];
