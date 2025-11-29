/**
 * Project Stats Hook
 * FR-080: Manages project dashboard statistics
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { dashboardService, type ProjectStats } from "../services/dashboard-service"

interface UseProjectStatsReturn {
  stats: ProjectStats | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useProjectStats(projectId: string): UseProjectStatsReturn {
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardService.getProjectStats(projectId)
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        setError(response.error?.message || "Failed to load project statistics")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [projectId])

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

