"use client"

import { AppLayout } from "@/components/app-layout"
import { NotificationsList } from "@/features/notifications/components/notifications-list"
import { ProtectedRoute } from "@/components/protected-route"

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <NotificationsList />
      </AppLayout>
    </ProtectedRoute>
  )
}
