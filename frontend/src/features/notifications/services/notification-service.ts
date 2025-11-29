/**
 * Notification Service
 * Handles notification-related API calls (FR-090 to FR-091)
 */

import { apiClient } from "@/lib/api/client"
import type { ApiResponse, PaginatedResponse } from "@/types"
import type { Notification } from "@/types"

export const notificationService = {
  /**
   * FR-090: Get Notifications
   * Get user's notifications with pagination
   */
  async getNotifications(params?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  }): Promise<ApiResponse<PaginatedResponse<Notification>>> {
    const queryParams: any = {}
    if (params?.page) queryParams.page = params.page
    if (params?.limit) queryParams.limit = params.limit
    if (params?.unreadOnly !== undefined) queryParams.read = params.unreadOnly ? 'false' : undefined
    return apiClient.getPaginated<Notification>("/notifications", queryParams)
      .then((data) => ({ success: true as const, data }))
      .catch((error) => ({ success: false as const, error: { message: error.message || "Failed to fetch notifications" } }))
  },

  /**
   * FR-091: Mark as Read
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    return apiClient.put<Notification>(`/notifications/${notificationId}/read`)
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.put<void>("/notifications/read-all")
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<ApiResponse<number>> {
    const response = await apiClient.get<{ count: number }>("/notifications/unread-count")
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.count,
      }
    }
    return {
      success: false,
      error: response.error,
    }
  },
}

