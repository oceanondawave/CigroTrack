"use client"

import { AppLayout } from "@/components/app-layout"
import { ProjectsList } from "@/features/projects/components/projects-list"
import { ProtectedRoute } from "@/components/protected-route"

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <ProjectsList />
      </AppLayout>
    </ProtectedRoute>
  )
}
