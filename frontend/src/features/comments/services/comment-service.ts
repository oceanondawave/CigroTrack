/**
 * Comment Service
 * Handles all comment-related API calls (FR-060 to FR-063)
 */

import { apiClient } from "@/lib/api/client"
import type { ApiResponse, PaginatedResponse } from "@/types"
import type { Comment } from "@/types"

export const commentService = {
  /**
   * FR-060: Create Comment
   * Create a new comment on an issue
   */
  async createComment(
    issueId: string,
    content: string
  ): Promise<ApiResponse<Comment>> {
    return apiClient.post<Comment>(`/comments`, { issueId, content })
  },

  /**
   * FR-061: Comment List
   * Get comments for an issue (chronological order, with pagination)
   */
  async getComments(
    issueId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<Comment>>> {
    return apiClient.get<PaginatedResponse<Comment>>(
      `/comments`,
      { issueId, ...params }
    )
  },

  /**
   * FR-062: Update Comment
   * Update comment content (comment author only)
   */
  async updateComment(
    issueId: string,
    commentId: string,
    content: string
  ): Promise<ApiResponse<Comment>> {
    return apiClient.put<Comment>(
      `/comments/${commentId}`,
      { content }
    )
  },

  /**
   * FR-063: Delete Comment
   * Soft delete comment (permission checks on backend)
   */
  async deleteComment(
    issueId: string,
    commentId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/comments/${commentId}`)
  },
}

