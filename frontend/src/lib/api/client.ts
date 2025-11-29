/**
 * API Client
 * Centralized HTTP client for API requests with authentication and error handling
 * Uses httpOnly cookies for authentication (set by backend)
 */

import type { ApiResponse, PaginatedResponse } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Token management is now handled by httpOnly cookies set by the backend.
   * This method is kept for backward compatibility but does nothing.
   */
  setToken(token: string | null) {
    // Token is now stored in httpOnly cookie, no client-side storage needed
    // This method is kept for compatibility with existing code
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Include cookies in requests
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        // Response is not JSON
        data = { message: response.statusText };
      }

      // Backend returns { success: true/false, data: T, error?: {...} }
      if (!response.ok || data.success === false) {
        const errorMessage =
          data.error?.message ||
          data.message ||
          response.statusText ||
          `HTTP ${response.status}` ||
          "An error occurred";
        const errorCode = data.error?.code || response.status.toString();

        if (process.env.NODE_ENV === "development") {
          // Safely log only primitive values to avoid circular references
          console.error("API Error:", {
            url,
            status: response.status,
            statusText: response.statusText,
            errorMessage,
            errorCode,
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : [],
          });
        }
        return {
          success: false,
          error: {
            message: errorMessage,
            code: errorCode,
          },
        } as ApiResponse<T>;
      }

      // Backend wraps data in { success: true, data: T }
      return {
        success: true,
        data: data.data !== undefined ? data.data : data,
      } as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        },
      } as ApiResponse<T>;
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return this.request<T>(url.pathname + url.search, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async getPaginated<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<PaginatedResponse<T>>(endpoint, params);
    if (!response.success || !response.data) {
      throw new Error(
        response.error?.message || "Failed to fetch paginated data"
      );
    }
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
