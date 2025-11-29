/**
 * Issue Detail Component
 * FR-031: Issue detail view with all information
 */

"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, Clock, CheckCircle2, Trash2, Edit2 } from "lucide-react"
import { useIssue } from "../hooks/use-issue"
import { SubtasksList } from "./subtasks-list"
import { CommentList } from "@/features/comments/components/comment-list"
import { AiSummaryButton } from "@/features/ai/components/ai-summary-button"
import { AiSuggestionButton } from "@/features/ai/components/ai-suggestion-button"
import { AiDuplicateDetection } from "@/features/ai/components/ai-duplicate-detection"
import { format } from "date-fns"
import type { Priority } from "@/types"
import { PRIORITY_LEVELS } from "@/lib/constants"

interface IssueDetailProps {
  issueId: string
}

const priorityColors: Record<Priority, string> = {
  HIGH: "bg-red-500/20 text-red-500 border-red-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  LOW: "bg-green-500/20 text-green-500 border-green-500/30",
}

export function IssueDetail({ issueId }: IssueDetailProps) {
  const router = useRouter()
  const {
    issue,
    loading,
    error,
    updateIssue,
    deleteIssue,
    refreshIssue,
  } = useIssue(issueId)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this issue?")) {
      return
    }
    try {
      await deleteIssue()
      router.push(`/projects/${issue?.projectId}`)
    } catch (err) {
      console.error("Failed to delete issue:", err)
    }
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
      <div className="p-4 text-center">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Issue not found</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    )
  }

  const isOverdue =
    issue.dueDate && new Date(issue.dueDate) < new Date() && issue.status !== "Done"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{issue.title}</h1>
            <Badge
              variant="outline"
              className={`${priorityColors[issue.priority]} flex items-center gap-1`}
            >
              {issue.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Status: {issue.status}</span>
            <span>•</span>
            <span>Created {format(new Date(issue.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Edit2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="h-5 w-5 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.description ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{issue.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No description provided</p>
              )}
            </CardContent>
          </Card>

          {/* Subtasks */}
          <SubtasksList issueId={issueId} />

          {/* Comments */}
          <CommentList issueId={issueId} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Assignee */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                <div className="mt-1">
                  {issue.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={issue.assignee.avatar} />
                        <AvatarFallback>
                          {issue.assignee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{issue.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>

              {/* Due Date */}
              {issue.dueDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${isOverdue ? "text-destructive" : "text-muted-foreground"}`} />
                    <span className={`text-sm ${isOverdue ? "text-destructive" : ""}`}>
                      {format(new Date(issue.dueDate), "MMM d, yyyy")}
                    </span>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Reporter */}
              {issue.reporter && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reporter</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={issue.reporter.avatar} />
                      <AvatarFallback>
                        {issue.reporter.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{issue.reporter.name}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Labels */}
          {issue.labels && issue.labels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Labels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {issue.labels.map((label) => (
                    <Badge
                      key={label.id}
                      variant="outline"
                      style={{
                        backgroundColor: `${label.color}20`,
                        borderColor: label.color,
                        color: label.color,
                      }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Features */}
          <div className="space-y-4">
            <AiSummaryButton issueId={issueId} issueDescription={issue.description} />
            <AiSuggestionButton issueId={issueId} issueDescription={issue.description} />
            <AiDuplicateDetection issueId={issueId} />
          </div>
        </div>
      </div>
    </div>
  )
}

