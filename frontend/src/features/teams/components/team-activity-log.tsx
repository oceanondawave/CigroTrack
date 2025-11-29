/**
 * Team Activity Log Component
 * FR-019: Display team activities in chronological order
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useTeam } from "../hooks/use-team"

interface TeamActivityLogProps {
  teamId: string
}

export function TeamActivityLog({ teamId }: TeamActivityLogProps) {
  const {
    activities,
    loading,
    hasMoreActivities,
    refreshActivities,
    activitiesPage,
  } = useTeam(teamId)

  const loadMore = () => {
    if (hasMoreActivities && !loading) {
      refreshActivities(activitiesPage + 1)
    }
  }

  const formatActivityDescription = (activity: {
    action: string
    targetType: string
    targetName: string
    metadata?: Record<string, unknown>
  }) => {
    switch (activity.action) {
      case "member_join":
        return `joined the team`
      case "member_leave":
        return `left the team`
      case "member_kick":
        return `removed ${activity.targetName} from the team`
      case "role_change":
        return `changed ${activity.targetName}'s role to ${activity.metadata?.newRole || ""}`
      case "project_create":
        return `created project "${activity.targetName}"`
      case "project_delete":
        return `deleted project "${activity.targetName}"`
      case "project_archive":
        return `archived project "${activity.targetName}"`
      case "team_update":
        return `updated team information`
      default:
        return activity.action.replace(/_/g, " ")
    }
  }

  if (loading && activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Recent team activities and changes</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activities yet
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback>
                    {activity.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatActivityDescription(activity)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {hasMoreActivities && (
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

