/**
 * Authentication Service
 * Handles all authentication-related API calls (FR-001 to FR-007)
 */

import { apiClient } from "@/lib/api/client"
import type { ApiResponse, User } from "@/types"
import type {
  LoginCredentials,
  SignupData,
  AuthSession,
} from "../types"

export const authService = {
  /**
   * FR-001: Sign Up
   * Create new user account with email/password
   * Token is set as httpOnly cookie by backend, only user is returned
   */
  async signup(data: SignupData): Promise<ApiResponse<{ user: User }>> {
    return apiClient.post<{ user: User }>("/auth/signup", {
      name: data.name,
      email: data.email,
      password: data.password,
    })
  },

  /**
   * FR-002: Login
   * Authenticate user with email/password
   * Token is set as httpOnly cookie by backend, only user is returned
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User }>> {
    return apiClient.post<{ user: User }>("/auth/login", credentials)
  },

  /**
   * FR-002: Logout
   * Invalidate current session
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/logout")
  },

  /**
   * FR-003: Request Password Reset
   * Send password reset email
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/forgot-password", { email })
  },

  /**
   * FR-003: Reset Password
   * Complete password reset with token
   */
  async resetPassword(
    token: string,
    password: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/reset-password", { token, newPassword: password })
  },

  /**
   * FR-004: Google OAuth Login
   * Initiate Google OAuth flow - get redirect URL
   */
  async googleOAuth(): Promise<ApiResponse<{ redirectUrl: string }>> {
    return apiClient.get<{ redirectUrl: string }>("/auth/google")
  },

  /**
   * FR-004: Google OAuth Callback
   * Handle OAuth callback with code
   */
  async googleOAuthCallback(code: string): Promise<ApiResponse<AuthSession>> {
    return apiClient.post<AuthSession>("/auth/google/callback", { code })
  },

  /**
   * FR-004: Google OAuth Login (Alternative)
   * Login with Google ID token directly
   * Token is set as httpOnly cookie by backend, only user is returned
   */
  async googleOAuthLogin(idToken: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.post<{ user: User }>("/auth/google", { idToken })
  },

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>("/auth/me")
  },

  /**
   * FR-005: Update Profile
   * Update user profile information
   */
  async updateProfile(data: {
    name?: string
    avatar?: string
  }): Promise<ApiResponse<User>> {
    return apiClient.put<User>("/auth/profile", data)
  },

  /**
   * FR-006: Change Password
   * Change user password (email auth only)
   */
  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<ApiResponse<void>> {
    return apiClient.post<void>("/auth/change-password", data)
  },

  /**
   * FR-007: Delete Account
   * Soft delete user account
   */
  async deleteAccount(password?: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>("/auth/account")
  },
}

