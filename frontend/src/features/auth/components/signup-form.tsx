/**
 * Signup Form Component
 * FR-001: Sign up with email/password
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Chrome, Loader2 } from "lucide-react"
import { useAuth } from "../hooks/use-auth"
import { useGoogleOAuth } from "../hooks/use-google-oauth"
import { validators } from "@/lib/utils/validation"
import { FIELD_LIMITS } from "@/lib/constants"

export function SignupForm() {
  const { signup } = useAuth()
  const { initiateOAuth } = useGoogleOAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate name (FR-001: 1-50 characters)
    if (!validators.userName(name)) {
      setError(`Name must be between ${FIELD_LIMITS.USER_NAME.min} and ${FIELD_LIMITS.USER_NAME.max} characters`)
      setLoading(false)
      return
    }

    // Validate email (FR-001: email format, max 255 characters)
    if (!validators.email(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    // Validate password (FR-001: min 6, max 100 characters)
    if (!validators.password(password)) {
      setError(`Password must be between ${FIELD_LIMITS.PASSWORD.min} and ${FIELD_LIMITS.PASSWORD.max} characters`)
      setLoading(false)
      return
    }

    try {
      await signup({ name, email, password })
      // Navigation handled by useAuth hook
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed"
      if (errorMessage.includes("duplicate") || errorMessage.includes("already exists")) {
        setError("This email is already registered. Please use a different email or sign in.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setLoading(true)
      await initiateOAuth()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate Google signup")
      setLoading(false)
    }
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
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your details to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full bg-transparent"
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={FIELD_LIMITS.USER_NAME.min}
              maxLength={FIELD_LIMITS.USER_NAME.max}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {FIELD_LIMITS.USER_NAME.min}-{FIELD_LIMITS.USER_NAME.max} characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={FIELD_LIMITS.EMAIL.max}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

