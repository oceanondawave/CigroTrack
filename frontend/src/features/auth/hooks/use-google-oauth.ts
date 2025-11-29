/**
 * Google OAuth Hook
 * Handles Google OAuth authentication flow (FR-004)
 */

"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService } from "../services/auth-service"
import { useAuth } from "./use-auth"

export function useGoogleOAuth() {
  const router = useRouter()
  const { refreshUser } = useAuth()

  const initiateOAuth = useCallback(async () => {
    try {
      const response = await authService.googleOAuth()
      if (response.data?.redirectUrl) {
        // Redirect to Google OAuth
        window.location.href = response.data.redirectUrl
      } else {
        throw new Error("Failed to get OAuth URL")
      }
    } catch (error) {
      throw error
    }
  }, [])

  const handleCallback = useCallback(
    async (code: string) => {
      try {
        const response = await authService.googleOAuthCallback(code)
        if (response.data) {
          // Token is set as httpOnly cookie by backend
          await refreshUser()
          router.push("/dashboard")
        } else {
          throw new Error(response.error?.message || "OAuth callback failed")
        }
      } catch (error) {
        throw error
      }
    },
    [router, refreshUser]
  )

  return {
    initiateOAuth,
    handleCallback,
  }
}

