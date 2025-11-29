/**
 * Teams Hook
 * Manages teams list and operations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { teamService } from "../services/team-service"
import type { Team } from "@/types"

interface UseTeamsReturn {
  teams: Team[]
  loading: boolean
  error: string | null
  createTeam: (data: { name: string }) => Promise<Team>
  refreshTeams: () => Promise<void>
}

export function useTeams(): UseTeamsReturn {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await teamService.getTeams()
      if (response.success && response.data) {
        setTeams(response.data)
      } else {
        setError(response.error?.message || "Failed to load teams")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const createTeam = useCallback(
    async (data: { name: string }): Promise<Team> => {
      try {
        setError(null)
        const response = await teamService.createTeam(data)
        if (response.success && response.data) {
          const newTeam = response.data
          setTeams((prev) => [...prev, newTeam])
          return newTeam
        } else {
          const errorMsg = response.error?.message || "Failed to create team"
          console.error("Team creation failed:", {
            error: response.error,
            fullResponse: response,
          })
          throw new Error(errorMsg)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create team"
        console.error("Team creation error:", {
          error: err,
          message: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
        })
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const refreshTeams = useCallback(async () => {
    await fetchTeams()
  }, [fetchTeams])

  return {
    teams,
    loading,
    error,
    createTeam,
    refreshTeams,
  }
}

