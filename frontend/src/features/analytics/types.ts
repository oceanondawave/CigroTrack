/**
 * Analytics feature types
 */

export interface AnalyticsFilters {
  dateRange?: {
    start: string
    end: string
  }
  projectId?: string
  teamId?: string
}

export interface AnalyticsData {
  issueVelocity: {
    date: string
    completed: number
  }[]
  issueDistribution: {
    status: string
    count: number
  }[]
  priorityDistribution: {
    priority: string
    count: number
  }[]
  teamPerformance: {
    teamId: string
    teamName: string
    completedIssues: number
    averageResolutionTime: number
  }[]
}

