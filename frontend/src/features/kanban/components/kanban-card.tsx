/**
 * Kanban Card Component
 * Displays an issue as a draggable card
 */

"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GripVertical, Clock } from "lucide-react"
import type { Issue, Priority } from "@/types"
import { format } from "date-fns"

interface KanbanCardProps {
  issue: Issue
  isDragging?: boolean
}

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
}

export function KanbanCard({ issue, isDragging }: KanbanCardProps) {
  const isOverdue =
    issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== "Done"

  return (
    <Link href={`/issues/${issue.id}`}>
      <Card
        className={`hover:shadow-lg transition-all cursor-pointer group ${
          isDragging ? "opacity-50" : ""
        }`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", issue.id)
          e.dataTransfer.effectAllowed = "move"
        }}
      >
        <CardContent className="pt-4 space-y-3">
          {/* Priority & Drag Handle */}
          <div className="flex items-start gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex-shrink-0 mt-0.5" />
            <div
              className={`h-2 w-2 rounded-full flex-shrink-0 mt-1 ${priorityColors[issue.priority]}`}
            />
            <h3 className="font-medium text-sm flex-1 leading-tight line-clamp-2">
              {issue.title}
            </h3>
          </div>

          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {issue.labels.slice(0, 2).map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: `${label.color}20`,
                    borderColor: label.color,
                    color: label.color,
                  }}
                >
                  {label.name}
                </Badge>
              ))}
              {issue.labels.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{issue.labels.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-2">
              {issue.assignee ? (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={issue.assignee.avatar} />
                    <AvatarFallback className="text-xs">
                      {issue.assignee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                    {issue.assignee.name}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Unassigned</span>
              )}
            </div>
            {issue.dueDate && (
              <div
                className={`text-xs flex items-center gap-1 ${
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                <Clock className="h-3 w-3" />
                {format(new Date(issue.dueDate), "MMM d")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

