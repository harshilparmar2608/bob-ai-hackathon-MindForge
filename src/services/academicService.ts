import {
  StudentProfile,
  MetricCardData,
  ScheduleItem,
  AssignmentItem,
  AttendanceRecord,
  ProductivityDay,
  ConversationalFeedItem,
} from "../types";
import {
  MOCK_METRICS,
  MOCK_TODAYS_SCHEDULE,
  MOCK_ASSIGNMENTS,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_PRODUCTIVITY_DAYS,
  MOCK_CONVERSATIONAL_FEED,
} from "./mockData";
import { ApiResponse } from "./types";
import { apiClient } from "./apiClient";

/**
 * Backend student profile shape (snake_case, matches
 * `StudentProfileRead` in backend/app/schemas/student.py).
 */
interface BackendStudentProfile {
  id: string;
  user_id: string;
  enrollment_number: string;
  major: string;
  college: string;
  semester: string;
  current_period: string;
  grad_year: string;
  avatar_url: string | null;
  current_gpa: number;
  target_gpa: number;
  class_rank: string | null;
  attendance_rate: number;
  placement_readiness: number;
  academic_health_score: number;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentProfileUpdatePayload {
  enrollmentNumber?: string;
  major?: string;
  college?: string;
  semester?: string;
  currentPeriod?: string;
  gradYear?: string;
  avatarUrl?: string;
  currentGpa?: number;
  targetGpa?: number;
  classRank?: string;
  attendanceRate?: number;
  placementReadiness?: number;
  academicHealthScore?: number;
}

/** Maps a backend `StudentProfileRead` payload into the frontend `StudentProfile` shape. */
function mapBackendProfile(p: BackendStudentProfile): StudentProfile {
  return {
    id: p.user_id,
    name: p.full_name || "Unknown",
    avatarUrl: p.avatar_url || "",
    major: p.major || "Unknown",
    college: p.college || "Unknown",
    semester: p.semester || "N/A",
    currentPeriod: p.current_period || "N/A",
    gradYear: p.grad_year || "N/A",
    currentGpa: p.current_gpa ?? 0,
    targetGpa: p.target_gpa ?? 0,
    classRank: p.class_rank || "N/A",
    attendanceRate: p.attendance_rate ?? 0,
    placementReadiness: p.placement_readiness ?? 0,
    academicHealthScore: p.academic_health_score ?? 0,
  };
}

/**
 * Academic Data Service Interface (Repository Pattern)
 * Decouples React UI from backend protocol (Mock -> FastAPI).
 */
export interface IAcademicService {
  getStudentProfile(): Promise<ApiResponse<StudentProfile>>;
  updateStudentProfile(payload: StudentProfileUpdatePayload): Promise<ApiResponse<StudentProfile>>;
  getDashboardMetrics(): Promise<ApiResponse<MetricCardData[]>>;
  getTodaySchedule(): Promise<ApiResponse<ScheduleItem[]>>;
  getAssignments(): Promise<ApiResponse<AssignmentItem[]>>;
  createAssignment(assignment: Omit<AssignmentItem, "id">): Promise<ApiResponse<AssignmentItem>>;
  updateAssignmentStatus(id: string, status: AssignmentItem["status"]): Promise<ApiResponse<AssignmentItem>>;
  getAttendanceRecords(): Promise<ApiResponse<AttendanceRecord[]>>;
  getProductivityData(): Promise<ApiResponse<ProductivityDay[]>>;
  getConversationalFeed(): Promise<ApiResponse<ConversationalFeedItem[]>>;
}

class AcademicServiceMock implements IAcademicService {
  private assignments = [...MOCK_ASSIGNMENTS];

  async getStudentProfile(): Promise<ApiResponse<StudentProfile>> {
    const { data } = await apiClient.get<BackendStudentProfile>("/student/profile");
    return {
      data: mapBackendProfile(data),
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async updateStudentProfile(payload: StudentProfileUpdatePayload): Promise<ApiResponse<StudentProfile>> {
    const body: Record<string, unknown> = {};
    if (payload.enrollmentNumber !== undefined) body.enrollment_number = payload.enrollmentNumber;
    if (payload.major !== undefined) body.major = payload.major;
    if (payload.college !== undefined) body.college = payload.college;
    if (payload.semester !== undefined) body.semester = payload.semester;
    if (payload.currentPeriod !== undefined) body.current_period = payload.currentPeriod;
    if (payload.gradYear !== undefined) body.grad_year = payload.gradYear;
    if (payload.avatarUrl !== undefined) body.avatar_url = payload.avatarUrl;
    if (payload.currentGpa !== undefined) body.current_gpa = payload.currentGpa;
    if (payload.targetGpa !== undefined) body.target_gpa = payload.targetGpa;
    if (payload.classRank !== undefined) body.class_rank = payload.classRank;
    if (payload.attendanceRate !== undefined) body.attendance_rate = payload.attendanceRate;
    if (payload.placementReadiness !== undefined) body.placement_readiness = payload.placementReadiness;
    if (payload.academicHealthScore !== undefined) body.academic_health_score = payload.academicHealthScore;

    const { data } = await apiClient.put<BackendStudentProfile>("/student/profile", body);
    return {
      data: mapBackendProfile(data),
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async getDashboardMetrics(): Promise<ApiResponse<MetricCardData[]>> {
    return {
      data: MOCK_METRICS,
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async getTodaySchedule(): Promise<ApiResponse<ScheduleItem[]>> {
    return {
      data: MOCK_TODAYS_SCHEDULE,
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async getAssignments(): Promise<ApiResponse<AssignmentItem[]>> {
    return {
      data: this.assignments,
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async createAssignment(assignment: Omit<AssignmentItem, "id">): Promise<ApiResponse<AssignmentItem>> {
    const newItem: AssignmentItem = {
      ...assignment,
      id: `asg-${Date.now()}`,
    };
    this.assignments = [newItem, ...this.assignments];
    return {
      data: newItem,
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async updateAssignmentStatus(id: string, status: AssignmentItem["status"]): Promise<ApiResponse<AssignmentItem>> {
    const target = this.assignments.find((a) => a.id === id);
    if (!target) {
      throw new Error(`Assignment with ID ${id} not found`);
    }
    target.status = status;
    return {
      data: { ...target },
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async getAttendanceRecords(): Promise<ApiResponse<AttendanceRecord[]>> {
    return {
      data: MOCK_ATTENDANCE_RECORDS,
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async getProductivityData(): Promise<ApiResponse<ProductivityDay[]>> {
    return {
      data: MOCK_PRODUCTIVITY_DAYS,
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async getConversationalFeed(): Promise<ApiResponse<ConversationalFeedItem[]>> {
    return {
      data: MOCK_CONVERSATIONAL_FEED,
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }
}

export const academicService: IAcademicService = new AcademicServiceMock();
