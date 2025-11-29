/**
 * Issue Card Component
 * Displays issue information in a card format
 */

"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Issue, Priority } from "@/types"
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

interface IssueCardProps {
  issue: Issue
}

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-500/20 text-red-500 border-red-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  LOW: "bg-green-500/20 text-green-500 border-green-500/30",
}

const priorityIcons: Record<Priority, typeof AlertCircle> = {
  HIGH: AlertCircle,
  MEDIUM: Clock,
  LOW: CheckCircle2,
}

export function IssueCard({ issue }: IssueCardProps) {
  const PriorityIcon = priorityIcons[issue.priority]
  const isOverdue =
    issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== "Done"

  const completedSubtasks =
    issue.subtasks?.filter((subtask) => subtask.completed).length || 0
  const totalSubtasks = issue.subtasks?.length || 0

  return (
    <Link href={`/issues/${issue.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-2">{issue.title}</CardTitle>
            <Badge
              variant="outline"
              className={`${priorityColors[issue.priority]} flex items-center gap-1 shrink-0`}
            >
              <PriorityIcon className="h-3 w-3" />
              <span className="text-xs">{issue.priority}</span>
            </Badge>
          </div>
          {issue.description && (
            <CardDescription className="line-clamp-2 text-xs">
              {issue.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {issue.labels.slice(0, 3).map((label) => (
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
              {issue.labels.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{issue.labels.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Subtask Progress */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              <span>
                {completedSubtasks}/{totalSubtasks} subtasks
              </span>
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
                  <span className="text-xs text-muted-foreground">
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

