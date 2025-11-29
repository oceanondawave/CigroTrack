/**
 * Authentication Routes
 * FR-001 to FR-007
 */

import { Router, Request, Response } from 'express'
import { authService } from '../services/auth/auth-service'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'
import { setAuthCookie, clearAuthCookie } from '../utils/cookies'

const router = Router()

/**
 * POST /api/auth/signup
 * FR-001: Email/Password Signup
 */
router.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: { message: 'Name, email, and password are required', code: 'MISSING_FIELDS' } })
      return
    }

    const result = await authService.signup({ name, email, password })

    // Set httpOnly cookie with token
    if (result.token) {
      setAuthCookie(res, result.token)
    }

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        // Don't send token in response body when using cookies
      },
    })
  })
)

/**
 * POST /api/auth/login
 * FR-002: Email/Password Login
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, error: { message: 'Email and password are required', code: 'MISSING_FIELDS' } })
      return
    }

    const result = await authService.login({ email, password })

    // Set httpOnly cookie with token
    if (result.token) {
      setAuthCookie(res, result.token)
    }

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        // Don't send token in response body when using cookies
      },
    })
  })
)

/**
 * POST /api/auth/logout
 * FR-002: Logout
 */
router.post(
  '/logout',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Clear authentication cookie
    clearAuthCookie(res)

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  })
)

/**
 * GET /api/auth/me
 * Get current user
 */
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    res.status(200).json({
      success: true,
      data: req.user,
    })
  })
)

/**
 * POST /api/auth/forgot-password
 * FR-003: Password Reset Request
 */
router.post(
  '/forgot-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body

    if (!email) {
      res.status(400).json({ success: false, error: { message: 'Email is required', code: 'MISSING_EMAIL' } })
      return
    }

    await authService.requestPasswordReset(email)

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    })
  })
)

/**
 * POST /api/auth/reset-password
 * FR-003: Password Reset
 */
router.post(
  '/reset-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      res.status(400).json({ success: false, error: { message: 'Token and new password are required', code: 'MISSING_FIELDS' } })
      return
    }

    await authService.resetPassword(token, newPassword)

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    })
  })
)

/**
 * POST /api/auth/google
 * FR-004: Google OAuth Login
 */
router.post(
  '/google',
  asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body

    if (!idToken) {
      res.status(400).json({ success: false, error: { message: 'ID token is required', code: 'MISSING_TOKEN' } })
      return
    }

    const result = await authService.googleOAuthLogin(idToken)

    // Set httpOnly cookie with token
    if (result.token) {
      setAuthCookie(res, result.token)
    }

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        // Don't send token in response body when using cookies
      },
    })
  })
)

/**
 * PUT /api/auth/profile
 * FR-005: Update Profile
 */
router.put(
  '/profile',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { name, avatar } = req.body

    const updatedUser = await authService.updateProfile(req.userId, { name, avatar })

    res.status(200).json({
      success: true,
      data: updatedUser,
    })
  })
)

/**
 * POST /api/auth/change-password
 * FR-005: Change Password
 */
router.post(
  '/change-password',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: { message: 'Current password and new password are required', code: 'MISSING_FIELDS' } })
      return
    }

    await authService.changePassword(req.userId, currentPassword, newPassword)

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    })
  })
)

/**
 * DELETE /api/auth/account
 * FR-007: Delete Account
 */
router.delete(
  '/account',
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
      return
    }

    await authService.deleteAccount(req.userId)

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    })
  })
)

export default router

