/**
 * Issue Service
 * Handles all issue-related API calls (FR-030 to FR-039)
 */

import { apiClient } from "@/lib/api/client"
import type { ApiResponse, PaginatedResponse } from "@/types"
import type {
  Issue,
  Label,
  Subtask,
  IssueChangeHistory,
  IssueFilters,
  SortOption,
} from "@/types"

export const issueService = {
  /**
   * FR-030: Create Issue
   * Create a new issue within a project
   */
  async createIssue(
    projectId: string,
    data: {
      title: string
      description?: string
      assigneeId?: string
      dueDate?: string
      priority?: "HIGH" | "MEDIUM" | "LOW"
      labelIds?: string[]
    }
  ): Promise<ApiResponse<Issue>> {
    return apiClient.post<Issue>(`/issues`, {
      projectId,
      ...data,
      labels: data.labelIds,
    })
  },

  /**
   * FR-031: Issue Detail View
   * Get issue by ID
   */
  async getIssue(issueId: string): Promise<ApiResponse<Issue>> {
    return apiClient.get<Issue>(`/issues/${issueId}`)
  },

  /**
   * FR-032: Update Issue
   * Update issue fields (all team members)
   */
  async updateIssue(
    issueId: string,
    data: {
      title?: string
      description?: string
      status?: string
      assigneeId?: string
      dueDate?: string
      priority?: "HIGH" | "MEDIUM" | "LOW"
      labelIds?: string[]
      order?: number
    }
  ): Promise<ApiResponse<Issue>> {
    return apiClient.put<Issue>(`/issues/${issueId}`, data)
  },

  /**
   * FR-033: Update Status
   * Update issue status via drag & drop or detail screen
   */
  async updateStatus(
    issueId: string,
    status: string,
    order?: number
  ): Promise<ApiResponse<Issue>> {
    return apiClient.patch<Issue>(`/issues/${issueId}/status`, { status, order })
  },

  /**
   * FR-035: Delete Issue
   * Soft delete issue (permission checks on backend)
   */
  async deleteIssue(issueId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/issues/${issueId}`)
  },

  /**
   * FR-036: Issue Search/Filtering
   * Search and filter issues
   */
  async searchIssues(
    projectId: string,
    filters?: IssueFilters,
    sort?: SortOption,
    pagination?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<Issue>>> {
    const params: Record<string, unknown> = {
      projectId,
      ...filters,
      sortBy: sort?.field || 'createdAt',
      sortOrder: sort?.direction || 'desc',
      ...pagination,
    }
    return apiClient.get<PaginatedResponse<Issue>>(`/issues`, params)
  },

  /**
   * FR-038: Create Label
   * Create a new label for a project
   */
  async createLabel(
    projectId: string,
    data: { name: string; color: string }
  ): Promise<ApiResponse<Label>> {
    return apiClient.post<Label>(`/projects/${projectId}/labels`, data)
  },

  /**
   * Get project labels
   */
  async getLabels(projectId: string): Promise<ApiResponse<Label[]>> {
    return apiClient.get<Label[]>(`/projects/${projectId}/labels`)
  },

  /**
   * FR-038: Update Label
   * Update label name or color
   */
  async updateLabel(
    labelId: string,
    data: { name?: string; color?: string }
  ): Promise<ApiResponse<Label>> {
    return apiClient.patch<Label>(`/labels/${labelId}`, data)
  },

  /**
   * FR-038: Delete Label
   * Delete a label from project
   */
  async deleteLabel(labelId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/labels/${labelId}`)
  },

  /**
   * FR-039-2: Create Subtask
   * Add a subtask to an issue
   */
  async createSubtask(
    issueId: string,
    data: { title: string; order?: number }
  ): Promise<ApiResponse<Subtask>> {
    return apiClient.post<Subtask>(`/issues/${issueId}/subtasks`, data)
  },

  /**
   * FR-039-2: Update Subtask
   * Update subtask (mark complete, change title, reorder)
   */
  async updateSubtask(
    issueId: string,
    subtaskId: string,
    data: { title?: string; completed?: boolean; order?: number }
  ): Promise<ApiResponse<Subtask>> {
    return apiClient.patch<Subtask>(
      `/issues/${issueId}/subtasks/${subtaskId}`,
      data
    )
  },

  /**
   * FR-039-2: Delete Subtask
   * Remove a subtask from an issue
   */
  async deleteSubtask(
    issueId: string,
    subtaskId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/issues/${issueId}/subtasks/${subtaskId}`)
  },

  /**
   * FR-039: Issue Change History
   * Get change history for an issue
   */
  async getChangeHistory(
    issueId: string
  ): Promise<ApiResponse<IssueChangeHistory[]>> {
    return apiClient.get<IssueChangeHistory[]>(`/issues/${issueId}/history`)
  },
}

