/**
 * Kanban Service
 * Handles kanban board operations (custom statuses, WIP limits, drag & drop)
 * FR-052 to FR-054
 */

import { supabaseAdmin } from '../../config/supabase'

export interface CustomStatus {
  id: string
  projectId: string
  name: string
  color?: string
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export interface WipLimit {
  id: string
  projectId: string
  status: string
  limit: number | null // 1-50 or null for unlimited
  createdAt: string
  updatedAt: string
}

export interface UpdateIssueOrderData {
  issueId: string
  status: string
  order: number
}

const MAX_WIP_LIMIT = 50 // FR-054

export class KanbanService {
  /**
   * FR-053: Create Custom Status
   */
  async createCustomStatus(projectId: string, name: string, color?: string): Promise<CustomStatus> {
    if (!name || name.trim().length === 0 || name.length > 30) {
      throw new Error('Status name must be between 1 and 30 characters')
    }

    // Get max order index
    const { data: existingStatuses } = await supabaseAdmin
      .from('custom_statuses')
      .select('order_index')
      .eq('project_id', projectId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = existingStatuses?.order_index !== undefined ? existingStatuses.order_index + 1 : 0

    const { data: statusData, error } = await supabaseAdmin
      .from('custom_statuses')
      .insert({
        project_id: projectId,
        name: name.trim(),
        color: color || null,
        order_index: nextOrder,
      })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to create custom status')
    }

    return this.mapDbStatusToStatus(statusData)
  }

  /**
   * Get custom statuses for a project
   */
  async getCustomStatuses(projectId: string): Promise<CustomStatus[]> {
    const { data: statusesData, error } = await supabaseAdmin
      .from('custom_statuses')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true })

    if (error) {
      throw new Error('Failed to fetch custom statuses')
    }

    return (statusesData || []).map((s: any) => this.mapDbStatusToStatus(s))
  }

  /**
   * Update custom status
   */
  async updateCustomStatus(statusId: string, data: { name?: string; color?: string; orderIndex?: number }): Promise<CustomStatus> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0 || data.name.length > 30) {
        throw new Error('Status name must be between 1 and 30 characters')
      }
      updateData.name = data.name.trim()
    }

    if (data.color !== undefined) {
      updateData.color = data.color || null
    }

    if (data.orderIndex !== undefined) {
      updateData.order_index = data.orderIndex
    }

    const { data: statusData, error } = await supabaseAdmin
      .from('custom_statuses')
      .update(updateData)
      .eq('id', statusId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update custom status')
    }

    return this.mapDbStatusToStatus(statusData)
  }

  /**
   * Delete custom status
   */
  async deleteCustomStatus(statusId: string): Promise<void> {
    const { error } = await supabaseAdmin.from('custom_statuses').delete().eq('id', statusId)

    if (error) {
      throw new Error('Failed to delete custom status')
    }
  }

  /**
   * FR-054: Update WIP Limit
   */
  async updateWipLimit(projectId: string, status: string, limit: number | null): Promise<WipLimit> {
    if (limit !== null && (limit < 1 || limit > MAX_WIP_LIMIT)) {
      throw new Error(`WIP limit must be between 1 and ${MAX_WIP_LIMIT} or null for unlimited`)
    }

    // Check if limit already exists
    const { data: existing } = await supabaseAdmin
      .from('wip_limits')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', status)
      .single()

    if (existing) {
      // Update existing
      const { data: limitData, error } = await supabaseAdmin
        .from('wip_limits')
        .update({
          limit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        throw new Error('Failed to update WIP limit')
      }

      return this.mapDbWipLimitToWipLimit(limitData)
    } else {
      // Create new
      const { data: limitData, error } = await supabaseAdmin
        .from('wip_limits')
        .insert({
          project_id: projectId,
          status,
          limit,
        })
        .select()
        .single()

      if (error) {
        throw new Error('Failed to create WIP limit')
      }

      return this.mapDbWipLimitToWipLimit(limitData)
    }
  }

  /**
   * Get WIP limits for a project
   */
  async getWipLimits(projectId: string): Promise<WipLimit[]> {
    const { data: limitsData, error } = await supabaseAdmin
      .from('wip_limits')
      .select('*')
      .eq('project_id', projectId)

    if (error) {
      throw new Error('Failed to fetch WIP limits')
    }

    return (limitsData || []).map((l: any) => this.mapDbWipLimitToWipLimit(l))
  }

  /**
   * Check if WIP limit is exceeded for a status
   */
  async checkWipLimit(projectId: string, status: string): Promise<{ exceeded: boolean; current: number; limit: number | null }> {
    const limits = await this.getWipLimits(projectId)
    const limitForStatus = limits.find((l) => l.status === status)

    if (!limitForStatus || limitForStatus.limit === null) {
      return { exceeded: false, current: 0, limit: null }
    }

    // Count issues in this status
    const { data: issues, error } = await supabaseAdmin
      .from('issues')
      .select('id', { count: 'exact' })
      .eq('project_id', projectId)
      .eq('status', status)
      .is('deleted_at', null)

    if (error) {
      throw new Error('Failed to check WIP limit')
    }

    const current = issues?.length || 0
    const exceeded = current >= limitForStatus.limit

    return {
      exceeded,
      current,
      limit: limitForStatus.limit,
    }
  }

  /**
   * Update issue order in kanban board
   */
  async updateIssueOrder(projectId: string, updates: UpdateIssueOrderData[]): Promise<void> {
    // Update all issues in a transaction-like manner
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('issues')
        .update({
          status: update.status,
          order: update.order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', update.issueId)
        .eq('project_id', projectId)

      if (error) {
        throw new Error(`Failed to update issue order for issue ${update.issueId}`)
      }
    }
  }

  /**
   * Map database status to CustomStatus type
   */
  private mapDbStatusToStatus(dbStatus: any): CustomStatus {
    return {
      id: dbStatus.id,
      projectId: dbStatus.project_id,
      name: dbStatus.name,
      color: dbStatus.color || undefined,
      orderIndex: dbStatus.order_index,
      createdAt: dbStatus.created_at,
      updatedAt: dbStatus.updated_at,
    }
  }

  /**
   * Map database WIP limit to WipLimit type
   */
  private mapDbWipLimitToWipLimit(dbLimit: any): WipLimit {
    return {
      id: dbLimit.id,
      projectId: dbLimit.project_id,
      status: dbLimit.status,
      limit: dbLimit.limit,
      createdAt: dbLimit.created_at,
      updatedAt: dbLimit.updated_at,
    }
  }
}

export const kanbanService = new KanbanService()

