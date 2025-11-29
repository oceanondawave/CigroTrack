/**
 * Teams feature exports
 * FR-010 to FR-019: Team features
 */

// Components
export { TeamsList } from "./components/teams-list"
export { TeamDetail } from "./components/team-detail"
export { CreateTeamDialog } from "./components/create-team-dialog"
export { InviteMemberDialog } from "./components/invite-member-dialog"
export { TeamMembers } from "./components/team-members"
export { TeamActivityLog } from "./components/team-activity-log"

// Hooks
export { useTeams } from "./hooks/use-teams"
export { useTeam } from "./hooks/use-team"

// Services
export { teamService } from "./services/team-service"

// Types
export type {
  TeamFormData,
  InviteMemberData,
  TeamFilters,
} from "./types"
