/**
 * Projects feature exports
 * FR-020 to FR-027: Project features
 */

// Components
export { ProjectsList } from "./components/projects-list"
export { ProjectDetail } from "./components/project-detail"
export { ProjectCard } from "./components/project-card"
export { CreateProjectDialog } from "./components/create-project-dialog"

// Hooks
export { useProjects } from "./hooks/use-projects"
export { useProject } from "./hooks/use-project"

// Services
export { projectService } from "./services/project-service"

// Types
export type {
  ProjectFormData,
  ProjectFilters,
  ProjectBoardColumn,
} from "./types"
