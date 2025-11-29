/**
 * Team Service
 * Handles all team-related API calls (FR-010 to FR-019)
 */

import { apiClient } from "@/lib/api/client"
import type { ApiResponse, PaginatedResponse } from "@/types"
import type {
  Team,
  TeamMember,
  TeamInvite,
  TeamActivity,
} from "@/types"

export const teamService = {
  /**
   * FR-010: Create Team
   * Create a new team with current user as owner
   */
  async createTeam(data: { name: string }): Promise<ApiResponse<Team>> {
    return apiClient.post<Team>("/teams", data)
  },

  /**
   * Get all teams for current user
   */
  async getTeams(): Promise<ApiResponse<Team[]>> {
    return apiClient.get<Team[]>("/teams")
  },

  /**
   * Get team by ID
   */
  async getTeam(teamId: string): Promise<ApiResponse<Team>> {
    return apiClient.get<Team>(`/teams/${teamId}`)
  },

  /**
   * FR-011: Update Team
   * Update team name (OWNER, ADMIN only)
   */
  async updateTeam(
    teamId: string,
    data: { name: string }
  ): Promise<ApiResponse<Team>> {
    return apiClient.put<Team>(`/teams/${teamId}`, data)
  },

  /**
   * FR-012: Delete Team
   * Soft delete team (OWNER only)
   */
  async deleteTeam(teamId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/teams/${teamId}`)
  },

  /**
   * FR-014: View Members
   * Get all team members
   */
  async getTeamMembers(teamId: string): Promise<ApiResponse<TeamMember[]>> {
    return apiClient.get<TeamMember[]>(`/teams/${teamId}/members`)
  },

  /**
   * FR-013: Invite Member
   * Invite a user to the team (OWNER, ADMIN only)
   */
  async inviteMember(
    teamId: string,
    data: { email: string; role: "OWNER" | "ADMIN" | "MEMBER" }
  ): Promise<ApiResponse<TeamInvite>> {
    return apiClient.post<TeamInvite>(`/teams/${teamId}/invite`, data)
  },

  /**
   * Get pending team invites
   */
  async getTeamInvites(teamId: string): Promise<ApiResponse<TeamInvite[]>> {
    return apiClient.get<TeamInvite[]>(`/teams/${teamId}/invites`)
  },

  /**
   * Get pending invitations for current user
   */
  async getUserPendingInvites(): Promise<ApiResponse<TeamInvite[]>> {
    return apiClient.get<TeamInvite[]>("/teams/invites")
  },

  /**
   * Accept team invite
   */
  async acceptInvite(inviteId: string): Promise<ApiResponse<TeamMember>> {
    return apiClient.post<TeamMember>(`/teams/invites/${inviteId}/accept`)
  },

  /**
   * Decline team invite
   */
  async declineInvite(inviteId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/teams/invites/${inviteId}/decline`)
  },

  /**
   * Resend team invite (FR-013: updates expiration date)
   */
  async resendInvite(inviteId: string): Promise<ApiResponse<TeamInvite>> {
    return apiClient.post<TeamInvite>(`/teams/invites/${inviteId}/resend`)
  },

  /**
   * Revoke/withdraw team invitation (FR-013)
   */
  async revokeInvite(teamId: string, inviteId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/teams/${teamId}/invites/${inviteId}`)
  },

  /**
   * FR-015: Kick Member
   * Remove a member from the team
   */
  async kickMember(
    teamId: string,
    memberId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/teams/${teamId}/members/${memberId}`)
  },

  /**
   * FR-016: Leave Team
   * Leave the team (ADMIN, MEMBER only)
   */
  async leaveTeam(teamId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/teams/${teamId}/leave`)
  },

  /**
   * FR-018: Change Role
   * Change member role (OWNER only)
   */
  async changeMemberRole(
    teamId: string,
    memberId: string,
    role: "OWNER" | "ADMIN" | "MEMBER"
  ): Promise<ApiResponse<TeamMember>> {
    return apiClient.patch<TeamMember>(
      `/teams/${teamId}/members/${memberId}/role`,
      { role }
    )
  },

  /**
   * FR-019: Team Activity Log
   * Get team activity log with pagination
   */
  async getTeamActivities(
    teamId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<TeamActivity>>> {
    return apiClient.getPaginated<TeamActivity>(
      `/teams/${teamId}/activity`,
      params
    )
      .then((data) => ({ success: true as const, data }))
      .catch((error) => ({ success: false as const, error: { message: error.message || "Failed to fetch activities" } }))
  },
}

