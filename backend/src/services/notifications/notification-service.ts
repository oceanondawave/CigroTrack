/**
 * Notification Service
 * Handles notification operations
 * FR-090 to FR-091
 */

import { supabaseAdmin } from '../../config/supabase'
import type { Notification } from '../../types'

export interface CreateNotificationData {
  userId: string
  title: string
  message?: string
  type: 'issue_assigned' | 'comment_added' | 'due_date_approaching' | 'due_date_today' | 'team_invite' | 'role_changed'
  link?: string
  metadata?: Record<string, unknown>
}

export class NotificationService {
  /**
   * Create notification
   */
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: notificationData, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: data.userId,
        title: data.title,
        message: data.message || null,
        type: data.type,
        link: data.link || null,
        metadata: data.metadata || null,
        read: false,
      })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to create notification')
    }

    return this.mapDbNotificationToNotification(notificationData)
  }

  /**
   * FR-090: Get Notifications
   */
  async getNotifications(userId: string, read?: boolean, limit: number = 50): Promise<Notification[]> {
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (read !== undefined) {
      query = query.eq('read', read)
    }

    const { data: notificationsData, error } = await query

    if (error) {
      throw new Error('Failed to fetch notifications')
    }

    return (notificationsData || []).map((n: any) => this.mapDbNotificationToNotification(n))
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      throw new Error('Failed to get unread count')
    }

    return count || 0
  }

  /**
   * FR-091: Mark Notification as Read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    // Verify ownership
    const notification = await this.getNotificationById(notificationId)
    if (!notification) {
      throw new Error('Notification not found')
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const { data: updatedNotification, error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to mark notification as read')
    }

    return this.mapDbNotificationToNotification(updatedNotification)
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabaseAdmin.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)

    if (error) {
      throw new Error('Failed to mark all notifications as read')
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(notificationId: string): Promise<Notification | null> {
    const { data: notificationData, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error('Failed to fetch notification')
    }

    return this.mapDbNotificationToNotification(notificationData)
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.getNotificationById(notificationId)
    if (!notification) {
      throw new Error('Notification not found')
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const { error } = await supabaseAdmin.from('notifications').delete().eq('id', notificationId)

    if (error) {
      throw new Error('Failed to delete notification')
    }
  }

  /**
   * Map database notification to Notification type
   */
  private mapDbNotificationToNotification(dbNotification: any): Notification {
    return {
      id: dbNotification.id,
      userId: dbNotification.user_id,
      title: dbNotification.title,
      message: dbNotification.message || undefined,
      type: dbNotification.type,
      read: dbNotification.read || false,
      link: dbNotification.link || undefined,
      metadata: dbNotification.metadata || undefined,
      createdAt: dbNotification.created_at,
    }
  }
}

export const notificationService = new NotificationService()

