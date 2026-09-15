import React from "react";
import { AcademicTimelineCalendar } from "../components/calendar/AcademicTimelineCalendar";

export const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <AcademicTimelineCalendar defaultView="timeline" />
    </div>
  );
};
