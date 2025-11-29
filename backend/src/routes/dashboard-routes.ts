/**
 * Dashboard Routes
 * FR-080 to FR-082
 */

import { Router, Response } from 'express'
import { dashboardService } from '../services/dashboard/dashboard-service'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'

const router = Router()
router.use(authenticateToken)

/**
 * GET /api/dashboard/projects/:projectId
 * FR-080: Get Project Dashboard
 */
router.get(
  '/projects/:projectId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params

    const dashboard = await dashboardService.getProjectDashboard(projectId)

    res.status(200).json({ success: true, data: dashboard })
  })
)

/**
 * GET /api/dashboard/personal
 * FR-081: Get Personal Dashboard
 */
router.get(
  '/personal',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    try {
      const dashboard = await dashboardService.getPersonalDashboard(req.userId)
      res.status(200).json({ success: true, data: dashboard })
    } catch (error) {
      console.error('Error in GET /api/dashboard/personal:', {
        userId: req.userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw error // Re-throw to be handled by asyncHandler
    }
  })
)

/**
 * GET /api/dashboard/teams/:teamId/statistics?period=7days|30days|90days
 * FR-082: Get Team Statistics
 */
router.get(
  '/teams/:teamId/statistics',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { teamId } = req.params
    const period = (req.query.period as '7days' | '30days' | '90days') || '7days'

    if (!['7days', '30days', '90days'].includes(period)) {
      res.status(400).json({ success: false, error: { message: 'Invalid period. Must be 7days, 30days, or 90days', code: 'INVALID_PERIOD' } })
      return
    }

    const statistics = await dashboardService.getTeamStatistics(teamId, period)

    res.status(200).json({ success: true, data: statistics })
  })
)

export default router

