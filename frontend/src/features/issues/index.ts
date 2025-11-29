/**
 * Issues feature exports
 * FR-030 to FR-039: Issue features
 */

// Components
export { IssuesList } from "./components/issues-list"
export { IssueDetail } from "./components/issue-detail"
export { IssueCard } from "./components/issue-card"
export { CreateIssueDialog } from "./components/create-issue-dialog"
export { IssueFilters } from "./components/issue-filters"
export { SubtasksList } from "./components/subtasks-list"

// Hooks
export { useIssues } from "./hooks/use-issues"
export { useIssue } from "./hooks/use-issue"

// Services
export { issueService } from "./services/issue-service"

// Types
export type {
  IssueFormData,
  IssueFilters as IssueFiltersType,
  CommentFormData,
} from "./types"
