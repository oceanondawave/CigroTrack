/**
 * Project Service
 * Handles project-related operations using Supabase
 * FR-020 to FR-027
 */

import { supabaseAdmin } from '../../config/supabase'
import type { Project } from '../../types'
import type { Issue } from '../../types'

export interface CreateProjectData {
  name: string
  description?: string
  teamId: string
  ownerId: string
}

export interface UpdateProjectData {
  name?: string
  description?: string
  status?: 'active' | 'archived'
}

const MAX_PROJECTS_PER_TEAM = 15 // FR-020

export class ProjectService {
  /**
   * FR-020: Create Project
   * Max 15 projects per team (enforced here)
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    // Check project limit per team
    const { data: existingProjects, error: countError } = await supabaseAdmin
      .from('projects')
      .select('id', { count: 'exact' })
      .eq('team_id', data.teamId)
      .is('deleted_at', null)

    if (countError) {
      throw new Error('Failed to check project limit')
    }

    const projectCount = existingProjects?.length || 0
    if (projectCount >= MAX_PROJECTS_PER_TEAM) {
      throw new Error(`Team has reached the maximum of ${MAX_PROJECTS_PER_TEAM} projects`)
    }

    // Validate name length (1-100 chars)
    if (!data.name || data.name.trim().length === 0 || data.name.length > 100) {
      throw new Error('Project name must be between 1 and 100 characters')
    }

    // Validate description length (max 2000 chars)
    if (data.description && data.description.length > 2000) {
      throw new Error('Project description must not exceed 2000 characters')
    }

    const { data: projectData, error } = await supabaseAdmin
      .from('projects')
      .insert({
        name: data.name.trim(),
        description: data.description || null,
        team_id: data.teamId,
        owner_id: data.ownerId,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to create project')
    }

    return this.mapDbProjectToProject(projectData)
  }

  /**
   * FR-021: Get Projects
   * Returns projects for a team, filtered by status
   */
  async getProjects(teamId: string, status?: 'active' | 'archived'): Promise<Project[]> {
    let query = supabaseAdmin
      .from('projects')
      .select(`
        *,
        team:teams(id, name, owner_id, created_at, updated_at)
      `)
      .eq('team_id', teamId)
      .is('deleted_at', null)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: projectsData, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch projects')
    }

    return (projectsData || [])
      .map((p: any) => {
        if (!p || !p.id || !p.name) return null
        return this.mapDbProjectToProject(p)
      })
      .filter((p): p is Project => {
        return p !== null && !!p.name && p.name.trim() !== ''
      })
  }

  /**
   * FR-022: Get Project by ID
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    const { data: projectData, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error('Failed to fetch project')
    }

    return this.mapDbProjectToProject(projectData)
  }

  /**
   * FR-023: Update Project
   */
  async updateProject(projectId: string, data: UpdateProjectData, userId: string): Promise<Project> {
    // Verify user has permission (owner or team admin/owner)
    const project = await this.getProjectById(projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    // Check permissions (simplified - in real app, check team role)
    // This will be enforced by RLS, but we check here for better error messages
    if (project.ownerId !== userId) {
      throw new Error('Only project owner can update project')
    }

    // Validate updates
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0 || data.name.length > 100) {
        throw new Error('Project name must be between 1 and 100 characters')
      }
    }

    if (data.description !== undefined && data.description && data.description.length > 2000) {
      throw new Error('Project description must not exceed 2000 characters')
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.name !== undefined) {
      updateData.name = data.name.trim()
    }
    if (data.description !== undefined) {
      updateData.description = data.description || null
    }
    if (data.status !== undefined) {
      updateData.status = data.status
    }

    const { data: updatedProject, error } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update project')
    }

    return this.mapDbProjectToProject(updatedProject)
  }

  /**
   * FR-024: Archive Project (soft delete)
   */
  async archiveProject(projectId: string, userId: string): Promise<Project> {
    return this.updateProject(projectId, { status: 'archived' }, userId)
  }

  /**
   * FR-027: Toggle Favorite
   */
  async toggleFavorite(projectId: string, userId: string): Promise<boolean> {
    // Check if already favorited
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('project_favorites')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error('Failed to check favorite status')
    }

    if (existing) {
      // Remove favorite
      const { error } = await supabaseAdmin
        .from('project_favorites')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) {
        throw new Error('Failed to remove favorite')
      }
      return false
    } else {
      // Add favorite
      const { error } = await supabaseAdmin
        .from('project_favorites')
        .insert({
          project_id: projectId,
          user_id: userId,
        })

      if (error) {
        throw new Error('Failed to add favorite')
      }
      return true
    }
  }

  /**
   * Get all projects for teams the user belongs to
   */
  async getProjectsForUser(userId: string, status?: 'active' | 'archived'): Promise<Project[]> {
    // Get all teams the user belongs to via team_members
    const { data: memberTeams, error: memberError } = await supabaseAdmin
      .from('team_members')
      .select('team:teams!inner(id)')
      .eq('user_id', userId)

    if (memberError || !memberTeams || memberTeams.length === 0) {
      return []
    }

    const teamIds = memberTeams
      .map((mt: any) => mt.team?.id)
      .filter((id: string | undefined): id is string => !!id)

    if (teamIds.length === 0) {
      return []
    }

    // Get all projects for these teams
    let query = supabaseAdmin
      .from('projects')
      .select(`
        *,
        team:teams(id, name, owner_id, created_at, updated_at)
      `)
      .in('team_id', teamIds)
      .is('deleted_at', null)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: projectsData, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch projects')
    }

    return (projectsData || [])
      .map((p: any) => {
        if (!p || !p.id || !p.name) return null
        return this.mapDbProjectToProject(p)
      })
      .filter((p): p is Project => {
        return p !== null && !!p.name && p.name.trim() !== ''
      })
  }

  /**
   * Get user's favorite projects
   */
  async getFavoriteProjects(userId: string): Promise<Project[]> {
    const { data: favorites, error } = await supabaseAdmin
      .from('project_favorites')
      .select('project:projects(*), created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch favorite projects')
    }

    return (favorites || [])
      .map((f: any) => {
        if (f.project && !f.project.deleted_at) {
          return this.mapDbProjectToProject(f.project)
        }
        return null
      })
      .filter((p: Project | null): p is Project => p !== null)
  }

  /**
   * Delete project (soft delete)
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    const project = await this.getProjectById(projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    if (project.ownerId !== userId) {
      throw new Error('Only project owner can delete project')
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', projectId)

    if (error) {
      throw new Error('Failed to delete project')
    }
  }

  /**
   * FR-050: Get Kanban Board Data
   * Get issues organized by status for a project
   */
  async getBoardData(projectId: string): Promise<Record<string, any[]>> {
    if (!projectId) {
      throw new Error('Project ID is required')
    }

    const { data: issuesData, error } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      const errorMsg = String(error.message || 'Unknown error')
      const errorCode = String(error.code || 'UNKNOWN')
      console.error(`Failed to fetch board data for project ${projectId}: ${errorMsg} (code: ${errorCode})`)
      throw new Error(`Failed to fetch board data: ${errorMsg}`)
    }

    if (!issuesData || issuesData.length === 0) {
      return {}
    }

    // Map issues and organize by status
    const boardData: Record<string, any[]> = {}
    
    for (const issueDb of issuesData) {
      if (!issueDb || !issueDb.id || !issueDb.title) continue
      
      const issue: any = {
        id: issueDb.id,
        title: issueDb.title,
        description: issueDb.description || undefined,
        projectId: issueDb.project_id,
        reporterId: issueDb.reporter_id,
        assigneeId: issueDb.assignee_id || undefined,
        status: issueDb.status,
        priority: issueDb.priority,
        dueDate: issueDb.due_date || undefined,
        order: issueDb.order,
        createdAt: issueDb.created_at,
        updatedAt: issueDb.updated_at,
        deletedAt: issueDb.deleted_at || undefined,
        labels: [],
        subtasks: [],
      }
      
      const status = issue.status || 'Backlog'
      
      if (!boardData[status]) {
        boardData[status] = []
      }
      boardData[status].push(issue)
    }

    return boardData
  }

  /**
   * Map database project to Project type
   */
  private mapDbProjectToProject(dbProject: any): Project {
    return {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description || undefined,
      teamId: dbProject.team_id,
      ownerId: dbProject.owner_id,
      status: dbProject.status,
      createdAt: dbProject.created_at,
      updatedAt: dbProject.updated_at,
      deletedAt: dbProject.deleted_at || undefined,
      team: dbProject.team ? {
        id: dbProject.team.id,
        name: dbProject.team.name,
        ownerId: dbProject.team.owner_id,
        createdAt: dbProject.team.created_at,
        updatedAt: dbProject.team.updated_at,
      } : undefined,
    }
  }
}

export const projectService = new ProjectService()

