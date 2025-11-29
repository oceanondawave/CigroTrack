/**
 * Project Routes
 * FR-020 to FR-027
 */

import { Router, Response } from 'express'
import { projectService } from '../services/projects/project-service'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'

const router = Router()
router.use(authenticateToken)

/**
 * POST /api/projects
 * FR-020: Create Project
 */
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { name, description, teamId } = req.body

    if (!name || !teamId) {
      res.status(400).json({ success: false, error: { message: 'Name and teamId are required', code: 'MISSING_FIELDS' } })
      return
    }

    const project = await projectService.createProject({
      name,
      description,
      teamId,
      ownerId: req.userId,
    })

    res.status(201).json({ success: true, data: project })
  })
)

/**
 * GET /api/projects?teamId=xxx&status=active
 * FR-021: Get Projects
 * If teamId is not provided, returns all projects for all teams the user belongs to
 */
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { teamId, status } = req.query

    if (teamId) {
      // Get projects for specific team
      const projects = await projectService.getProjects(teamId as string, status as 'active' | 'archived' | undefined)
      res.status(200).json({ success: true, data: projects })
    } else {
      // Get projects for all teams the user belongs to
      const projects = await projectService.getProjectsForUser(req.userId, status as 'active' | 'archived' | undefined)
      res.status(200).json({ success: true, data: projects })
    }
  })
)

/**
 * GET /api/projects/favorites
 * FR-027: Get Favorite Projects
 */
router.get(
  '/favorites',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const projects = await projectService.getFavoriteProjects(req.userId)

    res.status(200).json({ success: true, data: projects })
  })
)

/**
 * GET /api/projects/:id/board
 * FR-050: Get Kanban Board Data
 * Get issues organized by status for a project
 */
router.get(
  '/:id/board',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params

    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Project ID is required', code: 'MISSING_PROJECT_ID' } })
      return
    }

    try {
      const boardData = await projectService.getBoardData(id)
      res.status(200).json({ success: true, data: boardData })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Error in GET /api/projects/:id/board:', errorMessage)
      res.status(500).json({ 
        success: false, 
        error: { 
          message: errorMessage || 'Failed to fetch board data', 
          code: 'BOARD_FETCH_ERROR' 
        } 
      })
    }
  })
)

/**
 * GET /api/projects/:id
 * FR-022: Get Project by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params

    const project = await projectService.getProjectById(id)

    if (!project) {
      res.status(404).json({ success: false, error: { message: 'Project not found', code: 'PROJECT_NOT_FOUND' } })
      return
    }

    res.status(200).json({ success: true, data: project })
  })
)

/**
 * PUT /api/projects/:id
 * FR-023: Update Project
 */
router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params
    const { name, description, status } = req.body

    const project = await projectService.updateProject(id, { name, description, status }, req.userId)

    res.status(200).json({ success: true, data: project })
  })
)

/**
 * POST /api/projects/:id/archive
 * FR-024: Archive Project
 */
router.post(
  '/:id/archive',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params

    const project = await projectService.archiveProject(id, req.userId)

    res.status(200).json({ success: true, data: project })
  })
)

/**
 * POST /api/projects/:id/favorite
 * FR-027: Toggle Favorite
 */
router.post(
  '/:id/favorite',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params

    const isFavorite = await projectService.toggleFavorite(id, req.userId)

    res.status(200).json({ success: true, data: { isFavorite } })
  })
)

/**
 * DELETE /api/projects/:id
 * Delete Project
 */
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { id } = req.params

    await projectService.deleteProject(id, req.userId)

    res.status(200).json({ success: true, message: 'Project deleted successfully' })
  })
)

export default router

