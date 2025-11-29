/**
 * Cookie Utility Functions
 * Helper functions for setting and clearing authentication cookies
 */

import { Response } from 'express'

const COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Set authentication token as httpOnly cookie
 */
export function setAuthCookie(res: Response, token: string): void {
  const cookieOptions: {
    httpOnly: boolean
    secure: boolean
    sameSite: 'strict' | 'lax' | 'none'
    maxAge: number
    path: string
    domain?: string
  } = {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: isProduction, // Only sent over HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production, 'lax' for same-origin in dev
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  }

  // In development (localhost), don't set domain
  // In production, optionally set domain for subdomain sharing
  if (isProduction && process.env.COOKIE_DOMAIN) {
    cookieOptions.domain = process.env.COOKIE_DOMAIN
  }

  // If SameSite is 'none', Secure must be true (even in dev, but browsers require HTTPS)
  if (cookieOptions.sameSite === 'none') {
    cookieOptions.secure = true
  }

  res.cookie(COOKIE_NAME, token, cookieOptions)
  
  // Debug: Log cookie setting (remove in production)
  if (!isProduction) {
    console.log('🍪 Cookie set:', {
      name: COOKIE_NAME,
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: COOKIE_MAX_AGE,
      path: cookieOptions.path,
    })
  }
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  })
}

