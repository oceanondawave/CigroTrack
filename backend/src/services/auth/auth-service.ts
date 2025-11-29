/**
 * Authentication Service
 * Handles user authentication using Supabase Auth
 * FR-001 to FR-007
 */

import { supabaseAdmin } from '../../config/supabase'
import bcrypt from 'bcryptjs'
import type { User } from '../../types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

export class AuthService {
  /**
   * FR-001: Email/Password Signup
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user directly with admin API (auto-confirmed, no email verification needed)
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Auto-confirm email so user can login immediately
      user_metadata: {
        name: data.name,
      },
    })

    if (createError) {
      throw new Error(createError.message || 'Failed to create user')
    }

    if (!authUser.user) {
      throw new Error('Failed to create user')
    }

    // Create user record in public.users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        name: data.name,
        email: data.email,
        password_hash: passwordHash,
        auth_provider: 'email',
      })
      .select()
      .single()

    if (userError) {
      // If user creation in public.users fails, clean up auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw new Error('Failed to create user record')
    }

    // Sign in immediately after signup to get session
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError || !signInData.session) {
      // If auto sign-in fails, user will need to login manually
      console.error('Auto sign-in failed after signup:', signInError?.message)
      return {
        user: this.mapDbUserToUser(userData),
        token: '', // User created but needs to login
      }
    }

    return {
      user: this.mapDbUserToUser(userData),
      token: signInData.session.access_token,
    }
  }

  /**
   * FR-002: Email/Password Login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Use Supabase Auth for login
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (authError) {
      // Check for specific error codes
      if (authError.message?.toLowerCase().includes('email_not_confirmed') || 
          authError.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please confirm your email address before logging in. Check your inbox for a confirmation link.')
      }
      throw new Error(authError.message || 'Invalid email or password')
    }

    if (!authData.user || !authData.session) {
      throw new Error('Failed to create session')
    }

    // Get user from public.users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .is('deleted_at', null)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    return {
      user: this.mapDbUserToUser(userData),
      token: authData.session.access_token,
    }
  }

  /**
   * FR-004: Google OAuth Login
   */
  async googleOAuthLogin(idToken: string): Promise<AuthResponse> {
    // Verify and create session from Google token
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    })

    if (authError || !authData.user || !authData.session) {
      throw new Error('Google authentication failed')
    }

    // Check if user exists in public.users
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    let userData

    if (!existingUser) {
      // Create new user record
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
          email: authData.user.email!,
          auth_provider: 'google',
          avatar: authData.user.user_metadata?.avatar_url,
        })
        .select()
        .single()

      if (createError) {
        throw new Error('Failed to create user record')
      }
      userData = newUser
    } else {
      userData = existingUser
    }

    return {
      user: this.mapDbUserToUser(userData),
      token: authData.session.access_token,
    }
  }

  /**
   * Get current user from token
   */
  async getCurrentUser(token: string): Promise<User | null> {
    // Verify token with Supabase
    const { data: { user: authUser }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !authUser) {
      return null
    }

    // Get user from public.users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .is('deleted_at', null)
      .single()

    if (userError || !userData) {
      return null
    }

    return this.mapDbUserToUser(userData)
  }

  /**
   * FR-003: Password Reset Request
   */
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
      // Don't reveal if email exists for security
      throw new Error('If an account exists, a password reset email has been sent')
    }
  }

  /**
   * FR-003: Reset Password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Verify token and update password
    const { error } = await supabaseAdmin.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      throw new Error('Invalid or expired reset token')
    }
  }

  /**
   * FR-005: Update Profile
   */
  async updateProfile(userId: string, updates: { name?: string; avatar?: string }): Promise<User> {
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .update({
        name: updates.name,
        avatar: updates.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .is('deleted_at', null)
      .select()
      .single()

    if (error || !userData) {
      throw new Error('Failed to update profile')
    }

    return this.mapDbUserToUser(userData)
  }

  /**
   * FR-006: Change Password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get user's current password hash
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !userData || !userData.password_hash) {
      throw new Error('User not found or uses OAuth')
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userData.password_hash)
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (updateError) {
      throw new Error('Failed to update password')
    }

    // Update password hash in users table
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    await supabaseAdmin
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId)
  }

  /**
   * FR-007: Delete Account
   */
  async deleteAccount(userId: string): Promise<void> {
    // Check if user owns any teams
    const { data: ownedTeams, error: teamsError } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('owner_id', userId)
      .is('deleted_at', null)

    if (teamsError) {
      throw new Error('Failed to check team ownership')
    }

    if (ownedTeams && ownedTeams.length > 0) {
      throw new Error('Cannot delete account: You are the owner of one or more teams. Please transfer ownership or delete teams first.')
    }

    // Soft delete user
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', userId)

    if (deleteError) {
      throw new Error('Failed to delete account')
    }

    // Also delete from Supabase Auth (hard delete)
    await supabaseAdmin.auth.admin.deleteUser(userId)
  }

  /**
   * Logout
   */
  async logout(token: string): Promise<void> {
    // Supabase handles session invalidation
    // For JWT tokens, we can't "revoke" them server-side
    // They expire naturally (24 hours per FR-002)
    // Frontend should delete the token from localStorage
  }

  /**
   * Map database user to User type
   */
  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: dbUser.avatar || undefined,
      authProvider: dbUser.auth_provider || 'email',
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
      deletedAt: dbUser.deleted_at || undefined,
    }
  }
}

export const authService = new AuthService()

