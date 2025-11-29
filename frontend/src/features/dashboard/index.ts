/**
 * Dashboard feature exports
 * FR-080 to FR-082: Dashboard and statistics features
 */

// Components
export { PersonalDashboard } from "./components/personal-dashboard"

// Hooks
export { useProjectStats } from "./hooks/use-project-stats"
export { usePersonalStats } from "./hooks/use-personal-stats"

// Services
export { dashboardService } from "./services/dashboard-service"
export type { ProjectStats, PersonalStats, TeamStats } from "./services/dashboard-service"
