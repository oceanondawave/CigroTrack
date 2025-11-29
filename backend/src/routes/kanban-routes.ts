/**
 * Kanban Routes
 * FR-052 to FR-054
 */

import { Router, Response } from 'express'
import { kanbanService } from '../services/kanban/kanban-service'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'

const router = Router()
router.use(authenticateToken)

/**
 * GET /api/kanban/projects/:projectId/statuses
 * Get Custom Statuses
 */
router.get(
  '/projects/:projectId/statuses',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params

    const statuses = await kanbanService.getCustomStatuses(projectId)

    res.status(200).json({ success: true, data: statuses })
  })
)

/**
 * POST /api/kanban/projects/:projectId/statuses
 * FR-053: Create Custom Status
 */
router.post(
  '/projects/:projectId/statuses',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params
    const { name, color } = req.body

    if (!name) {
      res.status(400).json({ success: false, error: { message: 'name is required', code: 'MISSING_NAME' } })
      return
    }

    const status = await kanbanService.createCustomStatus(projectId, name, color)

    res.status(201).json({ success: true, data: status })
  })
)

/**
 * PUT /api/kanban/statuses/:id
 * Update Custom Status
 */
router.put(
  '/statuses/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { name, color, orderIndex } = req.body

    const status = await kanbanService.updateCustomStatus(id, { name, color, orderIndex })

    res.status(200).json({ success: true, data: status })
  })
)

/**
 * DELETE /api/kanban/statuses/:id
 * Delete Custom Status
 */
router.delete(
  '/statuses/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params

    await kanbanService.deleteCustomStatus(id)

    res.status(200).json({ success: true, message: 'Status deleted successfully' })
  })
)

/**
 * GET /api/kanban/projects/:projectId/wip-limits
 * Get WIP Limits
 */
router.get(
  '/projects/:projectId/wip-limits',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params

    const limits = await kanbanService.getWipLimits(projectId)

    res.status(200).json({ success: true, data: limits })
  })
)

/**
 * PUT /api/kanban/projects/:projectId/wip-limits
 * FR-054: Update WIP Limit
 */
router.put(
  '/projects/:projectId/wip-limits',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params
    const { status, limit } = req.body

    if (!status) {
      res.status(400).json({ success: false, error: { message: 'status is required', code: 'MISSING_STATUS' } })
      return
    }

    const wipLimit = await kanbanService.updateWipLimit(projectId, status, limit)

    res.status(200).json({ success: true, data: wipLimit })
  })
)

/**
 * GET /api/kanban/projects/:projectId/wip-limits/:status/check
 * Check WIP Limit
 */
router.get(
  '/projects/:projectId/wip-limits/:status/check',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId, status } = req.params

    const check = await kanbanService.checkWipLimit(projectId, status)

    res.status(200).json({ success: true, data: check })
  })
)

/**
 * PUT /api/kanban/projects/:projectId/issues/order
 * Update Issue Order (for drag & drop)
 */
router.put(
  '/projects/:projectId/issues/order',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params
    const { updates } = req.body

    if (!Array.isArray(updates)) {
      res.status(400).json({ success: false, error: { message: 'updates must be an array', code: 'INVALID_UPDATES' } })
      return
    }

    await kanbanService.updateIssueOrder(projectId, updates)

    res.status(200).json({ success: true, message: 'Issue order updated successfully' })
  })
)

export default router

