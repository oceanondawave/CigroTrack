/**
 * Projects Hook
 * Manages projects list and operations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { projectService } from "../services/project-service"
import type { Project } from "@/types"

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  createProject: (
    teamId: string,
    data: { name: string; description?: string }
  ) => Promise<Project>
  refreshProjects: () => Promise<void>
  toggleFavorite: (projectId: string) => Promise<void>
}

export function useProjects(teamId?: string): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    // Skip fetching if no teamId is provided and we're in a context where it's required
    // This allows the hook to work both with and without teamId
    try {
      setLoading(true)
      setError(null)
      const response = await projectService.getProjects(teamId)
      if (response.success && response.data) {
        // Sort: favorites first, then by creation date descending (FR-021)
        const sorted = [...response.data].sort((a, b) => {
          // This will be enhanced when we have favorite status
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setProjects(sorted)
      } else {
        setError(response.error?.message || "Failed to load projects")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = useCallback(
    async (
      teamId: string,
      data: { name: string; description?: string }
    ): Promise<Project> => {
      try {
        setError(null)
        const response = await projectService.createProject(teamId, data)
        if (response.success && response.data) {
          const newProject = response.data
          setProjects((prev) => [newProject, ...prev])
          return newProject
        } else {
          throw new Error(response.error?.message || "Failed to create project")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create project"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const toggleFavorite = useCallback(
    async (projectId: string) => {
      try {
        const response = await projectService.toggleFavorite(projectId)
        if (response.success) {
          // Update project in list
          setProjects((prev) =>
            prev.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    // Favorite status will be updated based on response
                  }
                : project
            )
          )
          await fetchProjects() // Refresh to get updated favorite status
        } else {
          throw new Error(response.error?.message || "Failed to toggle favorite")
        }
      } catch (err) {
        console.error("Failed to toggle favorite:", err)
        throw err
      }
    },
    [fetchProjects]
  )

  const refreshProjects = useCallback(async () => {
    await fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    loading,
    error,
    createProject,
    toggleFavorite,
    refreshProjects,
  }
}

