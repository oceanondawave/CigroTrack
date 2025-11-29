/**
 * Create Team Dialog Component
 * FR-010: Create a new team
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"
import { useTeams } from "../hooks/use-teams"
import { validators } from "@/lib/utils/validation"
import { FIELD_LIMITS } from "@/lib/constants"

interface CreateTeamDialogProps {
  onSuccess?: (teamId: string) => void
}

export function CreateTeamDialog({ onSuccess }: CreateTeamDialogProps) {
  const { createTeam } = useTeams()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate name (FR-010: 1-50 characters)
    if (!validators.teamName(name)) {
      setError(
        `Team name must be between ${FIELD_LIMITS.TEAM_NAME.min} and ${FIELD_LIMITS.TEAM_NAME.max} characters`
      )
      return
    }

    setLoading(true)
    try {
      const team = await createTeam({ name })
      setName("")
      setOpen(false)
      if (onSuccess) {
        onSuccess(team.id)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create team"
      console.error("Team creation error:", err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      setName("")
      setError(null)
    }
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a new team to organize your projects and collaborate with others.
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
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={FIELD_LIMITS.TEAM_NAME.min}
                maxLength={FIELD_LIMITS.TEAM_NAME.max}
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {FIELD_LIMITS.TEAM_NAME.min}-{FIELD_LIMITS.TEAM_NAME.max} characters
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
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

