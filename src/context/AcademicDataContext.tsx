import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  AssignmentItem,
  MetricCardData,
  ScheduleItem,
  AttendanceRecord,
  ProductivityDay,
  ConversationalFeedItem,
} from "../types";
import { academicService } from "../services/academicService";
import { toast } from "sonner";

interface AcademicDataContextType {
  metrics: MetricCardData[];
  schedule: ScheduleItem[];
  assignments: AssignmentItem[];
  attendance: AttendanceRecord[];
  productivity: ProductivityDay[];
  conversationalFeed: ConversationalFeedItem[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateAssignmentStatus: (id: string, status: AssignmentItem["status"]) => Promise<void>;
  addAssignment: (item: Omit<AssignmentItem, "id">) => Promise<void>;
}

const AcademicDataContext = createContext<AcademicDataContextType | undefined>(undefined);

export const AcademicDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [productivity, setProductivity] = useState<ProductivityDay[]>([]);
  const [conversationalFeed, setConversationalFeed] = useState<ConversationalFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [m, s, a, att, prod, feed] = await Promise.all([
        academicService.getDashboardMetrics(),
        academicService.getTodaySchedule(),
        academicService.getAssignments(),
        academicService.getAttendanceRecords(),
        academicService.getProductivityData(),
        academicService.getConversationalFeed(),
      ]);

      setMetrics(m.data);
      setSchedule(s.data);
      setAssignments(a.data);
      setAttendance(att.data);
      setProductivity(prod.data);
      setConversationalFeed(feed.data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load academic data";
      setError(errorMessage);
      toast.error("Could not load academic data", {
        description: "Showing cached data. Check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateAssignmentStatus = async (id: string, status: AssignmentItem["status"]) => {
    // Optimistic update — apply locally first, then persist
    setAssignments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    try {
      await academicService.updateAssignmentStatus(id, status);
    } catch (err: unknown) {
      // Roll back on failure
      const errorMessage = err instanceof Error ? err.message : "Failed to update status";
      toast.error("Status Update Failed", { description: errorMessage });
      // Re-fetch to restore consistent state
      const fresh = await academicService.getAssignments();
      setAssignments(fresh.data);
    }
  };

  const addAssignment = async (item: Omit<AssignmentItem, "id">) => {
    try {
      const res = await academicService.createAssignment(item);
      setAssignments((prev) => [res.data, ...prev]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add assignment";
      toast.error("Failed to Add Assignment", { description: errorMessage });
    }
  };

  return (
    <AcademicDataContext.Provider
      value={{
        metrics,
        schedule,
        assignments,
        attendance,
        productivity,
        conversationalFeed,
        isLoading,
        error,
        refreshData,
        updateAssignmentStatus,
        addAssignment,
      }}
    >
      {children}
    </AcademicDataContext.Provider>
  );
};

export const useAcademicData = (): AcademicDataContextType => {
  const context = useContext(AcademicDataContext);
  if (!context) {
    throw new Error("useAcademicData must be used within an AcademicDataProvider");
  }
  return context;
};
