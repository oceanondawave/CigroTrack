/**
 * Issue Service
 * Handles issue-related operations using Supabase
 * FR-030 to FR-039
 */

import { supabaseAdmin } from '../../config/supabase'
import type { Issue, Label, Subtask } from '../../types'

export interface CreateIssueData {
  title: string
  description?: string
  projectId: string
  reporterId: string
  assigneeId?: string
  status?: string
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  dueDate?: string
  labels?: string[]
}

export interface UpdateIssueData {
  title?: string
  description?: string
  status?: string
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  assigneeId?: string | null
  dueDate?: string | null
  order?: number
}

export interface IssueFilters {
  status?: string[]
  priority?: ('HIGH' | 'MEDIUM' | 'LOW')[]
  assigneeId?: string
  reporterId?: string
  labels?: string[]
  hasDueDate?: boolean
  dueDateFrom?: string
  dueDateTo?: string
  search?: string
}

const MAX_ISSUES_PER_PROJECT = 200 // FR-031
const MAX_SUBTASKS_PER_ISSUE = 20 // FR-039-2
const MAX_LABELS_PER_ISSUE = 5 // FR-038

export class IssueService {
  /**
   * FR-030: Create Issue
   * Max 200 issues per project (enforced here)
   */
  async createIssue(data: CreateIssueData): Promise<Issue> {
    // Check issue limit per project
    const { data: existingIssues, error: countError } = await supabaseAdmin
      .from('issues')
      .select('id', { count: 'exact' })
      .eq('project_id', data.projectId)
      .is('deleted_at', null)

    if (countError) {
      throw new Error('Failed to check issue limit')
    }

    const issueCount = existingIssues?.length || 0
    if (issueCount >= MAX_ISSUES_PER_PROJECT) {
      throw new Error(`Project has reached the maximum of ${MAX_ISSUES_PER_PROJECT} issues`)
    }

    // Validate title (1-200 chars)
    if (!data.title || data.title.trim().length === 0 || data.title.length > 200) {
      throw new Error('Issue title must be between 1 and 200 characters')
    }

    // Validate description (max 5000 chars)
    if (data.description && data.description.length > 5000) {
      throw new Error('Issue description must not exceed 5000 characters')
    }

    // Get max order for the status
    const { data: maxOrderData } = await supabaseAdmin
      .from('issues')
      .select('order')
      .eq('project_id', data.projectId)
      .eq('status', data.status || 'Backlog')
      .is('deleted_at', null)
      .order('order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = maxOrderData?.order ? maxOrderData.order + 1 : 0

    const { data: issueData, error } = await supabaseAdmin
      .from('issues')
      .insert({
        title: data.title.trim(),
        description: data.description || null,
        project_id: data.projectId,
        reporter_id: data.reporterId,
        assignee_id: data.assigneeId || null,
        status: data.status || 'Backlog',
        priority: data.priority || 'MEDIUM',
        due_date: data.dueDate || null,
        order: nextOrder,
      })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to create issue')
    }

    // Add labels if provided
    if (data.labels && data.labels.length > 0) {
      if (data.labels.length > MAX_LABELS_PER_ISSUE) {
        throw new Error(`Maximum ${MAX_LABELS_PER_ISSUE} labels allowed per issue`)
      }

      await this.addLabels(issueData.id, data.labels)
    }

    return this.mapDbIssueToIssue(issueData)
  }

  /**
   * FR-031: Get Issues
   * With filtering, sorting, and pagination
   */
  async getIssues(
    projectId: string,
    filters?: IssueFilters,
    sortBy: 'createdAt' | 'dueDate' | 'priority' | 'updatedAt' = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: Issue[]; total: number }> {
    let query = supabaseAdmin
      .from('issues')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .is('deleted_at', null)

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }
      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority)
      }
      if (filters.assigneeId) {
        query = query.eq('assignee_id', filters.assigneeId)
      }
      if (filters.reporterId) {
        query = query.eq('reporter_id', filters.reporterId)
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }
      if (filters.hasDueDate === true) {
        query = query.not('due_date', 'is', null)
      }
      if (filters.hasDueDate === false) {
        query = query.is('due_date', null)
      }
      if (filters.dueDateFrom) {
        query = query.gte('due_date', filters.dueDateFrom)
      }
      if (filters.dueDateTo) {
        query = query.lte('due_date', filters.dueDateTo)
      }
    }

    // Apply sorting
    const sortField = sortBy === 'createdAt' ? 'created_at' : sortBy === 'updatedAt' ? 'updated_at' : sortBy.toLowerCase()
    query = query.order(sortField, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: issuesData, error, count } = await query

    if (error) {
      throw new Error('Failed to fetch issues')
    }

    // Filter by labels if provided (done in memory after fetch)
    let filteredIssues = issuesData || []
    if (filters?.labels && filters.labels.length > 0) {
      const issuesWithLabels = await Promise.all(
        filteredIssues.map(async (issue: any) => {
          const labels = await this.getIssueLabels(issue.id)
          return { issue, labels }
        })
      )
      filteredIssues = issuesWithLabels
        .filter(({ labels }) => filters.labels!.some((labelId) => labels.some((l: Label) => l.id === labelId)))
        .map(({ issue }) => issue)
    }

    const issues = (filteredIssues || [])
      .map((i: any) => {
        if (!i || !i.id || !i.title) return null
        return this.mapDbIssueToIssue(i)
      })
      .filter((i): i is Issue => {
        return i !== null && !!i.title && i.title.trim() !== ''
      })
    
    // Load labels and subtasks for each issue
    const issuesWithRelations = await Promise.all(
      issues.map(async (issue) => {
        const labels = await this.getIssueLabels(issue.id)
        const subtasks = await this.getIssueSubtasks(issue.id)
        return { ...issue, labels, subtasks }
      })
    )
    return {
      data: issuesWithRelations,
      total: count || 0,
    }
  }

  /**
   * FR-032: Get Issue by ID
   */
  async getIssueById(issueId: string): Promise<Issue | null> {
    const { data: issueData, error } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error('Failed to fetch issue')
    }

    const issue = this.mapDbIssueToIssue(issueData)
    // Load labels and subtasks
    const labels = await this.getIssueLabels(issue.id)
    const subtasks = await this.getIssueSubtasks(issue.id)
    return { ...issue, labels, subtasks }
  }

  /**
   * FR-033: Update Issue
   */
  async updateIssue(issueId: string, data: UpdateIssueData): Promise<Issue> {
    const issue = await this.getIssueById(issueId)
    if (!issue) {
      throw new Error('Issue not found')
    }

    // Validate updates
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0 || data.title.length > 200) {
        throw new Error('Issue title must be between 1 and 200 characters')
      }
    }

    if (data.description !== undefined && data.description && data.description.length > 5000) {
      throw new Error('Issue description must not exceed 5000 characters')
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.title !== undefined) {
      updateData.title = data.title.trim()
    }
    if (data.description !== undefined) {
      updateData.description = data.description || null
    }
    if (data.status !== undefined) {
      updateData.status = data.status
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority
    }
    if (data.assigneeId !== undefined) {
      updateData.assignee_id = data.assigneeId || null
    }
    if (data.dueDate !== undefined) {
      updateData.due_date = data.dueDate || null
    }
    if (data.order !== undefined) {
      updateData.order = data.order
    }

    const { data: updatedIssue, error } = await supabaseAdmin
      .from('issues')
      .update(updateData)
      .eq('id', issueId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update issue')
    }

    return this.mapDbIssueToIssue(updatedIssue)
  }

  /**
   * FR-034: Assign Issue
   */
  async assignIssue(issueId: string, assigneeId: string | null): Promise<Issue> {
    return this.updateIssue(issueId, { assigneeId })
  }

  /**
   * FR-035: Delete Issue (soft delete)
   */
  async deleteIssue(issueId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('issues')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', issueId)

    if (error) {
      throw new Error('Failed to delete issue')
    }
  }

  /**
   * FR-036: Search Issues
   */
  async searchIssues(projectId: string, searchQuery: string): Promise<Issue[]> {
    const { data: issuesData, error } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .ilike('title', `%${searchQuery}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw new Error('Failed to search issues')
    }

    const issues = (issuesData || []).map((i: any) => this.mapDbIssueToIssue(i))
    // Load labels and subtasks for each issue
    return Promise.all(
      issues.map(async (issue) => {
        const labels = await this.getIssueLabels(issue.id)
        const subtasks = await this.getIssueSubtasks(issue.id)
        return { ...issue, labels, subtasks }
      })
    )
  }

  /**
   * FR-037: Update Priority
   */
  async updatePriority(issueId: string, priority: 'HIGH' | 'MEDIUM' | 'LOW'): Promise<Issue> {
    return this.updateIssue(issueId, { priority })
  }

  /**
   * FR-038: Add/Remove Labels
   */
  async addLabel(issueId: string, labelId: string): Promise<void> {
    // Check current label count
    const currentLabels = await this.getIssueLabels(issueId)
    if (currentLabels.length >= MAX_LABELS_PER_ISSUE) {
      throw new Error(`Maximum ${MAX_LABELS_PER_ISSUE} labels allowed per issue`)
    }

    // Check if label already exists
    const exists = currentLabels.some((l) => l.id === labelId)
    if (exists) {
      return // Already added
    }

    const { error } = await supabaseAdmin.from('issue_labels').insert({
      issue_id: issueId,
      label_id: labelId,
    })

    if (error) {
      throw new Error('Failed to add label')
    }
  }

  async removeLabel(issueId: string, labelId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('issue_labels')
      .delete()
      .eq('issue_id', issueId)
      .eq('label_id', labelId)

    if (error) {
      throw new Error('Failed to remove label')
    }
  }

  async addLabels(issueId: string, labelIds: string[]): Promise<void> {
    if (labelIds.length > MAX_LABELS_PER_ISSUE) {
      throw new Error(`Maximum ${MAX_LABELS_PER_ISSUE} labels allowed per issue`)
    }

    const currentLabels = await this.getIssueLabels(issueId)
    const existingLabelIds = currentLabels.map((l) => l.id)
    const newLabelIds = labelIds.filter((id) => !existingLabelIds.includes(id))

    if (newLabelIds.length === 0) {
      return
    }

    if (currentLabels.length + newLabelIds.length > MAX_LABELS_PER_ISSUE) {
      throw new Error(`Maximum ${MAX_LABELS_PER_ISSUE} labels allowed per issue`)
    }

    const { error } = await supabaseAdmin.from('issue_labels').insert(
      newLabelIds.map((labelId) => ({
        issue_id: issueId,
        label_id: labelId,
      }))
    )

    if (error) {
      throw new Error('Failed to add labels')
    }
  }

  async getIssueLabels(issueId: string): Promise<Label[]> {
    const { data: labelsData, error } = await supabaseAdmin
      .from('issue_labels')
      .select('label:labels(*)')
      .eq('issue_id', issueId)

    if (error) {
      throw new Error('Failed to fetch issue labels')
    }

    return (labelsData || []).map((il: any) => ({
      id: il.label.id,
      name: il.label.name,
      color: il.label.color,
      projectId: il.label.project_id,
      createdAt: il.label.created_at,
    }))
  }

  /**
   * FR-039-2: Create Subtask
   */
  async createSubtask(issueId: string, title: string, completed: boolean = false): Promise<Subtask> {
    // Check subtask limit
    const { data: existingSubtasks, error: countError } = await supabaseAdmin
      .from('subtasks')
      .select('id')
      .eq('issue_id', issueId)

    if (countError) {
      throw new Error('Failed to check subtask limit')
    }

    if (existingSubtasks && existingSubtasks.length >= MAX_SUBTASKS_PER_ISSUE) {
      throw new Error(`Maximum ${MAX_SUBTASKS_PER_ISSUE} subtasks allowed per issue`)
    }

    if (!title || title.trim().length === 0 || title.length > 200) {
      throw new Error('Subtask title must be between 1 and 200 characters')
    }

    const { data: subtaskData, error } = await supabaseAdmin
      .from('subtasks')
      .insert({
        issue_id: issueId,
        title: title.trim(),
        completed,
      })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to create subtask')
    }

    return this.mapDbSubtaskToSubtask(subtaskData)
  }

  async updateSubtask(subtaskId: string, data: { title?: string; completed?: boolean }): Promise<Subtask> {
    const updateData: any = {}

    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0 || data.title.length > 200) {
        throw new Error('Subtask title must be between 1 and 200 characters')
      }
      updateData.title = data.title.trim()
    }

    if (data.completed !== undefined) {
      updateData.completed = data.completed
    }

    const { data: subtaskData, error } = await supabaseAdmin
      .from('subtasks')
      .update(updateData)
      .eq('id', subtaskId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update subtask')
    }

    return this.mapDbSubtaskToSubtask(subtaskData)
  }

  async deleteSubtask(subtaskId: string): Promise<void> {
    const { error } = await supabaseAdmin.from('subtasks').delete().eq('id', subtaskId)

    if (error) {
      throw new Error('Failed to delete subtask')
    }
  }

  async getIssueSubtasks(issueId: string): Promise<Subtask[]> {
    const { data: subtasksData, error } = await supabaseAdmin
      .from('subtasks')
      .select('*')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error('Failed to fetch subtasks')
    }

    return (subtasksData || []).map((s: any) => this.mapDbSubtaskToSubtask(s))
  }

  /**
   * Update issue status
   */
  async updateIssueStatus(issueId: string, status: string): Promise<Issue> {
    return this.updateIssue(issueId, { status })
  }

  /**
   * Map database issue to Issue type
   */
  private mapDbIssueToIssue(dbIssue: any): Issue {
    return {
      id: dbIssue.id,
      title: dbIssue.title,
      description: dbIssue.description || undefined,
      projectId: dbIssue.project_id,
      reporterId: dbIssue.reporter_id,
      assigneeId: dbIssue.assignee_id || undefined,
      status: dbIssue.status,
      priority: dbIssue.priority,
      dueDate: dbIssue.due_date || undefined,
      order: dbIssue.order,
      createdAt: dbIssue.created_at,
      updatedAt: dbIssue.updated_at,
      deletedAt: dbIssue.deleted_at || undefined,
    }
  }

  private mapDbSubtaskToSubtask(dbSubtask: any): Subtask {
    return {
      id: dbSubtask.id,
      issueId: dbSubtask.issue_id,
      title: dbSubtask.title,
      completed: dbSubtask.completed,
      createdAt: dbSubtask.created_at,
      updatedAt: dbSubtask.updated_at,
    }
  }
}

export const issueService = new IssueService()

