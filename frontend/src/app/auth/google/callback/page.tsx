/**
 * Google OAuth Callback Page
 * FR-004: Handle Google OAuth callback
 */

"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useGoogleOAuth } from "@/features/auth/hooks/use-google-oauth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"

function GoogleCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { handleCallback } = useGoogleOAuth()
  const [error, setError] = useState<string | null>(null)
  const code = searchParams.get("code")

  useEffect(() => {
    if (!code) {
      setError("Missing authorization code")
      return
    }

    const processCallback = async () => {
      try {
        await handleCallback(code)
        // Navigation handled by useGoogleOAuth hook
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed")
      }
    }

    processCallback()
  }, [code, handleCallback])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                IT
              </div>
              <span className="text-xl font-bold">IssueTracker</span>
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-md border border-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl">Completing sign in...</CardTitle>
          <CardDescription>Please wait while we authenticate your account</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  )
}

