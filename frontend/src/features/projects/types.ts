/**
 * Projects feature types
 */

import type { Project, ProjectStatus } from "@/types"

export interface ProjectFilters {
  status?: ProjectStatus[]
  teamId?: string
  favorite?: boolean
  search?: string
}

export interface ProjectBoardColumn {
  id: string
  name: string
  status: string
  issues: Array<{
    id: string
    title: string
    priority: string
    assignee?: {
      id: string
      name: string
      avatar?: string
    }
  }>
}

export interface ProjectFormData {
  name: string
  description?: string
  teamId: string
  status?: ProjectStatus
}

