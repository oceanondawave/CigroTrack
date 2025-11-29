/**
 * Guest Route Component
 * Wraps routes that should only be accessible when NOT authenticated (login, signup)
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/features/auth/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface GuestRouteProps {
  children: React.ReactNode
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}

