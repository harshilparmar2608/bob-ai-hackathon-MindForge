import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { StudentProfile } from "../types";
import { useAuth } from "./AuthContext";
import { academicService } from "../services/academicService";

interface StudentContextType {
  student: StudentProfile | null;
  isAiOnline: boolean;
  aiModelVersion: string;
  unreadNotificationsCount: number;
  refreshStudent: () => Promise<void>;
  updateStudent: (updates: Partial<StudentProfile>) => void;
}

// Null-safe academic defaults — applied ONLY when the backend returns no
// value (or the request fails). Identity values come exclusively from the
// authenticated user / backend profile; never from a hard-coded demo.
const NULL_SAFE_ACADEMIC_DEFAULTS = {
  avatarUrl: "",
  major: "Unknown",
  college: "Unknown",
  semester: "N/A",
  currentPeriod: "N/A",
  gradYear: "N/A",
  currentGpa: 0,
  targetGpa: 0,
  classRank: "N/A",
  attendanceRate: 0,
  placementReadiness: 0,
  academicHealthScore: 0,
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isAiOnline] = useState<boolean>(true);
  const [aiModelVersion] = useState<string>("IBM Granite 7.1");
  const [unreadNotificationsCount] = useState<number>(0);

  const refreshStudent = useCallback(async () => {
    if (!user) return;
    try {
      const res = await academicService.getStudentProfile();
      setStudent(() => ({
        ...NULL_SAFE_ACADEMIC_DEFAULTS,
        // Prefer values already present in AuthContext (name, email, etc.)
        ...(user ? { id: user.id, name: user.name, email: user.email } : {}),
        ...res.data,
        id: res.data.id || user.id,
        name: res.data.name,
      }));
    } catch (err: unknown) {
      // Backend profile unavailable — keep whatever we have seeded from auth.
      setStudent((prev) => ({
        ...NULL_SAFE_ACADEMIC_DEFAULTS,
        ...prev,
        ...(user ? { id: user.id, name: user.name, email: user.email } : {}),
      }));
      console.warn("Could not load student profile", err);
    }
  }, [user]);

  // Seed state from AuthContext on mount and whenever the authenticated user
  // changes (login / logout / refresh). The academic numbers are fetched in
  // the background so the UI always shows the authenticated user's identity.
  useEffect(() => {
    if (user) {
      setStudent({
        ...NULL_SAFE_ACADEMIC_DEFAULTS,
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        major: user.major,
        college: user.college,
        semester: user.semester,
        studentId: user.studentId,
      });
      // Fetch the full academic profile from the backend.
      void refreshStudent();
    } else {
      setStudent(null);
    }
  }, [user, refreshStudent]);

  const updateStudent = (updates: Partial<StudentProfile>) => {
    setStudent((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <StudentContext.Provider
      value={{
        student,
        isAiOnline,
        aiModelVersion,
        unreadNotificationsCount,
        refreshStudent,
        updateStudent,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
};
