/**
 * Core Domain Models for CampusPilot - AI Student Success Copilot
 * Conforms to enterprise SaaS architectural standards and IBM Carbon specifications.
 */

export type PriorityLevel = "critical" | "high" | "medium" | "low";
export type TaskStatus = "todo" | "in_progress" | "completed" | "planning";
export type RiskLevel = "critical" | "high" | "moderate" | "safe";

export interface StudentProfile {
  id: string;
  name: string;
  avatarUrl: string;
  major: string;
  college: string;
  semester: string;
  currentPeriod: string;
  gradYear: string;
  currentGpa: number;
  targetGpa: number;
  classRank: string;
  attendanceRate: number;
  placementReadiness: number;
  academicHealthScore: number;
  email?: string;
  studentId?: string;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  trendText: string;
  trendDirection: "up" | "down" | "neutral";
  statusVariant: "default" | "success" | "warning" | "danger" | "purple";
  sparklineData?: number[];
  chartType?: "line" | "bar";
  iconKey?: "academic" | "attendance" | "assignments" | "placement" | "productivity" | string;
  badgeText?: string;
}

export interface ScheduleItem {
  id: string;
  timeRange: string;
  title: string;
  type: "Lecture" | "Lab" | "Mentor Sync" | "Self-Paced Study" | "Exam";
  location: string;
  mode: "In-Person" | "Online" | "Self-Study";
  isUrgent?: boolean;
}

export interface AssignmentItem {
  id: string;
  subject: string;
  title: string;
  deadline: string;
  priority: PriorityLevel;
  status: TaskStatus;
  estimatedHours: number;
  riskLevel: RiskLevel;
  courseCode: string;
}

export interface SmartRecommendation {
  id: string;
  title: string;
  recommendation: string;
  reason: string;
  expectedImpact: string;
  category: "academic" | "attendance" | "career" | "exam_prep";
  urgency: PriorityLevel;
  actionLabel: string;
  timestamp: string;
  confidenceScore?: number;
  confidenceLevel?: "High" | "Medium" | "Experimental";
  confidenceReason?: string;
  whyThisRecommendation?: {
    primaryTrigger: string;
    historicalContext: string;
    projectedOutcome: string;
    dataSources: string[];
    riskIfIgnored: string;
  };
}

export interface AttendanceRecord {
  subject: string;
  courseCode: string;
  percentage: number;
  attended: number;
  total: number;
  isCritical: boolean;
  color: string;
}

export interface ProductivityDay {
  day: string;
  actualHours: number;
  targetHours: number;
  cognitiveLoad: number; // 0-100 score
}

export interface ConversationalFeedItem {
  id: string;
  source: "Bob AI - Academic" | "Bob AI - Career Coach" | "System Alert";
  timestamp: string;
  message: string;
  actionPrimaryText?: string;
  actionSecondaryText?: string;
  badge?: string;
}

export interface AcademicSemesterTrend {
  semester: string;
  semesterNumber: number;
  gpa: number;
  cgpa: number;
  departmentAverage: number;
  creditsCompleted: number;
}

export interface SubjectStudyHours {
  subject: string;
  courseCode: string;
  loggedHours: number;
  targetHours: number;
  color: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  type: "Exam" | "Deadline" | "Workshop" | "Hackathon" | "Lecture" | "Career";
  date: string;
  time: string;
  daysRemaining: number;
  location: string;
  badgeVariant?: "danger" | "warning" | "purple" | "primary" | "neutral";
}

export type AcademicEventCategory = "deadline" | "exam" | "career" | "academic";

export interface AcademicEvent {
  id: string;
  title: string;
  type: "Exam" | "Deadline" | "Career" | "Lecture" | "Workshop" | "Milestone";
  category: AcademicEventCategory;
  courseCode?: string;
  courseName?: string;
  date: string; // "2026-09-14"
  displayDate: string; // "Sep 14, 2026"
  time: string; // "04:00 PM"
  location: string;
  daysRemaining: number;
  urgency: PriorityLevel;
  description?: string;
  weightage?: string;
  syllabusOrTopics?: string[];
  companyOrHost?: string;
  status?: "upcoming" | "in_progress" | "completed";
}
