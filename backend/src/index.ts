/**
 * Backend Server Entry Point
 * Express server with Supabase integration
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { testSupabaseConnection } from './config/supabase'
import { errorHandler } from './middleware/error-handler'

// Import routes
import authRoutes from './routes/auth-routes'
import teamRoutes from './routes/team-routes'
import projectRoutes from './routes/project-routes'
import issueRoutes from './routes/issue-routes'
import commentRoutes from './routes/comment-routes'
import kanbanRoutes from './routes/kanban-routes'
import dashboardRoutes from './routes/dashboard-routes'
import notificationRoutes from './routes/notification-routes'
import aiRoutes from './routes/ai-routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'CigroTrack API v1', version: '1.0.0' })
})

// Mount routes
app.use('/api/auth', authRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/kanban', kanbanRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/ai', aiRoutes)

// Error handler (must be last)
app.use(errorHandler)

// Start server
async function start() {
  // Test Supabase connection
  const connected = await testSupabaseConnection()
  if (!connected) {
    console.error('Failed to connect to Supabase. Check your environment variables.')
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/health`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

