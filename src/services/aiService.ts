import { SmartRecommendation } from "../types";
import { MOCK_SMART_RECOMMENDATIONS } from "./mockData";
import { ApiResponse } from "./types";

/**
 * AI & IBM Bob Decision Intelligence Service Interface
 * Strictly structures outputs into [Recommendation], [Reason], and [Expected Impact].
 */
export interface IAiService {
  getSmartRecommendations(): Promise<ApiResponse<SmartRecommendation[]>>;
  generateMorningBrief(studentName: string): Promise<ApiResponse<{
    greeting: string;
    summary: string;
    criticalAlertCount: number;
    recommendedFocusBlock: string;
  }>>;
  dismissRecommendation(id: string): Promise<ApiResponse<{ dismissed: boolean }>>;
}

class AiServiceMock implements IAiService {
  private recommendations = [...MOCK_SMART_RECOMMENDATIONS];

  async getSmartRecommendations(): Promise<ApiResponse<SmartRecommendation[]>> {
    return {
      data: this.recommendations,
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async generateMorningBrief(studentName: string): Promise<ApiResponse<{
    greeting: string;
    summary: string;
    criticalAlertCount: number;
    recommendedFocusBlock: string;
  }>> {
    // Greet the authenticated user by their backend-provided name.
    const displayName = studentName && studentName.trim() ? studentName.trim() : "Student";
    return {
      data: {
        greeting: `Good morning, ${displayName}. I have analyzed your schedule, assignments, and study metrics.`,
        summary: "Today's most critical priority is your upcoming class, followed by your next assignment deadline.",
        criticalAlertCount: 1,
        recommendedFocusBlock: "04:00 PM - 06:00 PM (Focused Revision)",
      },
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }

  async dismissRecommendation(id: string): Promise<ApiResponse<{ dismissed: boolean }>> {
    this.recommendations = this.recommendations.filter((r) => r.id !== id);
    return {
      data: { dismissed: true },
      status: "success",
      timestamp: new Date().toISOString(),
    };
  }
}

export const aiService: IAiService = new AiServiceMock();
