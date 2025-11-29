/**
 * Create Issue Dialog Component
 * FR-030: Create a new issue within a project
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { useIssues } from "../hooks/use-issues"
import { issueService } from "../services/issue-service"
import { validators } from "@/lib/utils/validation"
import { FIELD_LIMITS, DATA_LIMITS } from "@/lib/constants"
import type { TeamMember } from "@/types"

interface CreateIssueDialogProps {
  projectId: string
  teamMembers?: TeamMember[]
  onSuccess?: (issueId: string) => void
}

export function CreateIssueDialog({
  projectId,
  teamMembers = [],
  onSuccess,
}: CreateIssueDialogProps) {
  const { createIssue } = useIssues(projectId)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState<string>("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM")
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [labels, setLabels] = useState<any[]>([])

  useEffect(() => {
    // Load labels for the project
    const loadLabels = async () => {
      try {
        const response = await issueService.getLabels(projectId)
        if (response.success && response.data) {
          setLabels(response.data)
        }
      } catch (err) {
        console.error("Failed to load labels:", err)
      }
    }
    if (open && projectId) {
      loadLabels()
    }
  }, [open, projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate title (FR-030: 1-200 characters)
    if (!validators.issueTitle(title)) {
      setError(
        `Issue title must be between ${FIELD_LIMITS.ISSUE_TITLE.min} and ${FIELD_LIMITS.ISSUE_TITLE.max} characters`
      )
      return
    }

    // Validate description (FR-030: max 5000 characters)
    if (description && !validators.issueDescription(description)) {
      setError(
        `Description must be less than ${FIELD_LIMITS.ISSUE_DESCRIPTION.max} characters`
      )
      return
    }

    // Validate labels (FR-038: max 5 per issue)
    if (labelIds.length > DATA_LIMITS.LABELS_PER_ISSUE) {
      setError(`Maximum ${DATA_LIMITS.LABELS_PER_ISSUE} labels per issue allowed`)
      return
    }

    setLoading(true)
    try {
      const issue = await createIssue(projectId, {
        title,
        description: description || undefined,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        priority,
        labelIds: labelIds.length > 0 ? labelIds : undefined,
      })
      // Reset form
      setTitle("")
      setDescription("")
      setAssigneeId("")
      setDueDate("")
      setPriority("MEDIUM")
      setLabelIds([])
      setOpen(false)
      if (onSuccess) {
        onSuccess(issue.id)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create issue"
      if (errorMessage.includes("limit") || errorMessage.includes("200")) {
        setError(`Maximum ${DATA_LIMITS.ISSUES_PER_PROJECT} issues per project allowed`)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      setTitle("")
      setDescription("")
      setAssigneeId("")
      setDueDate("")
      setPriority("MEDIUM")
      setLabelIds([])
      setError(null)
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
          <DialogDescription>
            Create a new issue to track work. Maximum {DATA_LIMITS.ISSUES_PER_PROJECT} issues per project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter issue title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={FIELD_LIMITS.ISSUE_TITLE.min}
                maxLength={FIELD_LIMITS.ISSUE_TITLE.max}
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {FIELD_LIMITS.ISSUE_TITLE.min}-{FIELD_LIMITS.ISSUE_TITLE.max} characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter issue description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={FIELD_LIMITS.ISSUE_DESCRIPTION.max}
                disabled={loading}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Max {FIELD_LIMITS.ISSUE_DESCRIPTION.max} characters
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assign To (Optional)</Label>
                <Select
                  value={assigneeId}
                  onValueChange={setAssigneeId}
                  disabled={loading}
                >
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.userId}>
                        {member.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) =>
                    setPriority(value as "HIGH" | "MEDIUM" | "LOW")
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
              />
            </div>
            {labels.length > 0 && (
              <div className="space-y-2">
                <Label>Labels (Optional, max {DATA_LIMITS.LABELS_PER_ISSUE})</Label>
                <div className="flex flex-wrap gap-2">
                  {labels.map((label) => (
                    <Button
                      key={label.id}
                      type="button"
                      variant={labelIds.includes(label.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (labelIds.includes(label.id)) {
                          setLabelIds(labelIds.filter((id) => id !== label.id))
                        } else if (labelIds.length < DATA_LIMITS.LABELS_PER_ISSUE) {
                          setLabelIds([...labelIds, label.id])
                        }
                      }}
                      disabled={loading}
                      className="text-xs"
                    >
                      {label.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Issue"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

