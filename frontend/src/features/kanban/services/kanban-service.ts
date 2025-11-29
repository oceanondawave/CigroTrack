/**
 * Kanban Service
 * Handles kanban board operations (FR-050 to FR-054)
 */

import { apiClient } from "@/lib/api/client"
import type { ApiResponse } from "@/types"
import type { Issue, CustomStatus } from "@/types"

export const kanbanService = {
  /**
   * FR-050: Get Kanban Board Data
   * Get issues organized by status for a project
   */
  async getBoardData(projectId: string): Promise<ApiResponse<Record<string, Issue[]>>> {
    return apiClient.get<Record<string, Issue[]>>(`/projects/${projectId}/board`)
  },

  /**
   * FR-051: Update Issue Status (via drag & drop)
   * Move issue between statuses
   */
  async moveIssue(
    issueId: string,
    newStatus: string,
    order?: number
  ): Promise<ApiResponse<Issue>> {
    return apiClient.put<Issue>(`/issues/${issueId}`, {
      status: newStatus,
      order,
    })
  },

  /**
   * FR-052: Get Custom Statuses
   * Get project-specific statuses
   */
  async getStatuses(projectId: string): Promise<ApiResponse<CustomStatus[]>> {
    return apiClient.get<CustomStatus[]>(`/kanban/projects/${projectId}/statuses`)
  },

  /**
   * FR-052: Create Custom Status
   * Create a new custom status for a project
   */
  async createStatus(
    projectId: string,
    data: { name: string; color?: string; order?: number }
  ): Promise<ApiResponse<CustomStatus>> {
    return apiClient.post<CustomStatus>(`/kanban/projects/${projectId}/statuses`, data)
  },

  /**
   * FR-052: Update Custom Status
   * Update status name, color, or order
   */
  async updateStatus(
    projectId: string,
    statusId: string,
    data: { name?: string; color?: string; order?: number }
  ): Promise<ApiResponse<CustomStatus>> {
    return apiClient.put<CustomStatus>(
      `/kanban/projects/${projectId}/statuses/${statusId}`,
      data
    )
  },

  /**
   * FR-052: Delete Custom Status
   * Delete a custom status (only if no issues use it)
   */
  async deleteStatus(
    projectId: string,
    statusId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/kanban/projects/${projectId}/statuses/${statusId}`)
  },

  /**
   * FR-053: Get WIP Limits
   * Get work-in-progress limits for statuses
   */
  async getWipLimits(projectId: string): Promise<ApiResponse<Record<string, number>>> {
    const response = await apiClient.get<any[]>(`/kanban/projects/${projectId}/wip-limits`)
    if (response.success && response.data) {
      // Transform array to record
      const limits: Record<string, number> = {}
      response.data.forEach((item: any) => {
        limits[item.status] = item.limit
      })
      return {
        ...response,
        data: limits,
      } as any
    }
    return response as any
  },

  /**
   * FR-053: Set WIP Limit
   * Set work-in-progress limit for a status
   */
  async setWipLimit(
    projectId: string,
    status: string,
    limit: number | null
  ): Promise<ApiResponse<Record<string, number>>> {
    const response = await apiClient.put<any>(
      `/kanban/projects/${projectId}/wip-limits`,
      { status, limit }
    )
    if (response.success && response.data) {
      // Transform to record format
      return {
        ...response,
        data: { [response.data.status]: response.data.limit },
      } as any
    }
    return response as any
  },
}

