/**
 * Hook for managing user's pending team invitations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { teamService } from "../services/team-service"
import type { TeamInvite } from "@/types"

interface UseUserInvitationsReturn {
  invitations: TeamInvite[]
  loading: boolean
  error: string | null
  acceptInvite: (inviteId: string) => Promise<void>
  refreshInvitations: () => Promise<void>
}

export function useUserInvitations(): UseUserInvitationsReturn {
  const [invitations, setInvitations] = useState<TeamInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvitations = useCallback(async () => {
    try {
      setError(null)
      const response = await teamService.getUserPendingInvites()
      if (response.success && response.data) {
        setInvitations(response.data)
      } else {
        setError(response.error?.message || "Failed to load invitations")
        setInvitations([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setInvitations([])
    } finally {
      setLoading(false)
    }
  }, [])

  const acceptInvite = useCallback(async (inviteId: string) => {
    try {
      setError(null)
      const response = await teamService.acceptInvite(inviteId)
      if (response.success) {
        // Remove accepted invite from list
        setInvitations((prev) => prev.filter((inv) => inv.id !== inviteId))
      } else {
        throw new Error(response.error?.message || "Failed to accept invitation")
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to accept invitation"
      setError(errorMessage)
      throw err
    }
  }, [])

  const refreshInvitations = useCallback(async () => {
    await fetchInvitations()
  }, [fetchInvitations])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  return {
    invitations,
    loading,
    error,
    acceptInvite,
    refreshInvitations,
  }
}

