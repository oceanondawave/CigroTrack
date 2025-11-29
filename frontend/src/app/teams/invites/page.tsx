"use client"

import { AppLayout } from "@/components/app-layout"
import { UserInvitationsList } from "@/features/teams/components/user-invitations-list"
import { ProtectedRoute } from "@/components/protected-route"

export default function TeamInvitesPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Team Invitations</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your pending team invitations
            </p>
          </div>
          <UserInvitationsList />
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

