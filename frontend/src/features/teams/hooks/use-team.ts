/**
 * Team Hook
 * Manages single team data and operations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { teamService } from "../services/team-service"
import type {
  Team,
  TeamMember,
  TeamInvite,
  TeamActivity,
  PaginatedResponse,
} from "@/types"

interface UseTeamReturn {
  team: Team | null
  members: TeamMember[]
  invites: TeamInvite[]
  activities: TeamActivity[]
  loading: boolean
  error: string | null
  updateTeam: (data: { name: string }) => Promise<Team>
  deleteTeam: () => Promise<void>
  inviteMember: (data: {
    email: string
    role: "OWNER" | "ADMIN" | "MEMBER"
  }) => Promise<TeamInvite>
  acceptInvite: (inviteId: string) => Promise<void>
  resendInvite: (inviteId: string) => Promise<void>
  revokeInvite: (inviteId: string) => Promise<void>
  kickMember: (memberId: string) => Promise<void>
  leaveTeam: () => Promise<void>
  changeMemberRole: (
    memberId: string,
    role: "OWNER" | "ADMIN" | "MEMBER"
  ) => Promise<TeamMember>
  refreshTeam: () => Promise<void>
  refreshMembers: () => Promise<void>
  refreshInvites: () => Promise<void>
  refreshActivities: (page?: number) => Promise<void>
  hasMoreActivities: boolean
  activitiesPage: number
}

export function useTeam(teamId: string): UseTeamReturn {
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [activities, setActivities] = useState<TeamActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activitiesPage, setActivitiesPage] = useState(1)
  const [hasMoreActivities, setHasMoreActivities] = useState(true)

  const fetchTeam = useCallback(async () => {
    try {
      setError(null)
      const response = await teamService.getTeam(teamId)
      if (response.success && response.data) {
        setTeam(response.data)
      } else {
        setError(response.error?.message || "Failed to load team")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }, [teamId])

  const fetchMembers = useCallback(async () => {
    try {
      const response = await teamService.getTeamMembers(teamId)
      if (response.success && response.data) {
        setMembers(response.data)
      }
    } catch (err) {
      console.error("Failed to load members:", err)
    }
  }, [teamId])

  const fetchInvites = useCallback(async () => {
    try {
      const response = await teamService.getTeamInvites(teamId)
      if (response.success && response.data) {
        setInvites(response.data)
      }
    } catch (err) {
      console.error("Failed to load invites:", err)
    }
  }, [teamId])

  const fetchActivities = useCallback(
    async (page: number = 1) => {
      try {
        const response = await teamService.getTeamActivities(teamId, {
          page,
          limit: 20,
        })
        if (response.success && response.data) {
          const paginatedData = response.data
          if (paginatedData && paginatedData.data && paginatedData.pagination) {
            if (page === 1) {
              setActivities(paginatedData.data)
            } else {
              setActivities((prev) => [...prev, ...paginatedData.data])
            }
            setHasMoreActivities(
              paginatedData.pagination.page < paginatedData.pagination.totalPages
            )
            setActivitiesPage(page)
          }
        }
      } catch (err) {
        console.error("Failed to load activities:", err)
      }
    },
    [teamId]
  )

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchTeam(),
        fetchMembers(),
        fetchInvites(),
        fetchActivities(1),
      ])
      setLoading(false)
    }
    if (teamId) {
      loadData()
    }
  }, [teamId, fetchTeam, fetchMembers, fetchInvites, fetchActivities])

  const updateTeam = useCallback(
    async (data: { name: string }): Promise<Team> => {
      try {
        setError(null)
        const response = await teamService.updateTeam(teamId, data)
        if (response.success && response.data) {
          setTeam(response.data)
          return response.data
        } else {
          throw new Error(response.error?.message || "Failed to update team")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update team"
        setError(errorMessage)
        throw err
      }
    },
    [teamId]
  )

  const deleteTeam = useCallback(async () => {
    try {
      setError(null)
      const response = await teamService.deleteTeam(teamId)
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to delete team")
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete team"
      setError(errorMessage)
      throw err
    }
  }, [teamId])

  const inviteMember = useCallback(
    async (data: {
      email: string
      role: "OWNER" | "ADMIN" | "MEMBER"
    }): Promise<TeamInvite> => {
      try {
        setError(null)
        const response = await teamService.inviteMember(teamId, data)
        if (response.success && response.data) {
          setInvites((prev) => [...prev, response.data!])
          return response.data
        } else {
          throw new Error(
            response.error?.message || "Failed to invite member"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to invite member"
        setError(errorMessage)
        throw err
      }
    },
    [teamId]
  )

  const acceptInvite = useCallback(async (inviteId: string) => {
    try {
      setError(null)
      const response = await teamService.acceptInvite(inviteId)
      if (response.success) {
        await fetchMembers()
        await fetchInvites()
      } else {
        throw new Error(
          response.error?.message || "Failed to accept invite"
        )
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to accept invite"
      setError(errorMessage)
      throw err
    }
  }, [fetchMembers, fetchInvites])

  const resendInvite = useCallback(
    async (inviteId: string) => {
      try {
        setError(null)
        const response = await teamService.resendInvite(inviteId)
        if (response.success && response.data) {
          setInvites((prev) =>
            prev.map((invite) =>
              invite.id === inviteId ? response.data! : invite
            )
          )
        } else {
          throw new Error(
            response.error?.message || "Failed to resend invite"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to resend invite"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const revokeInvite = useCallback(
    async (inviteId: string) => {
      try {
        setError(null)
        const response = await teamService.revokeInvite(teamId, inviteId)
        if (response.success) {
          setInvites((prev) => prev.filter((invite) => invite.id !== inviteId))
        } else {
          throw new Error(
            response.error?.message || "Failed to revoke invite"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to revoke invite"
        setError(errorMessage)
        throw err
      }
    },
    [teamId]
  )

  const kickMember = useCallback(
    async (memberId: string) => {
      try {
        setError(null)
        const response = await teamService.kickMember(teamId, memberId)
        if (response.success) {
          await fetchMembers()
        } else {
          throw new Error(
            response.error?.message || "Failed to kick member"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to kick member"
        setError(errorMessage)
        throw err
      }
    },
    [teamId, fetchMembers]
  )

  const leaveTeam = useCallback(async () => {
    try {
      setError(null)
      const response = await teamService.leaveTeam(teamId)
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to leave team")
      }
      // Navigation will be handled by the component
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to leave team"
      setError(errorMessage)
      throw err
    }
  }, [teamId])

  const changeMemberRole = useCallback(
    async (
      memberId: string,
      role: "OWNER" | "ADMIN" | "MEMBER"
    ): Promise<TeamMember> => {
      try {
        setError(null)
        const response = await teamService.changeMemberRole(
          teamId,
          memberId,
          role
        )
        if (response.success && response.data) {
          setMembers((prev) =>
            prev.map((member) =>
              member.id === memberId ? response.data! : member
            )
          )
          await fetchTeam() // Refresh team in case owner changed
          return response.data
        } else {
          throw new Error(
            response.error?.message || "Failed to change role"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to change role"
        setError(errorMessage)
        throw err
      }
    },
    [teamId, fetchTeam]
  )

  const refreshTeam = useCallback(async () => {
    await fetchTeam()
  }, [fetchTeam])

  const refreshMembers = useCallback(async () => {
    await fetchMembers()
  }, [fetchMembers])

  const refreshInvites = useCallback(async () => {
    await fetchInvites()
  }, [fetchInvites])

  const refreshActivities = useCallback(
    async (page?: number) => {
      await fetchActivities(page || activitiesPage + 1)
    },
    [fetchActivities, activitiesPage]
  )

  return {
    team,
    members,
    invites,
    activities,
    loading,
    error,
    updateTeam,
    deleteTeam,
    inviteMember,
    acceptInvite,
    resendInvite,
    revokeInvite,
    kickMember,
    leaveTeam,
    changeMemberRole,
    refreshTeam,
    refreshMembers,
    refreshInvites,
    refreshActivities,
    hasMoreActivities,
    activitiesPage,
  }
}

