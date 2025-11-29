"use client"

import { AppLayout } from "@/components/app-layout"
import { PersonalDashboard } from "@/features/dashboard/components/personal-dashboard"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <PersonalDashboard />
      </AppLayout>
    </ProtectedRoute>
  )
}
