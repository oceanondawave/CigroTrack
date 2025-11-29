/**
 * Forgot Password Form Component
 * FR-003: Request password reset via email
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2 } from "lucide-react"
import { authService } from "../services/auth-service"
import { validators } from "@/lib/utils/validation"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate email
    if (!validators.email(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      const response = await authService.requestPasswordReset(email)
      if (response.error) {
        setError(response.error.message || "Failed to send reset email")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              IT
            </div>
            <span className="text-xl font-bold">IssueTracker</span>
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>We've sent a password reset link to your email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Password reset link has been sent to <strong>{email}</strong>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            The link will expire in 1 hour. If you don't see the email, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/auth/login" className="text-sm text-primary hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            IT
          </div>
          <span className="text-xl font-bold">IssueTracker</span>
        </div>
        <CardTitle className="text-2xl">Forgot password?</CardTitle>
        <CardDescription>Enter your email to receive a reset link</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/auth/login" className="text-sm text-primary hover:underline">
          Back to login
        </Link>
      </CardFooter>
    </Card>
  )
}

