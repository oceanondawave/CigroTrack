"use client"

import { useState } from "react"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockIssues } from "@/lib/mock-data"
import { ArrowLeft, Plus, AlertCircle, CheckCircle, GripVertical, Calendar } from "lucide-react"

const columns = [
  { id: "Backlog", title: "Backlog", wipLimit: null },
  { id: "In Progress", title: "In Progress", wipLimit: 3 },
  { id: "Done", title: "Done", wipLimit: null },
]

export default function BoardPage() {
  const [issues] = useState(mockIssues.filter((i) => i.projectId === "1"))

  const getIssuesByStatus = (status: string) => {
    return issues.filter((issue) => issue.status === status)
  }

  const getWipIndicator = (columnId: string, count: number, limit: number | null) => {
    if (!limit) return null
    const percentage = (count / limit) * 100
    const isOverLimit = count > limit
    const isNearLimit = count === limit

    return (
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isOverLimit ? "bg-destructive" : isNearLimit ? "bg-yellow-500" : "bg-primary"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span
          className={`text-xs font-medium ${
            isOverLimit ? "text-destructive" : isNearLimit ? "text-yellow-500" : "text-muted-foreground"
          }`}
        >
          {count}/{limit}
        </span>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/projects/1">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Project
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Mobile App Redesign Board</h1>
          </div>
          <Link href="/issues/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Issue
            </Button>
          </Link>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnIssues = getIssuesByStatus(column.id)
            const count = columnIssues.length

            return (
              <div key={column.id} className="flex-shrink-0 w-80 space-y-4">
                {/* Column Header */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">{column.title}</CardTitle>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                      {column.wipLimit && getWipIndicator(column.id, count, column.wipLimit)}
                    </div>
                  </CardHeader>
                </Card>

                {/* Issues */}
                <div className="space-y-3">
                  {columnIssues.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center">No issues</p>
                      </CardContent>
                    </Card>
                  ) : (
                    columnIssues.map((issue) => (
                      <Link key={issue.id} href={`/issues/${issue.id}`}>
                        <Card className="hover:border-primary transition-colors cursor-pointer group">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              {/* Priority & Drag Handle */}
                              <div className="flex items-start gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-move flex-shrink-0 mt-0.5" />
                                <div
                                  className={`h-1 w-1 rounded-full flex-shrink-0 mt-1.5 ${
                                    issue.priority === "high"
                                      ? "bg-red-500"
                                      : issue.priority === "medium"
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                />
                                <h3 className="font-medium text-sm flex-1 leading-tight">{issue.title}</h3>
                              </div>

                              {/* Labels */}
                              <div className="flex flex-wrap gap-1.5">
                                {issue.labels.map((label) => (
                                  <Badge key={label} variant="secondary" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {issue.dueDate}
                                </div>
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src="/placeholder.svg?key=8a7pw" />
                                  <AvatarFallback className="text-[10px]">{issue.assignee[0]}</AvatarFallback>
                                </Avatar>
                              </div>

                              {/* Subtask Progress */}
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-muted-foreground" />
                                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: "33%" }} />
                                </div>
                                <span className="text-xs text-muted-foreground">1/3</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}

                  {/* Add Issue Button */}
                  <Button variant="ghost" className="w-full border border-dashed">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Issue
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* WIP Limit Legend */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-muted-foreground">WIP limit exceeded</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">At WIP limit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Within WIP limit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
