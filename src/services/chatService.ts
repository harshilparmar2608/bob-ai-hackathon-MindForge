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

// ─── JSON extraction & repair utility ─────────────────────────────────────────

function tryRepairTruncatedJson(str: string): string {
  let cleaned = str.trim();
  cleaned = cleaned.replace(/,\s*$/, "");

  let inString = false;
  let escape = false;
  const stack: string[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}" && stack[stack.length - 1] === "{") {
        stack.pop();
      } else if (char === "]" && stack[stack.length - 1] === "[") {
        stack.pop();
      }
    }
  }

  if (inString) {
    cleaned += '"';
  }

  cleaned = cleaned.replace(/,\s*$/, "");

  while (stack.length > 0) {
    const opening = stack.pop();
    if (opening === "{") cleaned += "}";
    if (opening === "[") cleaned += "]";
  }

  return cleaned;
}

/**
 * Safely extracts and parses JSON from AI text responses.
 * Handles markdown code fences (```json ... ```), extra commentary before/after,
 * trailing commas, and auto-repairs truncated JSON payloads.
 */
export function parseAiJson<T>(rawText: string): T | null {
  if (!rawText) return null;
  let str = rawText.trim();

  // Strip markdown fences
  str = str.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // Attempt 1: Direct parse
  try {
    return JSON.parse(str) as T;
  } catch {
    // Attempt 2: Extract from start object/array
    const startObj = str.indexOf("{");
    const startArr = str.indexOf("[");

    let startIndex = -1;
    if (startObj !== -1 && startArr !== -1) {
      startIndex = Math.min(startObj, startArr);
    } else {
      startIndex = Math.max(startObj, startArr);
    }

    if (startIndex !== -1) {
      const candidate = str.slice(startIndex);
      
      // Try direct parse of candidate substring
      try {
        return JSON.parse(candidate) as T;
      } catch {
        // Try cleaned candidate
        const cleaned = candidate
          .replace(/,\s*([}\]])/g, "$1")
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        try {
          return JSON.parse(cleaned) as T;
        } catch {
          // Attempt 3: Auto-repair truncated JSON
          try {
            const repaired = tryRepairTruncatedJson(candidate);
            return JSON.parse(repaired) as T;
          } catch (err) {
            console.warn("parseAiJson repair failed:", err, str);
          }
        }
      }
    }
  }

  return null;
}
