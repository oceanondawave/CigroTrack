/**
 * Teams feature types
 */

import type { Team, TeamRole } from "@/types"

export interface TeamFormData {
  name: string
  description?: string
}

export interface InviteMemberData {
  email: string
  role: TeamRole
  teamId: string
}

export interface TeamFilters {
  search?: string
}

export interface TeamActivity {
  id: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  action: string
  target: string
  timestamp: string
}

