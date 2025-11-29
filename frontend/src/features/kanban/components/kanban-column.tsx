/**
 * Kanban Column Component
 * Displays a status column with issues
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { KanbanCard } from "./kanban-card"
import type { Issue } from "@/types"

interface KanbanColumnProps {
  status: string
  statusColor?: string
  issues: Issue[]
  wipLimit?: number
  onDrop: (issueId: string, newOrder?: number) => void
  onSettingsClick?: () => void
}

export function KanbanColumn({
  status,
  statusColor,
  issues,
  wipLimit,
  onDrop,
  onSettingsClick,
}: KanbanColumnProps) {
  const issueCount = issues.length
  const isOverLimit = wipLimit !== undefined && issueCount > wipLimit
  const isAtLimit = wipLimit !== undefined && issueCount === wipLimit

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const issueId = e.dataTransfer.getData("text/plain")
    if (issueId) {
      // Calculate drop position
      const rect = e.currentTarget.getBoundingClientRect()
      const y = e.clientY - rect.top
      const cards = e.currentTarget.querySelectorAll('[data-issue-card]')
      let insertIndex = cards.length

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect()
        if (y < cardRect.top + cardRect.height / 2) {
          insertIndex = index
          return
        }
      })

      onDrop(issueId, insertIndex)
    }
  }

  return (
    <div className="flex flex-col h-full min-w-[280px]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {statusColor && (
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
              )}
              <CardTitle className="text-sm font-medium">{status}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {issueCount}
              </Badge>
            </div>
            {onSettingsClick && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onSettingsClick}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
          {wipLimit !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>WIP Limit</span>
                <span className={isOverLimit ? "text-destructive" : isAtLimit ? "text-yellow-500" : ""}>
                  {issueCount}/{wipLimit}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isOverLimit
                      ? "bg-destructive"
                      : isAtLimit
                        ? "bg-yellow-500"
                        : "bg-primary"
                  }`}
                  style={{
                    width: `${Math.min((issueCount / wipLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent
          className="flex-1 overflow-y-auto space-y-3 min-h-0"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {issues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>No issues</p>
            </div>
          ) : (
            issues.map((issue, index) => (
              <div key={issue.id} data-issue-card>
                <KanbanCard issue={issue} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

