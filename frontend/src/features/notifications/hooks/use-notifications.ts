/**
 * Notifications Hook
 * Manages notifications list and operations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { notificationService } from "../services/notification-service"
import type { Notification } from "@/types"

interface UseNotificationsReturn {
  notifications: Notification[]
  loading: boolean
  error: string | null
  unreadCount: number
  page: number
  hasMore: boolean
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  loadMore: () => Promise<void>
  refreshUnreadCount: () => Promise<void>
}

export function useNotifications(unreadOnly: boolean = false): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchNotifications = useCallback(
    async (pageNum: number = 1, reset: boolean = false) => {
      try {
        setLoading(true)
        setError(null)
        const response = await notificationService.getNotifications({
          page: pageNum,
          limit: 20,
          unreadOnly,
        })
        if (response.success && response.data) {
          const paginatedData = response.data
          const notificationList = paginatedData.data || []
          if (reset || pageNum === 1) {
            setNotifications(notificationList)
          } else {
            setNotifications((prev) => [...(prev || []), ...notificationList])
          }
          setHasMore(
            paginatedData.pagination?.page < paginatedData.pagination?.totalPages
          )
          setPage(pageNum)
        } else {
          setError(response.error?.message || "Failed to load notifications")
          // Ensure notifications is always an array even on error
          if (reset || pageNum === 1) {
            setNotifications([])
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    },
    [unreadOnly]
  )

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount()
      if (response.success && response.data !== undefined) {
        setUnreadCount(typeof response.data === 'number' ? response.data : 0)
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err)
    }
  }, [])

  useEffect(() => {
    fetchNotifications(1, true)
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId)
      if (response.success && response.data) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? response.data! : notif
          )
        )
        await fetchUnreadCount()
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }, [fetchUnreadCount])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead()
      if (response.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, read: true }))
        )
        setUnreadCount(0)
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }, [])

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(1, true)
  }, [fetchNotifications])

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchNotifications(page + 1, false)
    }
  }, [hasMore, loading, page, fetchNotifications])

  return {
    notifications,
    loading,
    error,
    unreadCount,
    page,
    hasMore,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    loadMore,
    refreshUnreadCount: fetchUnreadCount,
  }
}

