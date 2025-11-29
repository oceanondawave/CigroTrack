/**
 * Kanban Board Component
 * FR-050: Main kanban board with drag & drop
 */

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useKanban } from "../hooks/use-kanban"
import { KanbanColumn } from "./kanban-column"
import { CreateIssueDialog } from "@/features/issues/components/create-issue-dialog"
import { useTeam } from "@/features/teams/hooks/use-team"
import { useProject } from "@/features/projects/hooks/use-project"

interface KanbanBoardProps {
  projectId: string
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { project } = useProject(projectId)
  const { members } = project?.teamId ? useTeam(project.teamId) : { members: [] }
  const {
    columns,
    statuses,
    wipLimits,
    loading,
    error,
    moveIssue,
    refreshBoard,
  } = useKanban(projectId)

  const handleDrop = async (issueId: string, toStatus: string, newOrder?: number) => {
    // Find current status
    const currentStatus = Object.keys(columns).find((status) =>
      columns[status].some((issue) => issue.id === issueId)
    )

    if (!currentStatus || currentStatus === toStatus) {
      return
    }

    try {
      await moveIssue(issueId, currentStatus, toStatus, newOrder)
    } catch (err) {
      console.error("Failed to move issue:", err)
      await refreshBoard() // Revert on error
    }
  }

  const handleIssueCreated = async () => {
    await refreshBoard()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Sort statuses by position if available
  const sortedStatuses = [...statuses].sort((a, b) => (a.position || 0) - (b.position || 0))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Kanban Board</h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop issues to change their status
          </p>
        </div>
        <CreateIssueDialog
          projectId={projectId}
          teamMembers={members}
          onSuccess={handleIssueCreated}
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "600px" }}>
        {sortedStatuses.length === 0 ? (
          <Card className="flex-1">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No statuses configured</p>
            </CardContent>
          </Card>
        ) : (
          sortedStatuses.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status.name}
              statusColor={status.color}
              issues={columns[status.name] || []}
              wipLimit={wipLimits[status.name]}
              onDrop={(issueId, newOrder) => handleDrop(issueId, status.name, newOrder)}
            />
          ))
        )}
      </div>
    </div>
  )
}

