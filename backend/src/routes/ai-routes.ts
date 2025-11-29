/**
 * AI Routes
 * FR-040 to FR-045
 */

import { Router, Response } from 'express'
import { aiService } from '../services/ai/ai-service'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'

const router = Router()
router.use(authenticateToken)

/**
 * POST /api/ai/issues/:id/summary
 * FR-040: Generate Issue Summary
 */
router.post(
  '/issues/:id/summary',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params
    const { description } = req.body

    if (!description) {
      res.status(400).json({ success: false, error: { message: 'description is required', code: 'MISSING_DESCRIPTION' } })
      return
    }

    const summary = await aiService.generateSummary(id, req.userId, description)

    res.status(200).json({ success: true, data: { summary } })
  })
)

/**
 * POST /api/ai/issues/:id/suggestion
 * FR-041: Generate Solution Suggestion
 */
router.post(
  '/issues/:id/suggestion',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params
    const { description } = req.body

    if (!description) {
      res.status(400).json({ success: false, error: { message: 'description is required', code: 'MISSING_DESCRIPTION' } })
      return
    }

    const suggestion = await aiService.generateSuggestion(id, req.userId, description)

    res.status(200).json({ success: true, data: { suggestion } })
  })
)

/**
 * POST /api/ai/issues/:id/auto-label
 * FR-043: Auto-label Issue
 */
router.post(
  '/issues/:id/auto-label',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params
    const { title, description } = req.body

    if (!title) {
      res.status(400).json({ success: false, error: { message: 'title is required', code: 'MISSING_TITLE' } })
      return
    }

    const labels = await aiService.autoLabelIssue(id, req.userId, title, description)

    res.status(200).json({ success: true, data: { labels } })
  })
)

/**
 * POST /api/ai/issues/:id/duplicates
 * FR-044: Detect Duplicate Issues
 */
router.post(
  '/issues/:id/duplicates',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params
    const { title, description } = req.body

    if (!title) {
      res.status(400).json({ success: false, error: { message: 'title is required', code: 'MISSING_TITLE' } })
      return
    }

    const duplicates = await aiService.detectDuplicates(id, req.userId, title, description)

    res.status(200).json({ success: true, data: { duplicates } })
  })
)

/**
 * POST /api/ai/issues/:id/comments/summary
 * FR-045: Summarize Comments
 */
router.post(
  '/issues/:id/comments/summary',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params
    const { commentCount } = req.body

    if (!commentCount || commentCount < 5) {
      res.status(400).json({ success: false, error: { message: 'At least 5 comments are required', code: 'INSUFFICIENT_COMMENTS' } })
      return
    }

    const summary = await aiService.summarizeComments(id, req.userId, commentCount)

    res.status(200).json({ success: true, data: { summary } })
  })
)

/**
 * GET /api/ai/rate-limit
 * Get Rate Limit Status
 */
router.get(
  '/rate-limit',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const rateLimit = await aiService.getRateLimit(req.userId)

    res.status(200).json({ success: true, data: rateLimit })
  })
)

export default router

