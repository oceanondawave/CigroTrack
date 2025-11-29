"use client"

import type React from "react"

import { AppHeader } from "./app-header"
import { AppSidebar } from "./app-sidebar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative z-10">
      <AppSidebar />
      <div className="pl-64">
        <AppHeader />
        <main className="p-6 relative z-10">{children}</main>
      </div>
    </div>
  )
}
