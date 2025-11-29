/**
 * Personal Stats Hook
 * FR-081: Manages personal dashboard statistics
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { dashboardService, type PersonalStats } from "../services/dashboard-service"

interface UsePersonalStatsReturn {
  stats: PersonalStats | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function usePersonalStats(): UsePersonalStatsReturn {
  const [stats, setStats] = useState<PersonalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardService.getPersonalStats()
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        setError(response.error?.message || "Failed to load personal statistics")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}

