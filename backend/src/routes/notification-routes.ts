/**
 * Notification Routes
 * FR-090 to FR-091
 */

import { Router, Response } from 'express'
import { notificationService } from '../services/notifications/notification-service'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'

const router = Router()
router.use(authenticateToken)

/**
 * GET /api/notifications?read=true|false&limit=50
 * FR-090: Get Notifications
 */
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const read = req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined
    const limit = parseInt(req.query.limit as string) || 50

    const notifications = await notificationService.getNotifications(req.userId, read, limit)

    res.status(200).json({ success: true, data: notifications })
  })
)

/**
 * GET /api/notifications/unread-count
 * Get Unread Count
 */
router.get(
  '/unread-count',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const count = await notificationService.getUnreadCount(req.userId)

    res.status(200).json({ success: true, data: { count } })
  })
)

/**
 * PUT /api/notifications/:id/read
 * FR-091: Mark Notification as Read
 */
router.put(
  '/:id/read',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params

    const notification = await notificationService.markAsRead(id, req.userId)

    res.status(200).json({ success: true, data: notification })
  })
)

/**
 * PUT /api/notifications/read-all
 * Mark All Notifications as Read
 */
router.put(
  '/read-all',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    await notificationService.markAllAsRead(req.userId)

    res.status(200).json({ success: true, message: 'All notifications marked as read' })
  })
)

/**
 * DELETE /api/notifications/:id
 * Delete Notification
 */
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params

    await notificationService.deleteNotification(id, req.userId)

    res.status(200).json({ success: true, message: 'Notification deleted successfully' })
  })
)

export default router

