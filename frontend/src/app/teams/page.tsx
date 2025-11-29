"use client";

import { AppLayout } from "@/components/app-layout";
import { TeamsList } from "@/features/teams/components/teams-list";
import { ProtectedRoute } from "@/components/protected-route";

export default function TeamsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <TeamsList />
      </AppLayout>
    </ProtectedRoute>
  );
}
