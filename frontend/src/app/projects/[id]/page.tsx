"use client"

import { use } from "react"
import { AppLayout } from "@/components/app-layout"
import { ProjectDetail } from "@/features/projects/components/project-detail"
import { ProtectedRoute } from "@/components/protected-route"

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  
  return (
    <ProtectedRoute>
      <AppLayout>
        <ProjectDetail projectId={id} />
      </AppLayout>
    </ProtectedRoute>
  )
}
