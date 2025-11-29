/**
 * Core type definitions for CigroTrack
 * Based on PRD requirements - all types should be defined here
 */

// ============================================
// User & Authentication Types (FR-001 to FR-007)
// ============================================
export interface User {
  id: string
  name: string // 1-50 characters (FR-001, FR-005)
  email: string // Unique, email format, max 255 characters (FR-001)
  avatar?: string // Profile image URL (FR-005)
  authProvider: "email" | "google" // To distinguish OAuth users (FR-004, FR-006)
  createdAt: string
  updatedAt: string
  deletedAt?: string // Soft delete (FR-007, FR-071)
}

// ============================================
// Team Types (FR-010 to FR-019)
// ============================================
export interface Team {
  id: string
  name: string // 1-50 characters (FR-010)
  ownerId: string // Team creator (FR-010)
  owner?: User
  createdAt: string
  updatedAt: string
  deletedAt?: string // Soft delete (FR-012, FR-071)
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  user: User
  role: TeamRole // OWNER/ADMIN/MEMBER (FR-017)
  joinedAt: string
}

export type TeamRole = "OWNER" | "ADMIN" | "MEMBER" // FR-017

export interface TeamInvite {
  id: string
  teamId: string
  team?: Team
  email: string
  role: TeamRole
  invitedBy: string
  invitedByUser?: User
  expiresAt: string // 7 days expiration (FR-013)
  status: "pending" | "accepted" | "expired"
  createdAt: string
}

export interface TeamActivity {
  id: string
  teamId: string
  userId: string
  user: User
  action: string // FR-019
  targetType: "member" | "project" | "team"
  targetId: string
  targetName: string
  metadata?: Record<string, unknown>
  createdAt: string
}

// ============================================
// Project Types (FR-020 to FR-027)
// ============================================
export interface Project {
  id: string
  name: string // 1-100 characters (FR-020)
  description?: string // Max 2000 characters, markdown supported (FR-025)
  teamId: string
  team?: Team
  ownerId: string // Project creator (FR-020)
  owner?: User
  status: ProjectStatus // FR-026
  issueCount?: number
  createdAt: string
  updatedAt: string
  deletedAt?: string // Soft delete (FR-024, FR-071)
}

export type ProjectStatus = "active" | "archived" // FR-026

export interface ProjectFavorite {
  id: string
  userId: string
  projectId: string
  createdAt: string
}

export interface CustomStatus {
  id: string
  projectId: string
  name: string // 1-30 characters (FR-053)
  color?: string // HEX color code (FR-053)
  position: number // Column order (FR-053)
  createdAt: string
}

export interface WipLimit {
  status: string // Status name (default or custom)
  limit: number | null // 1-50 or null for unlimited (FR-054)
}

// ============================================
// Issue Types (FR-030 to FR-039-2)
// ============================================
export interface Issue {
  id: string
  title: string // 1-200 characters (FR-030)
  description?: string // Max 5000 characters (FR-030)
  projectId: string
  project?: Project
  status: IssueStatus // Default: "Backlog" (FR-030)
  priority: Priority // Default: "MEDIUM" (FR-030, FR-037)
  assigneeId?: string // Must be team member (FR-034)
  assignee?: User
  reporterId: string // Issue creator (FR-030)
  reporter?: User
  labels: Label[] // Max 5 per issue (FR-038)
  subtasks?: Subtask[] // Max 20 per issue (FR-039-2)
  dueDate?: string // Date format (FR-030)
  order?: number // For column ordering (FR-052)
  createdAt: string
  updatedAt: string
  deletedAt?: string // Soft delete (FR-035, FR-071)
}

export type IssueStatus = "Backlog" | "In Progress" | "Done" | string // Default 3 + custom (FR-033, FR-053)

export type Priority = "HIGH" | "MEDIUM" | "LOW" // FR-037

export interface Label {
  id: string
  name: string // 1-30 characters (FR-038)
  color: string // HEX color code (FR-038)
  projectId: string // Max 20 per project (FR-038)
  createdAt: string
}

export interface Subtask {
  id: string
  issueId: string
  title: string // 1-200 characters (FR-039-2)
  completed: boolean
  order: number // For drag reorder (FR-039-2)
  createdAt: string
  updatedAt: string
}

export interface IssueChangeHistory {
  id: string
  issueId: string
  userId: string
  user: User
  field: "status" | "assignee" | "priority" | "title" | "dueDate" // FR-039
  previousValue: string
  newValue: string
  createdAt: string
}

// ============================================
// Comment Types (FR-060 to FR-063)
// ============================================
export interface Comment {
  id: string
  issueId: string
  authorId: string
  author: User
  content: string // 1-1000 characters (FR-060)
  deleted: boolean // Soft delete (FR-071)
  createdAt: string
  updatedAt: string
}

// ============================================
// AI Feature Types (FR-040 to FR-045)
// ============================================
export interface AiSummary {
  id: string
  issueId: string
  summary: string // 2-4 sentences (FR-040)
  cachedAt: string
}

export interface AiSuggestion {
  id: string
  issueId: string
  suggestion: string // Solution approach (FR-041)
  cachedAt: string
}

export interface AiCommentSummary {
  id: string
  issueId: string
  summary: string // 3-5 sentences (FR-045)
  keyDecisions?: string[]
  cachedAt: string
}

export interface AiRateLimit {
  userId: string
  requestsPerMinute: number // Max 10 (FR-042)
  requestsPerDay: number // Max 100 (FR-042)
  lastRequestAt?: string
  dailyCount: number
  dailyResetAt: string
}

// ============================================
// Notification Types (FR-090 to FR-091)
// ============================================
export interface Notification {
  id: string
  userId: string
  title: string
  message?: string
  type: NotificationType
  read: boolean
  link?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export type NotificationType =
  | "issue_assigned" // FR-090
  | "comment_added" // FR-090
  | "due_date_approaching" // 1 day before (FR-090)
  | "due_date_today" // FR-090
  | "team_invite" // FR-090
  | "role_changed" // FR-090

// ============================================
// Dashboard & Statistics Types (FR-080 to FR-082)
// ============================================
export interface ProjectDashboard {
  issueCountByStatus: {
    status: string
    count: number
  }[]
  completionRate: number // Done / Total (FR-080)
  issueCountByPriority: {
    priority: Priority
    count: number
  }[]
  recentlyCreatedIssues: Issue[] // Max 5 (FR-080)
  issuesDueSoon: Issue[] // Within 7 days, max 5 (FR-080)
}

export interface PersonalDashboard {
  assignedIssues: {
    status: IssueStatus
    issues: Issue[]
  }[]
  totalAssignedCount: number
  issuesDueSoon: Issue[] // Within 7 days (FR-081)
  issuesDueToday: Issue[]
  recentComments: Comment[] // Max 5 (FR-081)
  teamsAndProjects: {
    team: Team
    projects: Project[]
  }[]
}

export interface TeamStatistics {
  period: "7days" | "30days" | "90days" // FR-082
  issueCreationTrend: {
    date: string
    count: number
  }[]
  issueCompletionTrend: {
    date: string
    count: number
  }[]
  assignedIssuesPerMember: {
    member: User
    count: number
  }[]
  completedIssuesPerMember: {
    member: User
    count: number
  }[]
  issueStatusPerProject: {
    project: Project
    statusCounts: {
      status: string
      count: number
    }[]
  }[]
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// Filter and Sort Types
// ============================================
export interface IssueFilters {
  status?: IssueStatus[]
  priority?: Priority[]
  assigneeId?: string
  reporterId?: string
  projectId?: string
  labels?: string[]
  hasDueDate?: boolean
  dueDateFrom?: string
  dueDateTo?: string
  search?: string // Title text search (FR-036)
}

export interface SortOption {
  field: "createdAt" | "dueDate" | "priority" | "updatedAt" // FR-036
  direction: "asc" | "desc"
}

// ============================================
// Data Limits (Section 4 of PRD)
// ============================================
export const DATA_LIMITS = {
  PROJECTS_PER_TEAM: 15, // FR-020
  ISSUES_PER_PROJECT: 200, // FR-030
  SUBTASKS_PER_ISSUE: 20, // FR-039-2
  LABELS_PER_PROJECT: 20, // FR-038
  LABELS_PER_ISSUE: 5, // FR-038
  CUSTOM_STATUSES_PER_PROJECT: 5, // FR-053 (default 3 + custom 5 = total 8)
  WIP_LIMIT_MAX: 50, // FR-054
  AI_MIN_DESCRIPTION_LENGTH: 10, // FR-040, FR-041
  AI_COMMENT_SUMMARY_MIN: 5, // FR-045
  AI_RATE_LIMIT_PER_MINUTE: 10, // FR-042
  AI_RATE_LIMIT_PER_DAY: 100, // FR-042
  TOKEN_EXPIRATION_HOURS: 24, // FR-002
  PASSWORD_RESET_EXPIRATION_HOURS: 1, // FR-003
  TEAM_INVITE_EXPIRATION_DAYS: 7, // FR-013
} as const

