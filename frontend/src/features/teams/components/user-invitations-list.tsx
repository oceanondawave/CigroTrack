/**
 * User Invitations List Component
 * Displays and allows accepting pending team invitations
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, XCircle } from "lucide-react"
import { useUserInvitations } from "../hooks/use-user-invitations"
import { teamService } from "../services/team-service"
import type { TeamInvite } from "@/types"
import { format } from "date-fns"

export function UserInvitationsList() {
  const router = useRouter()
  const { invitations, loading, error, acceptInvite, refreshInvitations } =
    useUserInvitations()
  const [acceptingInviteId, setAcceptingInviteId] = useState<string | null>(
    null
  )
  const [decliningInviteId, setDecliningInviteId] = useState<string | null>(
    null
  )
  const [acceptErrors, setAcceptErrors] = useState<Record<string, string>>({})
  const [declineErrors, setDeclineErrors] = useState<Record<string, string>>({})

  const handleAcceptInvite = async (invite: TeamInvite) => {
    if (
      !confirm(
        `Are you sure you want to accept the invitation to join ${invite.team?.name || "this team"}?`
      )
    ) {
      return
    }

    setAcceptingInviteId(invite.id)
    setAcceptErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[invite.id]
      return newErrors
    })
    try {
      await acceptInvite(invite.id)
      // Redirect to team page after accepting
      if (invite.teamId) {
        router.push(`/teams/${invite.teamId}`)
      } else {
        await refreshInvitations()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to accept invitation"
      setAcceptErrors((prev) => ({ ...prev, [invite.id]: errorMessage }))
      console.error("Failed to accept invitation:", err)
    } finally {
      setAcceptingInviteId(null)
    }
  }

  const handleDeclineInvite = async (invite: TeamInvite) => {
    if (
      !confirm(
        `Are you sure you want to decline the invitation to join ${invite.team?.name || "this team"}?`
      )
    ) {
      return
    }

    setDecliningInviteId(invite.id)
    setDeclineErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[invite.id]
      return newErrors
    })
    try {
      const response = await teamService.declineInvite(invite.id)
      if (response.success) {
        await refreshInvitations()
      } else {
        throw new Error(response.error?.message || "Failed to decline invitation")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to decline invitation"
      setDeclineErrors((prev) => ({ ...prev, [invite.id]: errorMessage }))
      console.error("Failed to decline invitation:", err)
    } finally {
      setDecliningInviteId(null)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default"
      case "ADMIN":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No pending invitations</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {invitations.map((invite) => (
        <Card key={invite.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  {invite.team?.name || "Unknown Team"}
                </CardTitle>
                <CardDescription>
                  {invite.invitedByUser
                    ? `Invited by ${invite.invitedByUser.name}`
                    : "Team invitation"}
                </CardDescription>
              </div>
              <Badge variant={getRoleBadgeVariant(invite.role)}>
                {invite.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  Expires {format(new Date(invite.expiresAt), "MMM d, yyyy")}
                </p>
                <p className="text-xs mt-1">
                  Invited {format(new Date(invite.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <div className="space-y-2">
                {acceptErrors[invite.id] && (
                  <p className="text-sm text-destructive">{acceptErrors[invite.id]}</p>
                )}
                {declineErrors[invite.id] && (
                  <p className="text-sm text-destructive">{declineErrors[invite.id]}</p>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleAcceptInvite(invite)}
                    disabled={acceptingInviteId === invite.id || decliningInviteId === invite.id}
                    className="flex-1"
                  >
                    {acceptingInviteId === invite.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeclineInvite(invite)}
                    disabled={acceptingInviteId === invite.id || decliningInviteId === invite.id}
                    className="flex-1"
                  >
                    {decliningInviteId === invite.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Declining...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Decline
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

