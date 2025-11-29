/**
 * Notification Item Component
 * Individual notification display
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Check, XCircle, Loader2 } from "lucide-react"
import { useNotifications } from "../hooks/use-notifications"
import { teamService } from "@/features/teams/services/team-service"
import type { Notification } from "@/types"
import { format } from "date-fns"

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter()
  const { markAsRead, refreshNotifications } = useNotifications()
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await markAsRead(notification.id)
  }

  const handleAcceptInvite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const inviteId = notification.metadata?.inviteId as string | undefined
    if (!inviteId) return

    setAccepting(true)
    try {
      const response = await teamService.acceptInvite(inviteId)
      if (response.success) {
        await markAsRead(notification.id)
        await refreshNotifications()
        // Redirect to team page
        const teamId = notification.metadata?.teamId as string | undefined
        if (teamId) {
          router.push(`/teams/${teamId}`)
        }
      }
    } catch (error) {
      console.error("Failed to accept invite:", error)
    } finally {
      setAccepting(false)
    }
  }

  const handleDeclineInvite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const inviteId = notification.metadata?.inviteId as string | undefined
    if (!inviteId) return

    setDeclining(true)
    try {
      const response = await teamService.declineInvite(inviteId)
      if (response.success) {
        await markAsRead(notification.id)
        await refreshNotifications()
      }
    } catch (error) {
      console.error("Failed to decline invite:", error)
    } finally {
      setDeclining(false)
    }
  }

  const getNotificationLink = () => {
    // For team invites, link to the invitations page
    if (notification.type === "team_invite") {
      return "/teams/invites"
    }
    
    // Use the link from metadata or notification.link if available
    if (notification.link) {
      return notification.link
    }
    
    // Fallback to type-based links using metadata
    const issueId = notification.metadata?.issueId as string | undefined
    const projectId = notification.metadata?.projectId as string | undefined
    const teamId = notification.metadata?.teamId as string | undefined
    
    switch (notification.type) {
      case "issue_assigned":
      case "comment_added":
        if (issueId) return `/issues/${issueId}`
        break
      default:
        if (issueId) return `/issues/${issueId}`
        if (projectId) return `/projects/${projectId}`
        if (teamId) return `/teams/${teamId}`
    }
    return "#"
  }

  const isTeamInvite = notification.type === "team_invite"
  const inviteId = notification.metadata?.inviteId as string | undefined

  return (
    <Link href={getNotificationLink()}>
      <div
        className={`p-3 hover:bg-accent/30 transition-colors border-b border-border/60 ${
          !notification.read ? "bg-primary/5" : ""
        } cursor-pointer`}
        onClick={(e) => {
          // Don't navigate if clicking on buttons
          if ((e.target as HTMLElement).closest('button')) {
            e.preventDefault()
            return
          }
          if (!notification.read) {
            markAsRead(notification.id)
          }
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{notification.title}</p>
            {notification.message && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
            )}
            
            {/* Accept/Decline buttons for team invites */}
            {isTeamInvite && inviteId && (
              <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs"
                  onClick={handleAcceptInvite}
                  disabled={accepting || declining}
                >
                  {accepting ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={handleDeclineInvite}
                  disabled={accepting || declining}
                >
                  {declining ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Declining...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Decline
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {format(new Date(notification.createdAt), "MMM d, h:mm a")}
              </span>
              {!notification.read && (
                <Badge variant="default" className="h-4 px-1.5 text-xs">
                  New
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleMarkAsRead}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
