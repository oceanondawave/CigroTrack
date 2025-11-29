/**
 * Issues feature types
 */

import type { IssueFilters as BaseIssueFilters, IssueStatus, Priority } from "@/types"

export interface IssueFilters extends BaseIssueFilters {
  projectId?: string
  assigneeId?: string
  reporterId?: string
  status?: IssueStatus[]
  priority?: Priority[]
}

export interface IssueFormData {
  title: string
  description?: string
  projectId: string
  status?: IssueStatus
  priority?: Priority
  assigneeId?: string
  labels?: string[]
  dueDate?: string
}

export interface CommentFormData {
  content: string
  issueId: string
}

