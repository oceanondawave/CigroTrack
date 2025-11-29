/**
 * Authentication feature types
 * Based on PRD FR-001 to FR-007
 */

import type { User } from "@/types"

/**
 * FR-001: Sign Up Input
 */
export interface SignupData {
  name: string // 1-50 characters
  email: string // Unique, email format, max 255 characters
  password: string // Min 6 characters, max 100 characters
}

/**
 * FR-002: Login Input
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Authentication Session
 */
export interface AuthSession {
  user: User
  token: string // Token expiration: 24 hours (FR-002)
}

/**
 * FR-003: Password Reset Request
 */
export interface PasswordResetRequest {
  email: string
}

/**
 * FR-003: Password Reset
 */
export interface PasswordResetData {
  token: string // Expiration: 1 hour (FR-003)
  password: string // Min 6 characters, max 100 characters
}

/**
 * FR-005: Profile Update
 */
export interface ProfileUpdateData {
  name?: string // 1-50 characters
  avatar?: string // Image URL or file upload
}

/**
 * FR-006: Password Change
 */
export interface PasswordChangeData {
  currentPassword: string
  newPassword: string // Min 6 characters, max 100 characters
  confirmPassword: string // Must match newPassword
}

/**
 * FR-007: Account Deletion
 */
export interface AccountDeletionData {
  password?: string // Required for email auth, not for OAuth
}
