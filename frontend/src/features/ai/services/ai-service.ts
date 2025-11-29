/**
 * AI Service
 * Handles all AI-related API calls (FR-040 to FR-045)
 */

import { apiClient } from "@/lib/api/client"
import type { ApiResponse } from "@/types"
import type { AiSummary, AiRateLimit } from "@/types"

export const aiService = {
  /**
   * FR-040: Generate Issue Summary
   * Generate AI summary for an issue
   * Backend returns: { success: true, data: { summary: string } }
   */
  async generateSummary(issueId: string, description: string): Promise<ApiResponse<{ summary: string }>> {
    return apiClient.post<{ summary: string }>(`/ai/issues/${issueId}/summary`, { description })
  },

  /**
   * FR-041: Get Solution Suggestions
   * Get AI-powered solution suggestions for an issue
   * Backend returns: { success: true, data: { suggestion: string } }
   * Note: Backend returns a single suggestion string, not an array
   */
  async getSuggestions(issueId: string, description: string): Promise<ApiResponse<string[]>> {
    const response = await apiClient.post<{ suggestion: string }>(`/ai/issues/${issueId}/suggestion`, {
      description,
    })
    // Transform single suggestion to array for consistency with UI
    if (response.success && response.data) {
      return {
        success: true,
        data: [response.data.suggestion],
      }
    }
    return {
      success: false,
      error: response.error,
    } as ApiResponse<string[]>
  },

  /**
   * FR-042: Check Rate Limit
   * Check current AI rate limit status
   */
  async getRateLimit(): Promise<ApiResponse<AiRateLimit>> {
    return apiClient.get<AiRateLimit>("/ai/rate-limit")
  },

  /**
   * FR-043: Auto-Label Issues
   * Get AI-suggested labels for an issue
   */
  async autoLabel(issueId: string, title: string, description?: string): Promise<ApiResponse<string[]>> {
    const response = await apiClient.post<{ labels: string[] }>(
      `/ai/issues/${issueId}/auto-label`,
      { title, description }
    )
    // Transform response to match expected format
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.labels.map((id: string) => ({ id, name: '', confidence: 0 })) as any,
      }
    }
    return response as any
  },

  /**
   * FR-044: Detect Duplicate Issues
   * Find potential duplicate issues
   * Backend returns: { success: true, data: { duplicates: string[] } }
   */
  async detectDuplicates(issueId: string, title: string, description?: string): Promise<ApiResponse<string[]>> {
    const response = await apiClient.post<{ duplicates: string[] }>(`/ai/issues/${issueId}/duplicates`, {
      title,
      description,
    })
    // Transform response to return just the array of duplicate IDs
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.duplicates,
      }
    }
    return {
      success: false,
      error: response.error,
    } as ApiResponse<string[]>
  },

  /**
   * FR-045: Summarize Comments
   * Generate summary of issue comments
   */
  async summarizeComments(issueId: string, commentCount: number): Promise<ApiResponse<string>> {
    const response = await apiClient.post<{ summary: string }>(
      `/ai/issues/${issueId}/comments/summary`,
      { commentCount }
    )
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.summary,
      }
    }
    return response as any
  },
}

