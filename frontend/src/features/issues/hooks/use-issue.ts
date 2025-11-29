/**
 * Issue Hook
 * Manages single issue data and operations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { issueService } from "../services/issue-service"
import type {
  Issue,
  Label,
  Subtask,
  IssueChangeHistory,
} from "@/types"

interface UseIssueReturn {
  issue: Issue | null
  labels: Label[]
  changeHistory: IssueChangeHistory[]
  loading: boolean
  error: string | null
  updateIssue: (data: {
    title?: string
    description?: string
    status?: string
    assigneeId?: string
    dueDate?: string
    priority?: "HIGH" | "MEDIUM" | "LOW"
    labelIds?: string[]
    order?: number
  }) => Promise<Issue>
  updateStatus: (status: string, order?: number) => Promise<Issue>
  deleteIssue: () => Promise<void>
  createSubtask: (data: { title: string; order?: number }) => Promise<Subtask>
  updateSubtask: (
    subtaskId: string,
    data: { title?: string; completed?: boolean; order?: number }
  ) => Promise<Subtask>
  deleteSubtask: (subtaskId: string) => Promise<void>
  refreshIssue: () => Promise<void>
  refreshLabels: () => Promise<void>
  refreshHistory: () => Promise<void>
}

export function useIssue(issueId: string): UseIssueReturn {
  const [issue, setIssue] = useState<Issue | null>(null)
  const [labels, setLabels] = useState<Label[]>([])
  const [changeHistory, setChangeHistory] = useState<IssueChangeHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIssue = useCallback(async () => {
    try {
      setError(null)
      const response = await issueService.getIssue(issueId)
      if (response.success && response.data) {
        setIssue(response.data)
      } else {
        setError(response.error?.message || "Failed to load issue")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [issueId])

  const fetchLabels = useCallback(async () => {
    if (!issue?.projectId) return
    try {
      const response = await issueService.getLabels(issue.projectId)
      if (response.success && response.data) {
        setLabels(response.data)
      }
    } catch (err) {
      console.error("Failed to load labels:", err)
    }
  }, [issue?.projectId])

  const fetchHistory = useCallback(async () => {
    try {
      const response = await issueService.getChangeHistory(issueId)
      if (response.success && response.data) {
        setChangeHistory(response.data)
      }
    } catch (err) {
      console.error("Failed to load change history:", err)
    }
  }, [issueId])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchIssue()
      setLoading(false)
    }
    if (issueId) {
      loadData()
    }
  }, [issueId, fetchIssue])

  useEffect(() => {
    if (issue) {
      fetchLabels()
      fetchHistory()
    }
  }, [issue, fetchLabels, fetchHistory])

  const updateIssue = useCallback(
    async (data: {
      title?: string
      description?: string
      status?: string
      assigneeId?: string
      dueDate?: string
      priority?: "HIGH" | "MEDIUM" | "LOW"
      labelIds?: string[]
      order?: number
    }): Promise<Issue> => {
      try {
        setError(null)
        const response = await issueService.updateIssue(issueId, data)
        if (response.success && response.data) {
          setIssue(response.data)
          await fetchHistory() // Refresh history after update
          return response.data
        } else {
          throw new Error(response.error?.message || "Failed to update issue")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update issue"
        setError(errorMessage)
        throw err
      }
    },
    [issueId, fetchHistory]
  )

  const updateStatus = useCallback(
    async (status: string, order?: number): Promise<Issue> => {
      try {
        setError(null)
        const response = await issueService.updateStatus(issueId, status, order)
        if (response.success && response.data) {
          setIssue(response.data)
          await fetchHistory()
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
    [issueId, fetchHistory]
  )

  const deleteIssue = useCallback(async () => {
    try {
      setError(null)
      const response = await issueService.deleteIssue(issueId)
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to delete issue")
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete issue"
      setError(errorMessage)
      throw err
    }
  }, [issueId])

  const createSubtask = useCallback(
    async (data: { title: string; order?: number }): Promise<Subtask> => {
      try {
        setError(null)
        const response = await issueService.createSubtask(issueId, data)
        if (response.success && response.data) {
          const newSubtask = response.data
          setIssue((prev) =>
            prev
              ? {
                  ...prev,
                  subtasks: [...(prev.subtasks || []), newSubtask],
                }
              : null
          )
          return newSubtask
        } else {
          throw new Error(
            response.error?.message || "Failed to create subtask"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create subtask"
        setError(errorMessage)
        throw err
      }
    },
    [issueId]
  )

  const updateSubtask = useCallback(
    async (
      subtaskId: string,
      data: { title?: string; completed?: boolean; order?: number }
    ): Promise<Subtask> => {
      try {
        setError(null)
        const response = await issueService.updateSubtask(
          issueId,
          subtaskId,
          data
        )
        if (response.success && response.data) {
          const updatedSubtask = response.data
          setIssue((prev) =>
            prev
              ? {
                  ...prev,
                  subtasks: (prev.subtasks || []).map((subtask) =>
                    subtask.id === subtaskId ? updatedSubtask : subtask
                  ),
                }
              : null
          )
          return updatedSubtask
        } else {
          throw new Error(
            response.error?.message || "Failed to update subtask"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update subtask"
        setError(errorMessage)
        throw err
      }
    },
    [issueId]
  )

  const deleteSubtask = useCallback(
    async (subtaskId: string) => {
      try {
        setError(null)
        const response = await issueService.deleteSubtask(issueId, subtaskId)
        if (response.success) {
          setIssue((prev) =>
            prev
              ? {
                  ...prev,
                  subtasks: (prev.subtasks || []).filter(
                    (subtask) => subtask.id !== subtaskId
                  ),
                }
              : null
          )
        } else {
          throw new Error(
            response.error?.message || "Failed to delete subtask"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete subtask"
        setError(errorMessage)
        throw err
      }
    },
    [issueId]
  )

  const refreshIssue = useCallback(async () => {
    await fetchIssue()
  }, [fetchIssue])

  const refreshLabels = useCallback(async () => {
    await fetchLabels()
  }, [fetchLabels])

  const refreshHistory = useCallback(async () => {
    await fetchHistory()
  }, [fetchHistory])

  return {
    issue,
    labels,
    changeHistory,
    loading,
    error,
    updateIssue,
    updateStatus,
    deleteIssue,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    refreshIssue,
    refreshLabels,
    refreshHistory,
  }
}

