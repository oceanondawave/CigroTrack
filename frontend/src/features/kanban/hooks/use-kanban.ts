/**
 * Kanban Hook
 * Manages kanban board state and operations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { kanbanService } from "../services/kanban-service"
import { issueService } from "@/features/issues/services/issue-service"
import type { Issue, CustomStatus } from "@/types"

interface UseKanbanReturn {
  columns: Record<string, Issue[]>
  statuses: CustomStatus[]
  wipLimits: Record<string, number>
  loading: boolean
  error: string | null
  moveIssue: (issueId: string, fromStatus: string, toStatus: string, newOrder?: number) => Promise<void>
  refreshBoard: () => Promise<void>
  createStatus: (data: { name: string; color?: string; order?: number }) => Promise<CustomStatus>
  updateStatus: (statusId: string, data: { name?: string; color?: string; order?: number }) => Promise<CustomStatus>
  deleteStatus: (statusId: string) => Promise<void>
  setWipLimit: (status: string, limit: number | null) => Promise<void>
}

export function useKanban(projectId: string): UseKanbanReturn {
  const [columns, setColumns] = useState<Record<string, Issue[]>>({})
  const [statuses, setStatuses] = useState<CustomStatus[]>([])
  const [wipLimits, setWipLimits] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBoardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch board data, statuses, and WIP limits in parallel
      const [boardResponse, statusesResponse, wipLimitsResponse] = await Promise.all([
        kanbanService.getBoardData(projectId),
        kanbanService.getStatuses(projectId),
        kanbanService.getWipLimits(projectId),
      ])

      if (boardResponse.success && boardResponse.data) {
        setColumns(boardResponse.data)
      } else {
        setError(boardResponse.error?.message || "Failed to load board")
      }

      if (statusesResponse.success && statusesResponse.data) {
        setStatuses(statusesResponse.data)
      }

      if (wipLimitsResponse.success && wipLimitsResponse.data) {
        setWipLimits(wipLimitsResponse.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchBoardData()
  }, [fetchBoardData])

  const moveIssue = useCallback(
    async (
      issueId: string,
      fromStatus: string,
      toStatus: string,
      newOrder?: number
    ) => {
      try {
        setError(null)
        const response = await kanbanService.moveIssue(issueId, toStatus, newOrder)
        if (response.success && response.data) {
          // Optimistically update local state
          setColumns((prev) => {
            const newColumns = { ...prev }
            // Remove from old column
            if (newColumns[fromStatus]) {
              newColumns[fromStatus] = newColumns[fromStatus].filter(
                (issue) => issue.id !== issueId
              )
            }
            // Add to new column
            if (!newColumns[toStatus]) {
              newColumns[toStatus] = []
            }
            const updatedIssue = response.data
            if (!updatedIssue) {
              throw new Error("Invalid response: issue data missing")
            }
            if (newOrder !== undefined) {
              // Insert at specific position
              newColumns[toStatus].splice(newOrder, 0, updatedIssue)
            } else {
              // Append to end
              newColumns[toStatus].push(updatedIssue)
            }
            return newColumns
          })
        } else {
          throw new Error(response.error?.message || "Failed to move issue")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to move issue"
        setError(errorMessage)
        // Revert on error
        await fetchBoardData()
        throw err
      }
    },
    [fetchBoardData]
  )

  const createStatus = useCallback(
    async (data: { name: string; color?: string; order?: number }): Promise<CustomStatus> => {
      try {
        setError(null)
        const response = await kanbanService.createStatus(projectId, data)
        if (response.success && response.data) {
          setStatuses((prev) => [...prev, response.data!])
          setColumns((prev) => ({ ...prev, [response.data!.name]: [] }))
          return response.data
        } else {
          throw new Error(response.error?.message || "Failed to create status")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create status"
        setError(errorMessage)
        throw err
      }
    },
    [projectId]
  )

  const updateStatus = useCallback(
    async (
      statusId: string,
      data: { name?: string; color?: string; order?: number }
    ): Promise<CustomStatus> => {
      try {
        setError(null)
        const response = await kanbanService.updateStatus(projectId, statusId, data)
        if (response.success && response.data) {
          setStatuses((prev) =>
            prev.map((status) => (status.id === statusId ? response.data! : status))
          )
          // If name changed, update columns
          if (data.name) {
            const oldStatus = statuses.find((s) => s.id === statusId)
            if (oldStatus && oldStatus.name !== data.name) {
              setColumns((prev) => {
                const newColumns = { ...prev }
                newColumns[data.name!] = newColumns[oldStatus.name] || []
                delete newColumns[oldStatus.name]
                return newColumns
              })
            }
          }
          return response.data
        } else {
          throw new Error(response.error?.message || "Failed to update status")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update status"
        setError(errorMessage)
        throw err
      }
    },
    [projectId, statuses]
  )

  const deleteStatus = useCallback(
    async (statusId: string) => {
      try {
        setError(null)
        const response = await kanbanService.deleteStatus(projectId, statusId)
        if (response.success) {
          const deletedStatus = statuses.find((s) => s.id === statusId)
          setStatuses((prev) => prev.filter((status) => status.id !== statusId))
          if (deletedStatus) {
            setColumns((prev) => {
              const newColumns = { ...prev }
              delete newColumns[deletedStatus.name]
              return newColumns
            })
          }
        } else {
          throw new Error(response.error?.message || "Failed to delete status")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete status"
        setError(errorMessage)
        throw err
      }
    },
    [projectId, statuses]
  )

  const setWipLimit = useCallback(
    async (status: string, limit: number | null) => {
      try {
        setError(null)
        const response = await kanbanService.setWipLimit(projectId, status, limit)
        if (response.success && response.data) {
          setWipLimits(response.data)
        } else {
          throw new Error(response.error?.message || "Failed to set WIP limit")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to set WIP limit"
        setError(errorMessage)
        throw err
      }
    },
    [projectId]
  )

  const refreshBoard = useCallback(async () => {
    await fetchBoardData()
  }, [fetchBoardData])

  return {
    columns,
    statuses,
    wipLimits,
    loading,
    error,
    moveIssue,
    refreshBoard,
    createStatus,
    updateStatus,
    deleteStatus,
    setWipLimit,
  }
}

