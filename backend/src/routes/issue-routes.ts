/**
 * Issue Routes
 * FR-030 to FR-039
 */

import { Router, Response } from 'express'
import { issueService } from '../services/issues/issue-service'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'

const router = Router()
router.use(authenticateToken)

/**
 * POST /api/issues
 * FR-030: Create Issue
 */
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { title, description, projectId, assigneeId, status, priority, dueDate, labels } = req.body

    if (!title || !projectId) {
      res.status(400).json({ success: false, error: { message: 'Title and projectId are required', code: 'MISSING_FIELDS' } })
      return
    }

    const issue = await issueService.createIssue({
      title,
      description,
      projectId,
      reporterId: req.userId,
      assigneeId,
      status,
      priority,
      dueDate,
      labels,
    })

    res.status(201).json({ success: true, data: issue })
  })
)

/**
 * GET /api/issues?projectId=xxx&page=1&limit=50
 * FR-031: Get Issues
 */
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId, page = '1', limit = '50', sortBy = 'createdAt', sortOrder = 'desc' } = req.query

    if (!projectId) {
      res.status(400).json({ success: false, error: { message: 'projectId is required', code: 'MISSING_PROJECT_ID' } })
      return
    }

    const filters: any = {}
    if (req.query.status) filters.status = Array.isArray(req.query.status) ? req.query.status : [req.query.status]
    if (req.query.priority) filters.priority = Array.isArray(req.query.priority) ? req.query.priority : [req.query.priority]
    if (req.query.assigneeId) filters.assigneeId = req.query.assigneeId as string
    if (req.query.reporterId) filters.reporterId = req.query.reporterId as string
    if (req.query.search) filters.search = req.query.search as string

    const result = await issueService.getIssues(
      projectId as string,
      Object.keys(filters).length > 0 ? filters : undefined,
      sortBy as any,
      sortOrder as 'asc' | 'desc',
      parseInt(page as string),
      parseInt(limit as string)
    )

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: result.total,
        totalPages: Math.ceil(result.total / parseInt(limit as string)),
      },
    })
  })
)

/**
 * GET /api/issues/search?projectId=xxx&q=query
 * FR-036: Search Issues
 */
router.get(
  '/search',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { projectId, q } = req.query

    if (!projectId || !q) {
      res.status(400).json({ success: false, error: { message: 'projectId and query are required', code: 'MISSING_FIELDS' } })
      return
    }

    const issues = await issueService.searchIssues(projectId as string, q as string)

    res.status(200).json({ success: true, data: issues })
  })
)

/**
 * GET /api/issues/:id
 * FR-032: Get Issue by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params

    const issue = await issueService.getIssueById(id)

    if (!issue) {
      res.status(404).json({ success: false, error: { message: 'Issue not found', code: 'ISSUE_NOT_FOUND' } })
      return
    }

    res.status(200).json({ success: true, data: issue })
  })
)

/**
 * PUT /api/issues/:id
 * FR-033: Update Issue
 */
router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { title, description, status, priority, assigneeId, dueDate, order } = req.body

    const issue = await issueService.updateIssue(id, {
      title,
      description,
      status,
      priority,
      assigneeId,
      dueDate,
      order,
    })

    res.status(200).json({ success: true, data: issue })
  })
)

/**
 * DELETE /api/issues/:id
 * FR-035: Delete Issue
 */
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params

    await issueService.deleteIssue(id)

    res.status(200).json({ success: true, message: 'Issue deleted successfully' })
  })
)

/**
 * PUT /api/issues/:id/assign
 * FR-034: Assign Issue
 */
router.put(
  '/:id/assign',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { assigneeId } = req.body

    const issue = await issueService.assignIssue(id, assigneeId || null)

    res.status(200).json({ success: true, data: issue })
  })
)

/**
 * PUT /api/issues/:id/priority
 * FR-037: Update Priority
 */
router.put(
  '/:id/priority',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { priority } = req.body

    if (!priority || !['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
      res.status(400).json({ success: false, error: { message: 'Valid priority is required', code: 'INVALID_PRIORITY' } })
      return
    }

    const issue = await issueService.updatePriority(id, priority)

    res.status(200).json({ success: true, data: issue })
  })
)

/**
 * POST /api/issues/:id/labels
 * FR-038: Add Label
 */
router.post(
  '/:id/labels',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { labelId } = req.body

    if (!labelId) {
      res.status(400).json({ success: false, error: { message: 'labelId is required', code: 'MISSING_LABEL_ID' } })
      return
    }

    await issueService.addLabel(id, labelId)

    res.status(200).json({ success: true, message: 'Label added successfully' })
  })
)

/**
 * DELETE /api/issues/:id/labels/:labelId
 * FR-038: Remove Label
 */
router.delete(
  '/:id/labels/:labelId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, labelId } = req.params

    await issueService.removeLabel(id, labelId)

    res.status(200).json({ success: true, message: 'Label removed successfully' })
  })
)

/**
 * POST /api/issues/:id/subtasks
 * FR-039-2: Create Subtask
 */
router.post(
  '/:id/subtasks',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { title, completed } = req.body

    if (!title) {
      res.status(400).json({ success: false, error: { message: 'Title is required', code: 'MISSING_TITLE' } })
      return
    }

    const subtask = await issueService.createSubtask(id, title, completed || false)

    res.status(201).json({ success: true, data: subtask })
  })
)

/**
 * PUT /api/issues/:id/subtasks/:subtaskId
 * Update Subtask
 */
router.put(
  '/:id/subtasks/:subtaskId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { subtaskId } = req.params
    const { title, completed } = req.body

    const subtask = await issueService.updateSubtask(subtaskId, { title, completed })

    res.status(200).json({ success: true, data: subtask })
  })
)

/**
 * DELETE /api/issues/:id/subtasks/:subtaskId
 * Delete Subtask
 */
router.delete(
  '/:id/subtasks/:subtaskId',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { subtaskId } = req.params

    await issueService.deleteSubtask(subtaskId)

    res.status(200).json({ success: true, message: 'Subtask deleted successfully' })
  })
)

export default router

