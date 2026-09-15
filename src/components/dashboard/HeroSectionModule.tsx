import React from "react";
import { StudentGreeting } from "./StudentGreeting";
import { DashboardHero } from "./DashboardHero";
import { useStudent } from "../../context/StudentContext";
import { useAuth } from "../../context/AuthContext";
import { useAiCopilot } from "../../context/AiCopilotContext";

export interface HeroSectionModuleProps {
  onLaunchStudySession?: () => void;
  onViewRecommendations?: () => void;
  onAskBob?: () => void;
}

export const HeroSectionModule: React.FC<HeroSectionModuleProps> = ({
  onLaunchStudySession,
  onViewRecommendations,
  onAskBob,
}) => {
  const { student } = useStudent();
  const { user } = useAuth();
  const { morningBrief } = useAiCopilot();

  // Use authenticated user data, fallback to student context for academic data
  const displayStudent = student ? {
    ...student,
    name: user?.name || student.name,
    avatarUrl: user?.avatarUrl || student.avatarUrl,
    major: user?.major || student.major,
    semester: user?.semester || student.semester,
    college: user?.college || student.college,
  } : null;

  return (
    <section aria-label="CampusPilot Executive Overview" className="space-y-5">
      {/* Top Greeting & Student Profile Info */}
      <StudentGreeting student={displayStudent} />

      {/* Hero Analytics & IBM Granite AI Morning Brief */}
      <DashboardHero
        student={displayStudent}
        aiBrief={morningBrief}
        onLaunchStudySession={onLaunchStudySession}
        onViewRecommendations={onViewRecommendations}
        onAskBob={onAskBob}
      />
    </section>
  );
};
