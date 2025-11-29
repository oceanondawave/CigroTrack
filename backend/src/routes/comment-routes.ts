/**
 * Comment Routes
 * FR-060 to FR-063
 */

import { Router, Response } from 'express'
import { commentService } from '../services/comments/comment-service'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'

const router = Router()
router.use(authenticateToken)

/**
 * POST /api/comments
 * FR-060: Create Comment
 */
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { issueId, content } = req.body

    if (!issueId || !content) {
      res.status(400).json({ success: false, error: { message: 'issueId and content are required', code: 'MISSING_FIELDS' } })
      return
    }

    const comment = await commentService.createComment({
      issueId,
      authorId: req.userId,
      content,
    })

    res.status(201).json({ success: true, data: comment })
  })
)

/**
 * GET /api/comments?issueId=xxx&page=1&limit=50
 * FR-061: Get Comments
 */
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { issueId, page = '1', limit = '50' } = req.query

    if (!issueId) {
      res.status(400).json({ success: false, error: { message: 'issueId is required', code: 'MISSING_ISSUE_ID' } })
      return
    }

    const result = await commentService.getComments(issueId as string, parseInt(page as string), parseInt(limit as string))

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
 * PUT /api/comments/:id
 * FR-062: Update Comment
 */
router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params
    const { content } = req.body

    if (!content) {
      res.status(400).json({ success: false, error: { message: 'content is required', code: 'MISSING_CONTENT' } })
      return
    }

    const comment = await commentService.updateComment(id, { content }, req.userId)

    res.status(200).json({ success: true, data: comment })
  })
)

/**
 * DELETE /api/comments/:id
 * FR-063: Delete Comment
 */
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params

    await commentService.deleteComment(id, req.userId)

    res.status(200).json({ success: true, message: 'Comment deleted successfully' })
  })
)

export default router

