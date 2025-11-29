/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

import { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

export function errorHandler(err: ApiError, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err.statusCode || 500
  const message = String(err.message || 'Internal server error')
  const code = String(err.code || 'INTERNAL_ERROR')

  // Only log primitive values to avoid circular references
  console.error(`Error [${code}]: ${message} (status: ${statusCode})`)
  if (process.env.NODE_ENV === 'development' && err.stack) {
    console.error('Stack:', String(err.stack))
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
    },
  })
}

/**
 * Async route wrapper to catch errors
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

