/**
 * Create Project Dialog Component
 * FR-020: Create a new project within a team
 */

"use client"

import { useState } from "react"
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
import { useProjects } from "../hooks/use-projects"
import { validators } from "@/lib/utils/validation"
import { FIELD_LIMITS, DATA_LIMITS } from "@/lib/constants"
import { useTeams } from "@/features/teams/hooks/use-teams"

interface CreateProjectDialogProps {
  teamId?: string
  onSuccess?: (projectId: string) => void
}

export function CreateProjectDialog({
  teamId: initialTeamId,
  onSuccess,
}: CreateProjectDialogProps) {
  const { teams, loading: teamsLoading } = useTeams()
  const { createProject } = useProjects()
  const [open, setOpen] = useState(false)
  const [teamId, setTeamId] = useState(initialTeamId || "")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate team selection
    if (!teamId) {
      setError("Please select a team")
      return
    }

    // Validate name (FR-020: 1-100 characters)
    if (!validators.projectName(name)) {
      setError(
        `Project name must be between ${FIELD_LIMITS.PROJECT_NAME.min} and ${FIELD_LIMITS.PROJECT_NAME.max} characters`
      )
      return
    }

    // Validate description (FR-025: max 2000 characters)
    if (description && !validators.projectDescription(description)) {
      setError(
        `Description must be less than ${FIELD_LIMITS.PROJECT_DESCRIPTION.max} characters`
      )
      return
    }

    setLoading(true)
    try {
      const project = await createProject(teamId, {
        name,
        description: description || undefined,
      })
      setName("")
      setDescription("")
      setTeamId(initialTeamId || "")
      setOpen(false)
      if (onSuccess) {
        onSuccess(project.id)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create project"
      if (errorMessage.includes("limit") || errorMessage.includes("15")) {
        setError(`Maximum ${DATA_LIMITS.PROJECTS_PER_TEAM} projects per team allowed`)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      setName("")
      setDescription("")
      setTeamId(initialTeamId || "")
      setError(null)
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project to organize and track issues. Maximum {DATA_LIMITS.PROJECTS_PER_TEAM} projects per team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            {!initialTeamId && (
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Select
                  value={teamId}
                  onValueChange={setTeamId}
                  disabled={loading || teamsLoading}
                >
                  <SelectTrigger id="team">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={FIELD_LIMITS.PROJECT_NAME.min}
                maxLength={FIELD_LIMITS.PROJECT_NAME.max}
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {FIELD_LIMITS.PROJECT_NAME.min}-{FIELD_LIMITS.PROJECT_NAME.max} characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={FIELD_LIMITS.PROJECT_DESCRIPTION.max}
                disabled={loading}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Max {FIELD_LIMITS.PROJECT_DESCRIPTION.max} characters. Markdown supported.
              </p>
            </div>
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
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

