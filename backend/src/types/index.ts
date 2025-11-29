/**
 * Backend Type Definitions
 * Shared types for backend services
 */

// Re-export types from a shared location or define them here
// For now, we'll define them to match the frontend types

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  authProvider: "email" | "google"
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface Team {
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
  user: User
  role: "OWNER" | "ADMIN" | "MEMBER"
  joinedAt: string
}

export interface TeamInvite {
  id: string
  teamId: string
  email: string
  role: "OWNER" | "ADMIN" | "MEMBER"
  invitedBy: string
  expiresAt: string
  status: "pending" | "accepted" | "expired"
  createdAt: string
}

export interface TeamActivity {
  id: string
  teamId: string
  userId: string
  user: User
  action: string
  targetType: "member" | "project" | "team" | "issue"
  targetId: string
  targetName: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  teamId: string
  team?: Team
  ownerId: string
  status: "active" | "archived"
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface Issue {
  id: string
  title: string
  description?: string
  projectId: string
  reporterId: string
  assigneeId?: string
  status: string
  priority: "HIGH" | "MEDIUM" | "LOW"
  dueDate?: string
  order?: number
  labels?: Label[]
  subtasks?: Subtask[]
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface Label {
  id: string
  name: string
  color: string
  projectId: string
  createdAt: string
}

export interface Subtask {
  id: string
  issueId: string
  title: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  issueId: string
  authorId: string
  content: string
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message?: string
  type: 'issue_assigned' | 'comment_added' | 'due_date_approaching' | 'due_date_today' | 'team_invite' | 'role_changed'
  read: boolean
  link?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface ProjectDashboard {
  issueCountByStatus: { status: string; count: number }[]
  completionRate: number
  issueCountByPriority: { priority: 'HIGH' | 'MEDIUM' | 'LOW'; count: number }[]
  recentlyCreatedIssues: Issue[]
  issuesDueSoon: Issue[]
}

export interface PersonalDashboard {
  assignedIssues: { status: string; issues: Issue[] }[]
  totalAssignedCount: number
  issuesDueSoon: Issue[]
  issuesDueToday: Issue[]
  recentComments: Comment[]
  teamsAndProjects: { team: Team; projects: Project[] }[]
}

export interface TeamStatistics {
  period: '7days' | '30days' | '90days'
  issueCreationTrend: { date: string; count: number }[]
  issueCompletionTrend: { date: string; count: number }[]
  assignedIssuesPerMember: { member: any; count: number }[]
  completedIssuesPerMember: { member: any; count: number }[]
  issueStatusPerProject: { project: Project; statusCounts: { status: string; count: number }[] }[]
}

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

