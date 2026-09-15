import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely with clsx and twMerge.
 * Follows standard shadcn / Carbon utility conventions.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format date string into human readable format
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Format score percentage with sign
 */
export function formatScoreDelta(delta: number): string {
  const prefix = delta > 0 ? "+" : "";
  return `${prefix}${delta}%`;
}
