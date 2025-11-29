/**
 * Issues Hook
 * Manages issues list and operations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { issueService } from "../services/issue-service"
import type { Issue, IssueFilters, SortOption } from "@/types"

interface UseIssuesReturn {
  issues: Issue[]
  loading: boolean
  error: string | null
  total: number
  page: number
  hasMore: boolean
  createIssue: (
    projectId: string,
    data: {
      title: string
      description?: string
      assigneeId?: string
      dueDate?: string
      priority?: "HIGH" | "MEDIUM" | "LOW"
      labelIds?: string[]
    }
  ) => Promise<Issue>
  refreshIssues: () => Promise<void>
  loadMore: () => Promise<void>
  setFilters: (filters: IssueFilters) => void
  setSort: (sort: SortOption) => void
}

export function useIssues(
  projectId: string,
  initialFilters?: IssueFilters,
  initialSort?: SortOption
): UseIssuesReturn {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<IssueFilters>(initialFilters || {})
  const [sort, setSortState] = useState<SortOption>(
    initialSort || { field: "createdAt", direction: "desc" }
  )
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const fetchIssues = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      try {
        setLoading(true)
        setError(null)
        const response = await issueService.searchIssues(
          projectId,
          filters,
          sort,
          { page: pageNum, limit: 20 }
        )
        if (response.success && response.data) {
          const paginatedData = response.data
          if (reset || pageNum === 1) {
            setIssues(paginatedData.data)
          } else {
            setIssues((prev) => [...prev, ...paginatedData.data])
          }
          setTotal(paginatedData.pagination.total)
          setHasMore(
            paginatedData.pagination.page < paginatedData.pagination.totalPages
          )
          setPage(pageNum)
        } else {
          setError(response.error?.message || "Failed to load issues")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    },
    [projectId, filters, sort]
  )

  useEffect(() => {
    fetchIssues(1, true)
  }, [fetchIssues])

  const createIssue = useCallback(
    async (
      projectId: string,
      data: {
        title: string
        description?: string
        assigneeId?: string
        dueDate?: string
        priority?: "HIGH" | "MEDIUM" | "LOW"
        labelIds?: string[]
      }
    ): Promise<Issue> => {
      try {
        setError(null)
        const response = await issueService.createIssue(projectId, data)
        if (response.success && response.data) {
          const newIssue = response.data
          setIssues((prev) => [newIssue, ...prev])
          setTotal((prev) => prev + 1)
          return newIssue
        } else {
          throw new Error(response.error?.message || "Failed to create issue")
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create issue"
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const refreshIssues = useCallback(async () => {
    await fetchIssues(1, true)
  }, [fetchIssues])

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchIssues(page + 1, false)
    }
  }, [hasMore, loading, page, fetchIssues])

  const setFilters = useCallback((newFilters: IssueFilters) => {
    setFiltersState(newFilters)
    setPage(1)
  }, [])

  const setSort = useCallback((newSort: SortOption) => {
    setSortState(newSort)
    setPage(1)
  }, [])

  return {
    issues,
    loading,
    error,
    total,
    page,
    hasMore,
    createIssue,
    refreshIssues,
    loadMore,
    setFilters,
    setSort,
  }
}

