/**
 * Dashboard feature types
 */

export interface DashboardStats {
  totalIssues: number
  openIssues: number
  inProgressIssues: number
  completedIssues: number
  overdueIssues: number
  totalProjects: number
  activeProjects: number
  teamMembers: number
}

export interface RecentActivity {
  id: string
  type: "issue_created" | "issue_updated" | "comment_added" | "project_created"
  user: {
    id: string
    name: string
    avatar?: string
  }
  description: string
  timestamp: string
  link?: string
}

