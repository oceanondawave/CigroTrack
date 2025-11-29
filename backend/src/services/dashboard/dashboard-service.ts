/**
 * Dashboard Service
 * Handles dashboard statistics and aggregations
 * FR-080 to FR-082
 */

import { supabaseAdmin } from '../../config/supabase'
import { projectService } from '../projects/project-service'
import { issueService } from '../issues/issue-service'
import { commentService } from '../comments/comment-service'
import { teamService } from '../teams/team-service'
import type { ProjectDashboard, PersonalDashboard, TeamStatistics } from '../../types'

export class DashboardService {
  /**
   * FR-080: Get Project Dashboard Statistics
   */
  async getProjectDashboard(projectId: string): Promise<ProjectDashboard> {
    // Issue count by status
    const { data: statusCounts } = await supabaseAdmin.rpc('get_issue_count_by_status', {
      project_id: projectId,
    })

    // If RPC doesn't exist, calculate manually
    const { data: allIssues } = await supabaseAdmin
      .from('issues')
      .select('status, priority')
      .eq('project_id', projectId)
      .is('deleted_at', null)

    const issueCountByStatus: { status: string; count: number }[] = []
    const issueCountByPriority: { priority: 'HIGH' | 'MEDIUM' | 'LOW'; count: number }[] = [
      { priority: 'HIGH', count: 0 },
      { priority: 'MEDIUM', count: 0 },
      { priority: 'LOW', count: 0 },
    ]

    const statusMap = new Map<string, number>()
    let totalIssues = 0
    let doneCount = 0

    ;(allIssues || []).forEach((issue: any) => {
      totalIssues++
      if (issue.status === 'Done') {
        doneCount++
      }

      // Count by status
      statusMap.set(issue.status, (statusMap.get(issue.status) || 0) + 1)

      // Count by priority
      const priorityIndex = issueCountByPriority.findIndex((p) => p.priority === issue.priority)
      if (priorityIndex >= 0) {
        issueCountByPriority[priorityIndex].count++
      }
    })

    statusMap.forEach((count, status) => {
      issueCountByStatus.push({ status, count })
    })

    const completionRate = totalIssues > 0 ? doneCount / totalIssues : 0

    // Recently created issues (max 5)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const { data: recentIssuesData } = await supabaseAdmin
      .from('issues')
      .select('id')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    const recentlyCreatedIssues = await Promise.all(
      (recentIssuesData || []).map(async (i: any) => {
        const issue = await issueService.getIssueById(i.id)
        return issue
      })
    )

    // Issues due soon (within 7 days, max 5)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const { data: dueSoonIssuesData } = await supabaseAdmin
      .from('issues')
      .select('id')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .not('due_date', 'is', null)
      .gte('due_date', new Date().toISOString())
      .lte('due_date', sevenDaysFromNow.toISOString())
      .order('due_date', { ascending: true })
      .limit(5)

    const issuesDueSoon = await Promise.all(
      (dueSoonIssuesData || []).map(async (i: any) => {
        const issue = await issueService.getIssueById(i.id)
        return issue
      })
    )

    return {
      issueCountByStatus,
      completionRate,
      issueCountByPriority,
      recentlyCreatedIssues: recentlyCreatedIssues.filter((i): i is any => i !== null),
      issuesDueSoon: issuesDueSoon.filter((i): i is any => i !== null),
    }
  }

  /**
   * FR-081: Get Personal Dashboard Statistics
   */
  async getPersonalDashboard(userId: string): Promise<PersonalDashboard> {
    // Get assigned issues grouped by status
    const { data: assignedIssuesData } = await supabaseAdmin
      .from('issues')
      .select('id, status')
      .eq('assignee_id', userId)
      .is('deleted_at', null)

    const statusMap = new Map<string, string[]>()
    ;(assignedIssuesData || []).forEach((issue: any) => {
      const issueIds = statusMap.get(issue.status) || []
      issueIds.push(issue.id)
      statusMap.set(issue.status, issueIds)
    })

    const assignedIssues = await Promise.all(
      Array.from(statusMap.entries()).map(async ([status, issueIds]) => {
        const issues = await Promise.all(issueIds.map((id) => issueService.getIssueById(id)))
        return {
          status,
          issues: issues.filter((i): i is any => i !== null),
        }
      })
    )

    const totalAssignedCount = assignedIssuesData?.length || 0

    // Issues due soon (within 7 days)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const { data: dueSoonData } = await supabaseAdmin
      .from('issues')
      .select('id')
      .eq('assignee_id', userId)
      .is('deleted_at', null)
      .not('due_date', 'is', null)
      .gte('due_date', new Date().toISOString())
      .lte('due_date', sevenDaysFromNow.toISOString())
      .order('due_date', { ascending: true })

    const issuesDueSoon = await Promise.all(
      (dueSoonData || []).map(async (i: any) => {
        const issue = await issueService.getIssueById(i.id)
        return issue
      })
    )

    // Issues due today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: dueTodayData } = await supabaseAdmin
      .from('issues')
      .select('id')
      .eq('assignee_id', userId)
      .is('deleted_at', null)
      .not('due_date', 'is', null)
      .gte('due_date', today.toISOString())
      .lt('due_date', tomorrow.toISOString())

    const issuesDueToday = await Promise.all(
      (dueTodayData || []).map(async (i: any) => {
        const issue = await issueService.getIssueById(i.id)
        return issue
      })
    )

    // Recent comments (max 5)
    const { data: recentCommentsData } = await supabaseAdmin
      .from('comments')
      .select('id')
      .eq('author_id', userId)
      .eq('deleted', false)
      .order('created_at', { ascending: false })
      .limit(5)

    const recentComments = await Promise.all(
      (recentCommentsData || []).map(async (c: any) => {
        const comment = await commentService.getCommentById(c.id)
        return comment
      })
    )

    // Teams and projects
    let teams: any[] = []
    try {
      teams = await teamService.getTeams(userId)
    } catch (error) {
      console.error('Error fetching teams in personal dashboard:', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      })
      // Continue with empty teams array rather than failing the whole dashboard
      teams = []
    }
    
    const teamsAndProjects = await Promise.all(
      teams.map(async (team) => {
        try {
          const projects = await projectService.getProjects(team.id, 'active')
          return {
            team,
            projects,
          }
        } catch (error) {
          console.error('Error fetching projects for team:', {
            teamId: team.id,
            error: error instanceof Error ? error.message : String(error),
          })
          return {
            team,
            projects: [], // Return empty projects array on error
          }
        }
      })
    )

    return {
      assignedIssues,
      totalAssignedCount,
      issuesDueSoon: issuesDueSoon.filter((i): i is any => i !== null),
      issuesDueToday: issuesDueToday.filter((i): i is any => i !== null),
      recentComments: recentComments.filter((c): c is any => c !== null),
      teamsAndProjects,
    }
  }

  /**
   * FR-082: Get Team Statistics
   */
  async getTeamStatistics(teamId: string, period: '7days' | '30days' | '90days'): Promise<TeamStatistics> {
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Issue creation trend
    const { data: createdIssues } = await supabaseAdmin
      .from('issues')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .in('project_id', []) // Will need to get project IDs for team

    // Get all projects for the team first
    const projects = await projectService.getProjects(teamId, 'active')
    const projectIds = projects.map((p) => p.id)

    const { data: allTeamIssues } = await supabaseAdmin
      .from('issues')
      .select('created_at, updated_at, status, assignee_id')
      .in('project_id', projectIds)
      .is('deleted_at', null)
      .gte('created_at', startDate.toISOString())

    // Group by date for trends
    const creationTrendMap = new Map<string, number>()
    const completionTrendMap = new Map<string, number>()

    ;(allTeamIssues || []).forEach((issue: any) => {
      const createdDate = new Date(issue.created_at).toISOString().split('T')[0]
      creationTrendMap.set(createdDate, (creationTrendMap.get(createdDate) || 0) + 1)

      if (issue.status === 'Done') {
        const completedDate = new Date(issue.updated_at).toISOString().split('T')[0]
        completionTrendMap.set(completedDate, (completionTrendMap.get(completedDate) || 0) + 1)
      }
    })

    const issueCreationTrend = Array.from(creationTrendMap.entries()).map(([date, count]) => ({ date, count }))
    const issueCompletionTrend = Array.from(completionTrendMap.entries()).map(([date, count]) => ({ date, count }))

    // Assigned issues per member
    const memberCounts = new Map<string, number>()
    ;(allTeamIssues || []).forEach((issue: any) => {
      if (issue.assignee_id) {
        memberCounts.set(issue.assignee_id, (memberCounts.get(issue.assignee_id) || 0) + 1)
      }
    })

    const { data: members } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)

    const assignedIssuesPerMember = await Promise.all(
      Array.from(memberCounts.entries()).map(async ([userId, count]) => {
        // Get user info (simplified - in real app, join with users table)
        return {
          member: { id: userId } as any,
          count,
        }
      })
    )

    // Completed issues per member (simplified)
    const completedCounts = new Map<string, number>()
    ;(allTeamIssues || [])
      .filter((issue: any) => issue.status === 'Done')
      .forEach((issue: any) => {
        if (issue.assignee_id) {
          completedCounts.set(issue.assignee_id, (completedCounts.get(issue.assignee_id) || 0) + 1)
        }
      })

    const completedIssuesPerMember = Array.from(completedCounts.entries()).map(([userId, count]) => ({
      member: { id: userId } as any,
      count,
    }))

    // Issue status per project
    const issueStatusPerProject = await Promise.all(
      projects.map(async (project) => {
        const { data: projectIssues } = await supabaseAdmin
          .from('issues')
          .select('status')
          .eq('project_id', project.id)
          .is('deleted_at', null)

        const statusCounts = new Map<string, number>()
        ;(projectIssues || []).forEach((issue: any) => {
          statusCounts.set(issue.status, (statusCounts.get(issue.status) || 0) + 1)
        })

        return {
          project,
          statusCounts: Array.from(statusCounts.entries()).map(([status, count]) => ({ status, count })),
        }
      })
    )

    return {
      period,
      issueCreationTrend,
      issueCompletionTrend,
      assignedIssuesPerMember,
      completedIssuesPerMember,
      issueStatusPerProject,
    }
  }
}

export const dashboardService = new DashboardService()

