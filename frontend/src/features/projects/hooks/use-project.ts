/**
 * Project Hook
 * Manages single project data and operations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { projectService } from "../services/project-service"
import type { Project } from "@/types"

interface UseProjectReturn {
  project: Project | null
  loading: boolean
  error: string | null
  updateProject: (data: {
    name?: string
    description?: string
  }) => Promise<Project>
  deleteProject: () => Promise<void>
  archiveProject: (archived: boolean) => Promise<Project>
  toggleFavorite: () => Promise<void>
  refreshProject: () => Promise<void>
}

export function useProject(projectId: string): UseProjectReturn {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      setError(null)
      const response = await projectService.getProject(projectId)
      if (response.success && response.data) {
        setProject(response.data)
      } else {
        setError(response.error?.message || "Failed to load project")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const updateProject = useCallback(
    async (data: { name?: string; description?: string }): Promise<Project> => {
      try {
        setError(null)
        const response = await projectService.updateProject(projectId, data)
        if (response.success && response.data) {
          setProject(response.data)
          return response.data
        } else {
          throw new Error(response.error?.message || "Failed to update project")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update project"
        setError(errorMessage)
        throw err
      }
    },
    [projectId]
  )

  const deleteProject = useCallback(async () => {
    try {
      setError(null)
      const response = await projectService.deleteProject(projectId)
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to delete project")
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete project"
      setError(errorMessage)
      throw err
    }
  }, [projectId])

  const archiveProject = useCallback(
    async (archived: boolean): Promise<Project> => {
      try {
        setError(null)
        const response = await projectService.archiveProject(projectId, archived)
        if (response.success && response.data) {
          setProject(response.data)
          return response.data
        } else {
          throw new Error(
            response.error?.message || "Failed to archive project"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to archive project"
        setError(errorMessage)
        throw err
      }
    },
    [projectId]
  )

  const toggleFavorite = useCallback(async () => {
    try {
      setError(null)
      const response = await projectService.toggleFavorite(projectId)
      if (response.success) {
        await fetchProject() // Refresh to get updated favorite status
      } else {
        throw new Error(
          response.error?.message || "Failed to toggle favorite"
        )
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle favorite"
      setError(errorMessage)
      throw err
    }
  }, [projectId, fetchProject])

  const refreshProject = useCallback(async () => {
    await fetchProject()
  }, [fetchProject])

  return {
    project,
    loading,
    error,
    updateProject,
    deleteProject,
    archiveProject,
    toggleFavorite,
    refreshProject,
  }
}

