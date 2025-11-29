"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockTeamMembers, mockPendingInvites, mockTeamActivity } from "@/lib/mock-data"
import { InviteMemberDialog } from "@/components/dialogs/invite-member-dialog"
import { MoreVertical, Shield, Eye, Clock } from "lucide-react"

export default function TeamDetailPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Engineering</h1>
            <p className="text-muted-foreground mt-2">{mockTeamMembers.length} members</p>
          </div>
          <InviteMemberDialog />
        </div>

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invites">
              Pending Invites
              {mockPendingInvites.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {mockPendingInvites.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage team members and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTeamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                          {member.role === "admin" && <Shield className="mr-1 h-3 w-3" />}
                          {member.role === "viewer" && <Eye className="mr-1 h-3 w-3" />}
                          {member.role}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Remove from Team</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>Invitations waiting for response</CardDescription>
              </CardHeader>
              <CardContent>
                {mockPendingInvites.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No pending invitations</p>
                ) : (
                  <div className="space-y-4">
                    {mockPendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-medium text-sm">{invite.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Invited by {invite.invitedBy} • {invite.invitedDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{invite.role}</Badge>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            Revoke
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Activity</CardTitle>
                <CardDescription>Recent actions by team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTeamActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                          <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
