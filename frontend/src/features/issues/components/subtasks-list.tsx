/**
 * Subtasks List Component
 * FR-039-2: Checklist-style subtasks with drag reorder
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, X, GripVertical } from "lucide-react"
import { useIssue } from "../hooks/use-issue"
import { validators } from "@/lib/utils/validation"
import { FIELD_LIMITS, DATA_LIMITS } from "@/lib/constants"
import type { Subtask } from "@/types"

interface SubtasksListProps {
  issueId: string
}

export function SubtasksList({ issueId }: SubtasksListProps) {
  const {
    issue,
    loading,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    refreshIssue,
  } = useIssue(issueId)

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading && !issue) {
    return null
  }

  const subtasks = issue?.subtasks || []
  const completedCount = subtasks.filter((s) => s.completed).length

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return

    setError(null)

    // Validate title (FR-039-2: 1-200 characters)
    if (!validators.subtaskTitle(newSubtaskTitle)) {
      setError(
        `Subtask title must be between ${FIELD_LIMITS.SUBTASK_TITLE.min} and ${FIELD_LIMITS.SUBTASK_TITLE.max} characters`
      )
      return
    }

    // Check limit (FR-039-2: max 20 subtasks per issue)
    if (subtasks.length >= DATA_LIMITS.SUBTASKS_PER_ISSUE) {
      setError(`Maximum ${DATA_LIMITS.SUBTASKS_PER_ISSUE} subtasks per issue allowed`)
      return
    }

    setAdding(true)
    try {
      await createSubtask({
        title: newSubtaskTitle.trim(),
        order: subtasks.length,
      })
      setNewSubtaskTitle("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subtask")
    } finally {
      setAdding(false)
    }
  }

  const handleToggleComplete = async (subtask: Subtask) => {
    try {
      await updateSubtask(subtask.id, {
        completed: !subtask.completed,
      })
    } catch (err) {
      console.error("Failed to update subtask:", err)
    }
  }

  const handleDelete = async (subtaskId: string) => {
    try {
      await deleteSubtask(subtaskId)
    } catch (err) {
      console.error("Failed to delete subtask:", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subtasks</CardTitle>
          {subtasks.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {completedCount}/{subtasks.length} completed
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="p-2 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {/* Existing Subtasks */}
        {subtasks.length > 0 && (
          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-2 rounded-lg border hover:bg-accent/30 transition-colors"
              >
                <Checkbox
                  checked={subtask.completed}
                  onCheckedChange={() => handleToggleComplete(subtask)}
                />
                <span
                  className={`flex-1 text-sm ${
                    subtask.completed
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {subtask.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDelete(subtask.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Subtask */}
        {subtasks.length < DATA_LIMITS.SUBTASKS_PER_ISSUE && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a subtask..."
              value={newSubtaskTitle}
              onChange={(e) => {
                setNewSubtaskTitle(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSubtask()
                }
              }}
              maxLength={FIELD_LIMITS.SUBTASK_TITLE.max}
              disabled={adding}
            />
            <Button
              onClick={handleAddSubtask}
              disabled={adding || !newSubtaskTitle.trim()}
              size="icon"
            >
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {subtasks.length >= DATA_LIMITS.SUBTASKS_PER_ISSUE && (
          <p className="text-xs text-muted-foreground text-center">
            Maximum {DATA_LIMITS.SUBTASKS_PER_ISSUE} subtasks reached
          </p>
        )}
      </CardContent>
    </Card>
  )
}

