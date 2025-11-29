/**
 * Notifications feature types
 */

import type { Notification, NotificationType } from "@/types"

export interface NotificationFilters {
  type?: NotificationType[]
  read?: boolean
}

export interface NotificationStats {
  unreadCount: number
  totalCount: number
}

