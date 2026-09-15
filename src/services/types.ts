/**
 * Standard API Response and Error Contracts
 * Mirroring FastAPI Pydantic response schemas for Phase 5/6 alignment.
 */

export interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
