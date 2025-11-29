/**
 * Authentication Hook
 * Manages user authentication state and operations
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService } from "../services/auth-service"
import { apiClient } from "@/lib/api/client"
import type { User } from "@/types"
import type { LoginCredentials, SignupData, AuthSession } from "../types"

interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>
  changePassword: (data: {
    currentPassword: string
    newPassword: string
  }) => Promise<void>
  deleteAccount: (password?: string) => Promise<void>
  refreshUser: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      // Token is stored in httpOnly cookie, automatically sent with requests
      // Just check if user is authenticated by calling /me endpoint
      const response = await authService.getCurrentUser()
      if (response.data) {
        setUser(response.data)
      } else {
        // Not authenticated or invalid session
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const response = await authService.login(credentials)
        if (response.data && response.data.user) {
          // Token is set as httpOnly cookie by backend, not in response
          // Set user immediately from response
          setUser(response.data.user)
          
          // Verify cookie is set by calling /auth/me (cookie should be sent automatically)
          // This ensures the cookie is working before redirecting
          try {
            const verifyResponse = await authService.getCurrentUser()
            if (verifyResponse.data) {
              setUser(verifyResponse.data)
            }
          } catch (verifyError) {
            console.error("Failed to verify auth after login:", verifyError)
            // Continue anyway - cookie might still be set
          }
          
          router.push("/dashboard")
        } else {
          throw new Error(response.error?.message || "Login failed")
        }
      } catch (error) {
        throw error
      }
    },
    [router]
  )

  const signup = useCallback(
    async (data: SignupData) => {
      try {
        const response = await authService.signup(data)
        if (response.data) {
          // Token is set as httpOnly cookie by backend, not in response
          setUser(response.data.user)
          router.push("/dashboard")
        } else {
          throw new Error(response.error?.message || "Signup failed")
        }
      } catch (error) {
        throw error
      }
    },
    [router]
  )

  const logout = useCallback(async () => {
    try {
      // Backend will clear the httpOnly cookie
      await authService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      router.push("/auth/login")
    }
  }, [router])

  const updateProfile = useCallback(
    async (data: { name?: string; avatar?: string }) => {
      try {
        const response = await authService.updateProfile(data)
        if (response.data) {
          setUser(response.data)
        } else {
          throw new Error(response.error?.message || "Profile update failed")
        }
      } catch (error) {
        throw error
      }
    },
    []
  )

  const changePassword = useCallback(
    async (data: { currentPassword: string; newPassword: string }) => {
      try {
        const response = await authService.changePassword(data)
        if (!response.success || response.error) {
          throw new Error(response.error?.message || "Password change failed")
        }
      } catch (error) {
        throw error
      }
    },
    []
  )

  const deleteAccount = useCallback(
    async (password?: string) => {
      try {
        const response = await authService.deleteAccount(password)
        if (!response.success || response.error) {
          throw new Error(response.error?.message || "Account deletion failed")
        }
        // Account deleted, logout (cookie cleared by backend)
        setUser(null)
        router.push("/auth/login")
      } catch (error) {
        throw error
      }
    },
    [router]
  )

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser()
      if (response.data) {
        setUser(response.data)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    refreshUser,
  }
}

