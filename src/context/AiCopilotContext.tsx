import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SmartRecommendation } from "../types";
import { aiService } from "../services/aiService";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface AiCopilotContextType {
  recommendations: SmartRecommendation[];
  morningBrief: {
    greeting: string;
    summary: string;
    criticalAlertCount: number;
    recommendedFocusBlock: string;
  } | null;
  isLoading: boolean;
  dismissRecommendation: (id: string) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
}

const AiCopilotContext = createContext<AiCopilotContextType | undefined>(undefined);

export const AiCopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [morningBrief, setMorningBrief] = useState<{
    greeting: string;
    summary: string;
    criticalAlertCount: number;
    recommendedFocusBlock: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authenticated user's first name drives the AI morning brief greeting.
  const userName = user?.name || "Unknown";

  const refreshRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const [recs, brief] = await Promise.all([
        aiService.getSmartRecommendations(),
        aiService.generateMorningBrief(userName),
      ]);
      setRecommendations(recs.data);
      setMorningBrief(brief.data);
    } catch (err) {
      console.error("Failed to load AI recommendations", err);
      toast.error("Could not load AI recommendations", {
        description: "Showing cached insights. Check your connection.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userName]);

  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  const dismissRecommendation = async (id: string) => {
    // Optimistic removal
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
    try {
      await aiService.dismissRecommendation(id);
    } catch (err) {
      console.error("Failed to dismiss recommendation", err);
      // Restore on failure by re-fetching
      const fresh = await aiService.getSmartRecommendations().catch(() => null);
      if (fresh) setRecommendations(fresh.data);
    }
  };

  return (
    <AiCopilotContext.Provider
      value={{
        recommendations,
        morningBrief,
        isLoading,
        dismissRecommendation,
        refreshRecommendations,
      }}
    >
      {children}
    </AiCopilotContext.Provider>
  );
};

export const useAiCopilot = (): AiCopilotContextType => {
  const context = useContext(AiCopilotContext);
  if (!context) {
    throw new Error("useAiCopilot must be used within an AiCopilotProvider");
  }
  return context;
};
