"use client"

import { use } from "react"
import { AppLayout } from "@/components/app-layout"
import { IssueDetail } from "@/features/issues/components/issue-detail"
import { ProtectedRoute } from "@/components/protected-route"

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  
  return (
    <ProtectedRoute>
      <AppLayout>
        <IssueDetail issueId={id} />
      </AppLayout>
    </ProtectedRoute>
  )
}
