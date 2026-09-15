/**
 * Chat service for the AI Assistant feature.
 *
 * Calls POST /api/v1/ai/chat and GET /api/v1/ai/status.
 * Supports a streaming-style word-by-word animation by resolving the full
 * response and yielding it character-by-character via an async generator.
 */

import { apiClient } from "./apiClient";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: ChatMessage;
  model_id: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface AiStatusResponse {
  enabled: boolean;
  model_id: string;
  status: "online" | "mock" | "offline";
  message: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Send the full conversation history to the backend and receive the next
 * assistant reply.  The last message in the array must have role "user".
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/ai/chat", {
    messages,
    max_tokens: options?.maxTokens ?? 1024,
    temperature: options?.temperature ?? 0.7,
  });
  return data;
}

/**
 * Fetch the current AI service status (live Granite vs. mock mode).
 */
export async function fetchAiStatus(): Promise<AiStatusResponse> {
  const { data } = await apiClient.get<AiStatusResponse>("/ai/status");
  return data;
}

// ─── Streaming simulation ─────────────────────────────────────────────────────

/**
 * Async generator that yields the full `text` string one character at a time
 * with a small random delay, simulating a streaming typewriter effect.
 * Because the backend returns the full text in one response (not SSE), we
 * simulate streaming purely on the client side.
 *
 * @param text      The full assistant reply text.
 * @param baseDelay Base delay per character in milliseconds (default 12 ms).
 */
export async function* streamText(
  text: string,
  baseDelay = 12
): AsyncGenerator<string, void, unknown> {
  let accumulated = "";
  for (const char of text) {
    accumulated += char;
    yield accumulated;
    // Slightly faster on whitespace/punctuation for a natural feel
    const delay =
      char === " " || char === "\n"
        ? baseDelay * 0.4
        : char === "." || char === "!" || char === "?"
        ? baseDelay * 3
        : baseDelay + Math.random() * 6;
    await new Promise<void>((resolve) => setTimeout(resolve, delay));
  }
}
