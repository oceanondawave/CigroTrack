/**
 * Team Detail Component
 * Displays team information, members, and activity
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2 } from "lucide-react"
import { useTeam } from "../hooks/use-team"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { TeamMembers } from "./team-members"
import { TeamActivityLog } from "./team-activity-log"
import { canDeleteTeam } from "@/lib/utils/permissions"

interface TeamDetailProps {
  teamId: string
}

export function TeamDetail({ teamId }: TeamDetailProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { team, members, loading, error, deleteTeam } = useTeam(teamId)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const currentUserMember = members.find((m) => m.user.id === user?.id)
  const currentUserRole = currentUserMember?.role
  const canDelete = currentUserRole && canDeleteTeam(currentUserRole)

  const handleDeleteTeam = async () => {
    if (!team) return

    setDeleteLoading(true)
    try {
      await deleteTeam()
      router.push("/teams")
    } catch (err) {
      console.error("Failed to delete team:", err)
      setDeleteLoading(false)
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
        <button
          onClick={() => router.push("/teams")}
          className="mt-4 text-primary hover:underline"
        >
          Back to Teams
        </button>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Team not found</p>
        <button
          onClick={() => router.push("/teams")}
          className="mt-4 text-primary hover:underline"
        >
          Back to Teams
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground mt-2">
            Created {new Date(team.createdAt).toLocaleDateString()}
          </p>
        </div>
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteLoading}>
                {deleteLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Team
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Team</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{team.name}"? This action
                  cannot be undone. All team data, projects, and issues will be
                  permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteLoading}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTeam}
                  disabled={deleteLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Team"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <TeamMembers teamId={teamId} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <TeamActivityLog teamId={teamId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

