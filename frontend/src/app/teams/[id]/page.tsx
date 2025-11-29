"use client"

import { use } from "react"
import { AppLayout } from "@/components/app-layout"
import { TeamDetail } from "@/features/teams/components/team-detail"
import { ProtectedRoute } from "@/components/protected-route"

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  
  return (
    <ProtectedRoute>
      <AppLayout>
        <TeamDetail teamId={id} />
      </AppLayout>
    </ProtectedRoute>
  )
}
