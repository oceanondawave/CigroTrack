/**
 * Reset Password Form Component
 * FR-003: Complete password reset with token
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2 } from "lucide-react"
import { authService } from "../services/auth-service"
import { validators } from "@/lib/utils/validation"
import { FIELD_LIMITS } from "@/lib/constants"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError("Invalid or missing reset token")
      return
    }

    // Validate password (FR-003: min 6, max 100 characters)
    if (!validators.password(password)) {
      setError(`Password must be between ${FIELD_LIMITS.PASSWORD.min} and ${FIELD_LIMITS.PASSWORD.max} characters`)
      return
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await authService.resetPassword(token, password)
      if (response.error) {
        setError(response.error.message || "Failed to reset password")
      } else {
        setSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
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
          <CardTitle className="text-2xl">Password reset successful</CardTitle>
          <CardDescription>Your password has been changed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <p className="text-sm text-muted-foreground">
              You can now sign in with your new password
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/auth/login" className="text-sm text-primary hover:underline">
            Go to login
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              IT
            </div>
            <span className="text-xl font-bold">IssueTracker</span>
          </div>
          <CardTitle className="text-2xl">Invalid reset link</CardTitle>
          <CardDescription>The password reset link is invalid or has expired</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Password reset links expire after 1 hour. Please request a new one.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
            Request new reset link
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
        <CardTitle className="text-2xl">Reset password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={`Min. ${FIELD_LIMITS.PASSWORD.min} characters`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={FIELD_LIMITS.PASSWORD.min}
              maxLength={FIELD_LIMITS.PASSWORD.max}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {FIELD_LIMITS.PASSWORD.min}-{FIELD_LIMITS.PASSWORD.max} characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              "Reset password"
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

