/**
 * Application constants based on PRD requirements
 */

// Data limits from PRD Section 4
export const DATA_LIMITS = {
  PROJECTS_PER_TEAM: 15,
  ISSUES_PER_PROJECT: 200,
  SUBTASKS_PER_ISSUE: 20,
  LABELS_PER_PROJECT: 20,
  LABELS_PER_ISSUE: 5,
  CUSTOM_STATUSES_PER_PROJECT: 5, // Default 3 + custom 5 = total 8
  WIP_LIMIT_MAX: 50,
  AI_MIN_DESCRIPTION_LENGTH: 10,
  AI_COMMENT_SUMMARY_MIN: 5,
  AI_RATE_LIMIT_PER_MINUTE: 10,
  AI_RATE_LIMIT_PER_DAY: 100,
} as const

// Field length limits
export const FIELD_LIMITS = {
  USER_NAME: { min: 1, max: 50 },
  EMAIL: { max: 255 },
  PASSWORD: { min: 6, max: 100 },
  TEAM_NAME: { min: 1, max: 50 },
  PROJECT_NAME: { min: 1, max: 100 },
  PROJECT_DESCRIPTION: { max: 2000 },
  ISSUE_TITLE: { min: 1, max: 200 },
  ISSUE_DESCRIPTION: { max: 5000 },
  SUBTASK_TITLE: { min: 1, max: 200 },
  LABEL_NAME: { min: 1, max: 30 },
  CUSTOM_STATUS_NAME: { min: 1, max: 30 },
  COMMENT_CONTENT: { min: 1, max: 1000 },
} as const

// Default issue statuses (FR-033)
export const DEFAULT_ISSUE_STATUSES = ["Backlog", "In Progress", "Done"] as const

// Priority levels (FR-037)
export const PRIORITY_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const
export const DEFAULT_PRIORITY: "MEDIUM" = "MEDIUM"

// Team roles (FR-017)
export const TEAM_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const

// Token expiration (FR-002)
export const TOKEN_EXPIRATION_HOURS = 24

// Password reset expiration (FR-003)
export const PASSWORD_RESET_EXPIRATION_HOURS = 1

// Team invite expiration (FR-013)
export const TEAM_INVITE_EXPIRATION_DAYS = 7

// Notification types (FR-090)
export const NOTIFICATION_TYPES = [
  "issue_assigned",
  "comment_added",
  "due_date_approaching",
  "due_date_today",
  "team_invite",
  "role_changed",
] as const

// Dashboard periods (FR-082)
export const DASHBOARD_PERIODS = ["7days", "30days", "90days"] as const

