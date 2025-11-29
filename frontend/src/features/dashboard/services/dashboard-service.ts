/**
 * Dashboard Service
 * Handles dashboard and statistics API calls (FR-080 to FR-082)
 */

import { apiClient } from "@/lib/api/client"
import type { ApiResponse } from "@/types"

export interface ProjectStats {
  totalIssues: number
  issuesByStatus: Record<string, number>
  issuesByPriority: Record<string, number>
  recentIssues: Array<{ id: string; title: string; status: string; createdAt: string }>
  teamMembers: number
}

export interface PersonalStats {
  assignedIssues: number
  createdIssues: number
  completedIssues: number
  overdueIssues: number
  issuesByStatus: Record<string, number>
  recentActivity: Array<{ id: string; type: string; description: string; timestamp: string }>
}

export interface TeamStats {
  totalProjects: number
  totalIssues: number
  activeMembers: number
  issuesByStatus: Record<string, number>
  issuesByPriority: Record<string, number>
  recentProjects: Array<{ id: string; name: string; issueCount: number; createdAt: string }>
}

export const dashboardService = {
  /**
   * FR-080: Project Dashboard
   * Get statistics for a specific project
   */
  async getProjectStats(projectId: string): Promise<ApiResponse<ProjectStats>> {
    return apiClient.get<ProjectStats>(`/dashboard/projects/${projectId}`)
  },

  /**
   * FR-081: Personal Dashboard
   * Get user's personal statistics
   */
  async getPersonalStats(): Promise<ApiResponse<PersonalStats>> {
    return apiClient.get<PersonalStats>("/dashboard/personal")
  },

  /**
   * FR-082: Team Statistics
   * Get statistics for a team
   */
  async getTeamStats(teamId: string, period: '7days' | '30days' | '90days' = '7days'): Promise<ApiResponse<TeamStats>> {
    return apiClient.get<TeamStats>(`/dashboard/teams/${teamId}/statistics`, { period })
  },
}

