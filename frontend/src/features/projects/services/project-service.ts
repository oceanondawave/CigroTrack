/**
 * Project Service
 * Handles all project-related API calls (FR-020 to FR-027)
 */

import { apiClient } from "@/lib/api/client"
import type { ApiResponse, PaginatedResponse } from "@/types"
import type {
  Project,
  ProjectFavorite,
} from "@/types"

export const projectService = {
  /**
   * FR-020: Create Project
   * Create a new project within a team
   */
  async createProject(
    teamId: string,
    data: {
      name: string
      description?: string
    }
  ): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>(`/projects`, { teamId, ...data })
  },

  /**
   * FR-021: View Projects
   * Get all projects for teams the user belongs to
   * If teamId is provided, returns projects for that team only
   * If teamId is not provided, returns all projects for all teams
   */
  async getProjects(teamId?: string): Promise<ApiResponse<Project[]>> {
    const params = teamId ? { teamId } : {}
    return apiClient.get<Project[]>(`/projects`, params)
  },

  /**
   * FR-022: Project Detail
   * Get project by ID
   */
  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(`/projects/${projectId}`)
  },

  /**
   * FR-023: Update Project
   * Update project name and description (OWNER, ADMIN, or project owner)
   */
  async updateProject(
    projectId: string,
    data: {
      name?: string
      description?: string
    }
  ): Promise<ApiResponse<Project>> {
    return apiClient.put<Project>(`/projects/${projectId}`, data)
  },

  /**
   * FR-024: Delete Project
   * Soft delete project (OWNER, ADMIN, or project owner)
   */
  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/projects/${projectId}`)
  },

  /**
   * FR-026: Archive Project
   * Archive or restore project (OWNER, ADMIN, or project owner)
   */
  async archiveProject(
    projectId: string,
    archived: boolean
  ): Promise<ApiResponse<Project>> {
    if (archived) {
      return apiClient.post<Project>(`/projects/${projectId}/archive`, {})
    } else {
      // To unarchive, we update status
      return apiClient.put<Project>(`/projects/${projectId}`, { status: 'active' })
    }
  },

  /**
   * FR-027: Favorite Project
   * Toggle favorite status for a project (per user)
   */
  async toggleFavorite(
    projectId: string
  ): Promise<ApiResponse<ProjectFavorite | { deleted: boolean }>> {
    return apiClient.post<ProjectFavorite | { deleted: boolean }>(
      `/projects/${projectId}/favorite`
    )
  },

  /**
   * Get favorite projects
   */
  async getFavoriteProjects(): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>("/projects/favorites")
  },
}

