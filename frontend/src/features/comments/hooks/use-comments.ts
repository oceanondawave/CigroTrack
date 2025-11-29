/**
 * Comments Hook
 * Manages comments for an issue
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { commentService } from "../services/comment-service"
import type { Comment, PaginatedResponse } from "@/types"

interface UseCommentsReturn {
  comments: Comment[]
  loading: boolean
  error: string | null
  page: number
  hasMore: boolean
  total: number
  createComment: (content: string) => Promise<Comment>
  updateComment: (commentId: string, content: string) => Promise<Comment>
  deleteComment: (commentId: string) => Promise<void>
  refreshComments: () => Promise<void>
  loadMore: () => Promise<void>
}

export function useComments(issueId: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchComments = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      try {
        setLoading(true)
        setError(null)
        const response = await commentService.getComments(issueId, {
          page: pageNum,
          limit: 20,
        })
        if (response.success && response.data) {
          const paginatedData = response.data
          if (reset || pageNum === 1) {
            setComments(paginatedData.data)
          } else {
            setComments((prev) => [...prev, ...paginatedData.data])
          }
          setTotal(paginatedData.pagination.total)
          setHasMore(
            paginatedData.pagination.page < paginatedData.pagination.totalPages
          )
          setPage(pageNum)
        } else {
          setError(response.error?.message || "Failed to load comments")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    },
    [issueId]
  )

  useEffect(() => {
    fetchComments(1, true)
  }, [fetchComments])

  const createComment = useCallback(
    async (content: string): Promise<Comment> => {
      try {
        setError(null)
        const response = await commentService.createComment(issueId, content)
        if (response.success && response.data) {
          const newComment = response.data
          setComments((prev) => [...prev, newComment])
          setTotal((prev) => prev + 1)
          return newComment
        } else {
          throw new Error(
            response.error?.message || "Failed to create comment"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create comment"
        setError(errorMessage)
        throw err
      }
    },
    [issueId]
  )

  const updateComment = useCallback(
    async (commentId: string, content: string): Promise<Comment> => {
      try {
        setError(null)
        const response = await commentService.updateComment(
          issueId,
          commentId,
          content
        )
        if (response.success && response.data) {
          const updatedComment = response.data
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === commentId ? updatedComment : comment
            )
          )
          return updatedComment
        } else {
          throw new Error(
            response.error?.message || "Failed to update comment"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update comment"
        setError(errorMessage)
        throw err
      }
    },
    [issueId]
  )

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        setError(null)
        const response = await commentService.deleteComment(issueId, commentId)
        if (response.success) {
          setComments((prev) => prev.filter((comment) => comment.id !== commentId))
          setTotal((prev) => prev - 1)
        } else {
          throw new Error(
            response.error?.message || "Failed to delete comment"
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete comment"
        setError(errorMessage)
        throw err
      }
    },
    [issueId]
  )

  const refreshComments = useCallback(async () => {
    await fetchComments(1, true)
  }, [fetchComments])

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchComments(page + 1, false)
    }
  }, [hasMore, loading, page, fetchComments])

  return {
    comments,
    loading,
    error,
    page,
    hasMore,
    total,
    createComment,
    updateComment,
    deleteComment,
    refreshComments,
    loadMore,
  }
}

