/**
 * Team Service
 * Handles team-related operations using Supabase
 * FR-010 to FR-019
 */

import { supabaseAdmin } from '../../config/supabase'
import type { Team, TeamMember, TeamInvite, TeamActivity } from '../../types'
import { notificationService } from '../notifications/notification-service'

export interface CreateTeamData {
  name: string
  ownerId: string
}

export interface UpdateTeamData {
  name?: string
}

export interface InviteMemberData {
  teamId: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  invitedBy: string
}

export class TeamService {
  /**
   * FR-010: Create Team
   */
  async createTeam(data: CreateTeamData): Promise<Team> {
    // Check limit: max 15 projects per team (will be enforced per team later)
    // No limit on teams a user can create

    // First, verify the user exists
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', data.ownerId)
      .is('deleted_at', null)
      .single()

    if (userError || !userData) {
      const errorMsg = userError ? String(userError.message || 'Unknown error') : 'User not found'
      console.error(`User not found when creating team: ${errorMsg} (userId: ${data.ownerId})`)
      throw new Error('User not found. Please ensure you are logged in correctly.')
    }

    const { data: teamData, error } = await supabaseAdmin
      .from('teams')
      .insert({
        name: data.name,
        owner_id: data.ownerId,
      })
      .select()
      .single()

    if (error) {
      const errorMsg = String(error.message || 'Unknown error')
      const errorCode = String(error.code || 'UNKNOWN')
      const errorDetails = error.details ? String(error.details) : undefined
      const errorHint = error.hint ? String(error.hint) : undefined
      
      console.error(`Failed to create team - ${errorMsg} (code: ${errorCode})`)
      if (errorDetails) {
        console.error(`Error details: ${errorDetails}`)
      }
      if (errorHint) {
        console.error(`Error hint: ${errorHint}`)
      }
      
      // Check for RLS policy violation
      if (errorMsg.includes('row-level security') || errorMsg.includes('RLS') || errorCode === '42501') {
        console.error('⚠️ RLS Policy Violation Detected!')
        console.error('This should not happen with service role key. Please check:')
        console.error('1. SUPABASE_SERVICE_ROLE_KEY is set correctly in .env')
        console.error('2. Service role key has proper permissions')
        console.error('3. The key is from Supabase Dashboard > Settings > API > service_role key')
        throw new Error('Database security policy error. Please contact support.')
      }
      
      // Provide more specific error messages
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid user ID. Please ensure you are logged in correctly.')
      } else if (error.code === '23505') { // Unique violation
        throw new Error('A team with this name already exists.')
      } else if (error.code === '23514') { // Check constraint violation
        throw new Error('Team name is invalid. Please check the requirements.')
      }
      
      throw new Error(error.message || error.details || 'Failed to create team')
    }

    // Create team member entry (owner)
    const { error: memberError } = await supabaseAdmin.from('team_members').insert({
      team_id: teamData.id,
      user_id: data.ownerId,
      role: 'OWNER',
    })

    if (memberError) {
      const memberErrorMsg = String(memberError.message || 'Unknown error')
      const memberErrorCode = String(memberError.code || 'UNKNOWN')
      console.error(`Failed to create team member - ${memberErrorMsg} (code: ${memberErrorCode})`)
      
      // If team member creation fails, we should clean up the team
      // Otherwise we'll have an orphaned team
      try {
        await supabaseAdmin.from('teams').delete().eq('id', teamData.id)
        console.log('Cleaned up orphaned team after member creation failure')
      } catch (cleanupError) {
        const cleanupErrorMsg = cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
        console.error(`Failed to cleanup team after member creation failure: ${cleanupErrorMsg}`)
      }
      
      // Provide more specific error messages
      if (memberError.code === '23505') { // Unique violation
        throw new Error('You are already a member of this team.')
      } else if (memberError.code === '23503') { // Foreign key violation
        throw new Error('Invalid team or user ID.')
      }
      
      throw new Error(memberError.message || memberError.details || 'Failed to create team member')
    }

    // Log activity (non-blocking - don't fail team creation if logging fails)
    try {
      await this.logActivity(teamData.id, data.ownerId, {
        action: 'created team',
        targetType: 'team',
        targetId: teamData.id,
        targetName: data.name,
      })
    } catch (activityError) {
      const activityErrorMsg = activityError instanceof Error ? activityError.message : String(activityError)
      console.error(`Failed to log team creation activity (non-blocking): ${activityErrorMsg}`)
      // Continue anyway - team was created successfully
    }

    return this.mapDbTeamToTeam(teamData)
  }

  /**
   * FR-011: Get Teams
   */
  async getTeams(userId: string): Promise<Team[]> {
    try {
      // Get teams where user is a member
      const { data: memberTeams, error: memberError } = await supabaseAdmin
        .from('team_members')
        .select(`
          team:teams!inner(*)
        `)
        .eq('user_id', userId)

      if (memberError) {
        // Safely extract error information to avoid circular references
        const errorMessage = String(memberError.message || 'Unknown error')
        const errorCode = String(memberError.code || 'UNKNOWN')
        
        // Only log primitive values to avoid circular references
        console.error(`Error fetching teams: ${errorMessage} (code: ${errorCode})`)
        
        // Return empty array for any error to prevent stack overflow
        // Errors will be logged but won't crash the app
        return []
      }

      // Handle null/undefined data gracefully
      if (!memberTeams) {
        return []
      }

      const teams = memberTeams
        .map((mt: any) => {
          if (!mt.team || !mt.team.id || !mt.team.name) {
            return null
          }
          return this.mapDbTeamToTeam(mt.team)
        })
        .filter((team): team is Team => {
          return team !== null && !!team.id && !!team.name && team.name.trim() !== ''
        })
      
      return teams.filter((team) => !team.deletedAt && !!team.name && team.name.trim() !== '')
    } catch (error) {
      // Catch any unexpected errors and return empty array
      // Extract only primitive values for logging
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`Unexpected error in getTeams: ${errorMessage}`)
      return []
    }
  }

  /**
   * FR-012: Get Team by ID
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    const { data: teamData, error } = await supabaseAdmin
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .is('deleted_at', null)
      .single()

    if (error || !teamData) {
      return null
    }

    return this.mapDbTeamToTeam(teamData)
  }

  /**
   * FR-012: Update Team
   */
  async updateTeam(teamId: string, updates: UpdateTeamData, userId: string): Promise<Team> {
    // Check permissions (owner or admin)
    const hasPermission = await this.checkPermission(teamId, userId, ['OWNER', 'ADMIN'])
    if (!hasPermission) {
      throw new Error('Insufficient permissions')
    }

    const { data: teamData, error } = await supabaseAdmin
      .from('teams')
      .update({
        name: updates.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamId)
      .is('deleted_at', null)
      .select()
      .single()

    if (error || !teamData) {
      throw new Error('Failed to update team')
    }

    // Log activity
    if (updates.name) {
      await this.logActivity(teamId, userId, {
        action: `updated team name to "${updates.name}"`,
        targetType: 'team',
        targetId: teamId,
        targetName: updates.name,
      })
    }

    return this.mapDbTeamToTeam(teamData)
  }

  /**
   * FR-012: Delete Team (soft delete)
   */
  async deleteTeam(teamId: string, userId: string): Promise<void> {
    // Check if user is owner
    const team = await this.getTeamById(teamId)
    if (!team) {
      throw new Error('Team not found')
    }

    if (team.ownerId !== userId) {
      throw new Error('Only team owner can delete team')
    }

    const { error } = await supabaseAdmin
      .from('teams')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', teamId)

    if (error) {
      throw new Error('Failed to delete team')
    }

    // Log activity
    await this.logActivity(teamId, userId, {
      action: 'deleted team',
      targetType: 'team',
      targetId: teamId,
      targetName: team.name,
    })
  }

  /**
   * FR-013: Invite Member
   */
  async inviteMember(data: InviteMemberData): Promise<TeamInvite> {
    // Check permissions
    const hasPermission = await this.checkPermission(data.teamId, data.invitedBy, ['OWNER', 'ADMIN'])
    if (!hasPermission) {
      throw new Error('Insufficient permissions to invite members')
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration

    // Normalize email to lowercase for consistent matching
    const normalizedEmail = data.email.toLowerCase().trim()
    
    console.log(`📧 Creating invite for email: ${normalizedEmail} to team: ${data.teamId}`)

    const { data: inviteData, error } = await supabaseAdmin
      .from('team_invites')
      .insert({
        team_id: data.teamId,
        email: normalizedEmail, // Store normalized email
        role: data.role,
        invited_by: data.invitedBy,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      const errorMsg = String(error.message || 'Unknown error')
      const errorCode = String(error.code || 'UNKNOWN')
      console.error(`Failed to create invite: ${errorMsg} (code: ${errorCode})`)
      throw new Error('Failed to create invite')
    }
    
    console.log(`✅ Invite created successfully: ${inviteData.id}`)

    // Log activity
    await this.logActivity(data.teamId, data.invitedBy, {
      action: `invited ${data.email} as ${data.role}`,
      targetType: 'member',
      targetId: inviteData.id,
      targetName: data.email,
    })

    // Create notification for invited user (if user exists)
    try {
      const { data: invitedUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', data.email)
        .is('deleted_at', null)
        .single()

      if (invitedUser) {
        const team = await this.getTeamById(data.teamId)
        await notificationService.createNotification({
          userId: invitedUser.id,
          title: `You've been invited to join ${team?.name || 'a team'}`,
          message: `You've been invited as ${data.role}`,
          type: 'team_invite',
          link: `/teams/invites`,
          metadata: {
            teamId: data.teamId,
            inviteId: inviteData.id,
            role: data.role,
          },
        })
      }
    } catch (error) {
      // User doesn't exist yet - that's fine, notification will be created when they sign up
      // Or notification creation failed - log but don't fail the invite
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`Failed to create notification for invite (non-blocking): ${errorMsg}`)
    }

    return this.mapDbInviteToInvite(inviteData)
  }

  /**
   * Get pending team invites
   */
  async getTeamInvites(teamId: string): Promise<TeamInvite[]> {
    const { data: invitesData, error } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch team invites')
    }

    return (invitesData || []).map((invite: any) => this.mapDbInviteToInvite(invite))
  }

  /**
   * Get pending invites for a user (by email)
   * Includes team information
   */
  async getUserPendingInvites(userEmail: string): Promise<(TeamInvite & { team?: Team; invitedByUser?: { id: string; name: string; email: string } })[]> {
    // Normalize email to lowercase for case-insensitive matching
    const normalizedEmail = userEmail.toLowerCase().trim()
    
    console.log(`🔍 Fetching pending invites for email: ${normalizedEmail}`)
    
    // Query invites by normalized email (new invites are normalized)
    // For old invites with different casing, we'll handle them separately if needed
    const { data: invitesData, error } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('email', normalizedEmail) // Exact match for normalized emails
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString()) // Only non-expired invites
      .order('created_at', { ascending: false })

    if (error) {
      const errorMsg = String(error.message || 'Unknown error')
      const errorCode = String(error.code || 'UNKNOWN')
      console.error(`Failed to fetch user invites: ${errorMsg} (code: ${errorCode})`)
      throw new Error('Failed to fetch user invites')
    }

    console.log(`📧 Found ${invitesData?.length || 0} pending invites for ${normalizedEmail}`)
    
    if (!invitesData || invitesData.length === 0) {
      return []
    }

    // Fetch team and inviter info using joins for efficiency
    const invitesWithDetails = await Promise.all(
      invitesData.map(async (invite: any) => {
        try {
          // Fetch team and inviter in parallel
          const [teamResult, inviterResult] = await Promise.all([
            // Fetch team directly, including deleted ones to show name even if deleted
            supabaseAdmin
              .from('teams')
              .select('id, name, owner_id, created_at, updated_at, deleted_at')
              .eq('id', invite.team_id)
              .maybeSingle(),
            supabaseAdmin
              .from('users')
              .select('id, name, email')
              .eq('id', invite.invited_by)
              .maybeSingle(),
          ])

          // Only include team if it exists and is not deleted
          const team = teamResult.data && !teamResult.data.deleted_at
            ? this.mapDbTeamToTeam(teamResult.data)
            : undefined

          // Log if team is not found or deleted
          if (!team) {
            if (teamResult.data?.deleted_at) {
              console.warn(`Team ${invite.team_id} is deleted for invite ${invite.id}. Filtering out invite.`)
            } else {
              console.error(`Team not found for invite ${invite.id}, team_id: ${invite.team_id}`)
            }
          }

          return {
            ...this.mapDbInviteToInvite(invite),
            team,
            invitedByUser: inviterResult.data ? {
              id: inviterResult.data.id,
              name: inviterResult.data.name,
              email: inviterResult.data.email,
            } : undefined,
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          console.error(`Error fetching details for invite ${invite.id}: ${errorMsg}`)
          // Return invite without team/inviter info if there's an error
          return {
            ...this.mapDbInviteToInvite(invite),
            team: undefined,
            invitedByUser: undefined,
          }
        }
      })
    )

    // Filter out invites for deleted teams
    return invitesWithDetails.filter(invite => invite.team !== undefined)
  }

  /**
   * Resend team invite (FR-013: updates expiration date)
   */
  async resendInvite(inviteId: string, userId: string): Promise<TeamInvite> {
    // Get the invite first
    const { data: inviteData, error: fetchError } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('id', inviteId)
      .single()

    if (fetchError || !inviteData) {
      throw new Error('Invite not found')
    }

    // Check if invite is still pending
    if (inviteData.status !== 'pending') {
      throw new Error('Can only resend pending invites')
    }

    // Check permissions (only team owner/admin can resend)
    const hasPermission = await this.checkPermission(inviteData.team_id, userId, ['OWNER', 'ADMIN'])
    if (!hasPermission) {
      throw new Error('Insufficient permissions to resend invite')
    }

    // Update expiration date to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data: updatedInvite, error: updateError } = await supabaseAdmin
      .from('team_invites')
      .update({ expires_at: expiresAt.toISOString() })
      .eq('id', inviteId)
      .select()
      .single()

    if (updateError || !updatedInvite) {
      throw new Error('Failed to resend invite')
    }

    // Log activity
    await this.logActivity(inviteData.team_id, userId, {
      action: `resent invitation to ${inviteData.email}`,
      targetType: 'member',
      targetId: inviteId,
      targetName: inviteData.email,
    })

    // Create notification for invited user if they exist (same as inviteMember)
    try {
      const { data: invitedUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', inviteData.email)
        .is('deleted_at', null)
        .single()

      if (invitedUser) {
        const team = await this.getTeamById(inviteData.team_id)
        await notificationService.createNotification({
          userId: invitedUser.id,
          title: `You've been re-invited to join ${team?.name || 'a team'}!`,
          message: `Your invitation to join ${team?.name || 'a team'} has been renewed.`,
          type: 'team_invite',
          link: `/teams/invites`,
          metadata: {
            teamId: inviteData.team_id,
            inviteId: inviteId,
            role: inviteData.role,
          },
        })
      }
    } catch (error) {
      // Non-blocking - just log the error
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`Failed to create notification for resent invite (non-blocking): ${errorMsg}`)
    }

    return this.mapDbInviteToInvite(updatedInvite)
  }

  /**
   * Revoke/Withdraw team invitation
   * FR-013: Cancel pending invitation
   */
  async revokeInvite(inviteId: string, userId: string): Promise<void> {
    // Get the invite first
    const { data: inviteData, error: fetchError } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('id', inviteId)
      .single()

    if (fetchError || !inviteData) {
      throw new Error('Invite not found')
    }

    // Check permissions (only team owner/admin can revoke)
    const hasPermission = await this.checkPermission(inviteData.team_id, userId, ['OWNER', 'ADMIN'])
    if (!hasPermission) {
      throw new Error('Insufficient permissions to revoke invite')
    }

    // Check if invite is still pending
    if (inviteData.status !== 'pending') {
      throw new Error('Can only revoke pending invites')
    }

    // Delete the invitation (or mark as revoked - we'll delete it for simplicity)
    const { error: deleteError } = await supabaseAdmin
      .from('team_invites')
      .delete()
      .eq('id', inviteId)

    if (deleteError) {
      throw new Error('Failed to revoke invite')
    }

    // Log activity
    await this.logActivity(inviteData.team_id, userId, {
      action: `revoked invitation to ${inviteData.email}`,
      targetType: 'member',
      targetId: inviteId,
      targetName: inviteData.email,
    })
  }

  /**
   * Accept team invite
   */
  async acceptInvite(inviteId: string, userId: string): Promise<TeamMember> {
    // Get invite
    const { data: inviteData, error: inviteError } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('id', inviteId)
      .single()

    if (inviteError || !inviteData) {
      throw new Error('Invite not found')
    }

    // Check if invite is still pending
    if (inviteData.status !== 'pending') {
      throw new Error('Invite already accepted or expired')
    }

    // Check if invite is expired
    if (new Date(inviteData.expires_at) < new Date()) {
      throw new Error('Invite has expired')
    }

    // Get user to verify email matches
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    // Compare emails case-insensitively
    if (userData.email.toLowerCase().trim() !== inviteData.email.toLowerCase().trim()) {
      throw new Error('Invite email does not match user email')
    }

    // Check if user is already a member
    const { data: existingMember, error: existingMemberError } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('team_id', inviteData.team_id)
      .eq('user_id', userId)
      .maybeSingle()

    // If we got an error that's not "no rows found", log it
    if (existingMemberError && existingMemberError.code !== 'PGRST116') {
      const errorMsg = String(existingMemberError.message || 'Unknown error')
      const errorCode = String(existingMemberError.code || 'UNKNOWN')
      console.error(`Error checking existing member: ${errorMsg} (code: ${errorCode})`)
    }

    if (existingMember) {
      // User is already a member, just mark invite as accepted
      await supabaseAdmin
        .from('team_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId)

      // Get the existing member
      const members = await this.getMembers(inviteData.team_id)
      const member = members.find(m => m.userId === userId)
      if (member) {
        return member
      }
      throw new Error('Failed to get team member')
    }

    // Create team member
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        team_id: inviteData.team_id,
        user_id: userId,
        role: inviteData.role,
      })
      .select(`
        *,
        user:users(*)
      `)
      .single()

    if (memberError || !memberData) {
      // Provide more specific error messages
      if (memberError) {
        const errorMsg = String(memberError.message || 'Unknown error')
        const errorCode = String(memberError.code || 'UNKNOWN')
        const errorDetails = memberError.details ? String(memberError.details) : undefined
        const errorHint = memberError.hint ? String(memberError.hint) : undefined
        
        console.error(`Failed to create team member: ${errorMsg} (code: ${errorCode})`)
        if (errorDetails) {
          console.error(`Error details: ${errorDetails}`)
        }
        if (errorHint) {
          console.error(`Error hint: ${errorHint}`)
        }

        // Provide specific error messages based on error codes
        if (errorCode === '23505') { // Unique violation - user already a member
          throw new Error('You are already a member of this team')
        } else if (errorCode === '23503') { // Foreign key violation
          throw new Error('Invalid team or user. Please try again.')
        } else if (errorCode === '23514') { // Check constraint violation
          throw new Error('Invalid role. Please contact support.')
        }
        
        throw new Error(`Failed to create team member: ${errorMsg}`)
      }
      throw new Error('Failed to create team member')
    }

    // Update invite status
    await supabaseAdmin
      .from('team_invites')
      .update({ status: 'accepted' })
      .eq('id', inviteId)

    // Log activity
    await this.logActivity(inviteData.team_id, userId, {
      action: `joined team`,
      targetType: 'team',
      targetId: inviteData.team_id,
      targetName: inviteData.email,
    })

    return this.mapDbMemberToMember(memberData)
  }

  /**
   * Decline team invite
   */
  async declineInvite(inviteId: string, userId: string): Promise<void> {
    // Get invite
    const { data: inviteData, error: inviteError } = await supabaseAdmin
      .from('team_invites')
      .select('*')
      .eq('id', inviteId)
      .single()

    if (inviteError || !inviteData) {
      throw new Error('Invite not found')
    }

    // Check if invite is still pending
    if (inviteData.status !== 'pending') {
      throw new Error('Invite already accepted or declined')
    }

    // Get user to verify email matches
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    // Compare emails case-insensitively
    if (userData.email.toLowerCase().trim() !== inviteData.email.toLowerCase().trim()) {
      throw new Error('Invite email does not match user email')
    }

    // Mark invite as expired (or delete it - we'll mark as expired to keep history)
    const { error: updateError } = await supabaseAdmin
      .from('team_invites')
      .update({ status: 'expired' })
      .eq('id', inviteId)

    if (updateError) {
      throw new Error('Failed to decline invite')
    }
  }

  /**
   * FR-014: Get Team Members
   */
  async getMembers(teamId: string): Promise<TeamMember[]> {
    const { data: membersData, error } = await supabaseAdmin
      .from('team_members')
      .select(`
        *,
        user:users(*)
      `)
      .eq('team_id', teamId)
      .order('joined_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch members')
    }

    return (membersData || []).map((m: any) => this.mapDbMemberToMember(m))
  }

  /**
   * FR-015: Remove Member
   */
  async removeMember(teamId: string, memberId: string, userId: string): Promise<void> {
    // Check permissions (owner/admin can remove, or user can leave)
    const member = await this.getMemberById(memberId)
    if (!member) {
      throw new Error('Member not found')
    }

    const isOwnerOrAdmin = await this.checkPermission(teamId, userId, ['OWNER', 'ADMIN'])
    const isSelf = member.userId === userId

    if (!isOwnerOrAdmin && !isSelf) {
      throw new Error('Insufficient permissions')
    }

    // Can't remove the team owner
    if (member.role === 'OWNER') {
      throw new Error('Cannot remove team owner')
    }

    const { error } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (error) {
      throw new Error('Failed to remove member')
    }

    // Log activity
    await this.logActivity(teamId, userId, {
      action: `removed ${member.user.name} from team`,
      targetType: 'member',
      targetId: memberId,
      targetName: member.user.name,
    })
  }

  /**
   * FR-018: Change Member Role
   */
  async changeMemberRole(teamId: string, memberId: string, newRole: 'OWNER' | 'ADMIN' | 'MEMBER', userId: string): Promise<TeamMember> {
    // Only owner can change roles
    const hasPermission = await this.checkPermission(teamId, userId, ['OWNER'])
    if (!hasPermission) {
      throw new Error('Only team owner can change roles')
    }

    // Get the member being changed
    const targetMember = await this.getMemberById(memberId)
    if (!targetMember) {
      throw new Error('Member not found')
    }

    // Cannot change OWNER to MEMBER directly - must transfer ownership first
    if (targetMember.role === 'OWNER' && newRole === 'MEMBER') {
      throw new Error('Cannot change OWNER to MEMBER. Transfer ownership to another member first.')
    }

    // Get all members to check OWNER count
    const allMembers = await this.getMembers(teamId)
    const ownerCount = allMembers.filter(m => m.role === 'OWNER').length

    // Handle OWNER transfer: original owner becomes ADMIN
    if (newRole === 'OWNER') {
      // Check if we're transferring to a different member
      if (targetMember.userId !== userId) {
        // Find current OWNER (the one making the change)
        const currentOwner = allMembers.find(m => m.userId === userId && m.role === 'OWNER')
        
        if (!currentOwner) {
          throw new Error('Current owner not found')
        }

        // Ensure we maintain at least 1 OWNER
        if (ownerCount === 1 && currentOwner.id === memberId) {
          throw new Error('Cannot remove the only OWNER. Transfer ownership to another member first.')
        }

        // Update current OWNER to ADMIN first
        await supabaseAdmin
          .from('team_members')
          .update({ role: 'ADMIN' })
          .eq('id', currentOwner.id)

        // Log activity for current owner role change
        await this.logActivity(teamId, userId, {
          action: `transferred ownership to ${targetMember.user.name}`,
          targetType: 'member',
          targetId: memberId,
          targetName: targetMember.user.name,
        })
      }
    } else {
      // When changing to ADMIN or MEMBER, ensure we don't remove the last OWNER
      if (targetMember.role === 'OWNER' && ownerCount === 1) {
        throw new Error('Cannot change the only OWNER. Transfer ownership to another member first.')
      }
    }

    // Update target member's role
    const { data: memberData, error } = await supabaseAdmin
      .from('team_members')
      .update({ role: newRole })
      .eq('id', memberId)
      .select(`
        *,
        user:users(*)
      `)
      .single()

    if (error || !memberData) {
      throw new Error('Failed to update role')
    }

    // Log activity
    const actionText = newRole === 'OWNER' 
      ? `transferred ownership to ${memberData.user.name}`
      : `changed ${memberData.user.name}'s role to ${newRole}`
    
    await this.logActivity(teamId, userId, {
      action: actionText,
      targetType: 'member',
      targetId: memberId,
      targetName: memberData.user.name,
    })

    return this.mapDbMemberToMember(memberData)
  }

  /**
   * FR-019: Get Team Activity Log
   */
  async getActivity(teamId: string, page: number = 1, limit: number = 20): Promise<{ activities: TeamActivity[]; total: number }> {
    const { data: activitiesData, error } = await supabaseAdmin
      .from('team_activity')
      .select(`
        *,
        user:users(*)
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      throw new Error('Failed to fetch activity')
    }

    // Get total count
    const { count } = await supabaseAdmin
      .from('team_activity')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)

    return {
      activities: (activitiesData || []).map((a: any) => this.mapDbActivityToActivity(a)),
      total: count || 0,
    }
  }

  /**
   * Helper: Check user permission in team
   */
  private async checkPermission(teamId: string, userId: string, allowedRoles: Array<'OWNER' | 'ADMIN' | 'MEMBER'>): Promise<boolean> {
    const { data: member, error } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (error || !member) {
      return false
    }

    return allowedRoles.includes(member.role)
  }

  /**
   * Helper: Get member by ID
   */
  private async getMemberById(memberId: string): Promise<TeamMember | null> {
    const { data: memberData, error } = await supabaseAdmin
      .from('team_members')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', memberId)
      .single()

    if (error || !memberData) {
      return null
    }

    return this.mapDbMemberToMember(memberData)
  }

  /**
   * Helper: Log activity
   */
  private async logActivity(teamId: string, userId: string, activity: {
    action: string
    targetType: 'member' | 'project' | 'team' | 'issue'
    targetId: string
    targetName: string
    metadata?: Record<string, unknown>
  }): Promise<void> {
    await supabaseAdmin.from('team_activity').insert({
      team_id: teamId,
      user_id: userId,
      action: activity.action,
      target_type: activity.targetType,
      target_id: activity.targetId,
      target_name: activity.targetName,
      metadata: activity.metadata || {},
    })
  }

  /**
   * Map database team to Team type
   */
  private mapDbTeamToTeam(dbTeam: any): Team {
    return {
      id: dbTeam.id,
      name: dbTeam.name,
      ownerId: dbTeam.owner_id,
      createdAt: dbTeam.created_at,
      updatedAt: dbTeam.updated_at,
      deletedAt: dbTeam.deleted_at || undefined,
    }
  }

  /**
   * Map database member to TeamMember type
   */
  private mapDbMemberToMember(dbMember: any): TeamMember {
    return {
      id: dbMember.id,
      teamId: dbMember.team_id,
      userId: dbMember.user_id,
      role: dbMember.role,
      joinedAt: dbMember.joined_at,
      user: {
        id: dbMember.user.id,
        name: dbMember.user.name,
        email: dbMember.user.email,
        avatar: dbMember.user.avatar,
        authProvider: dbMember.user.auth_provider,
        createdAt: dbMember.user.created_at,
        updatedAt: dbMember.user.updated_at,
      },
    }
  }

  /**
   * Map database invite to TeamInvite type
   */
  private mapDbInviteToInvite(dbInvite: any): TeamInvite {
    return {
      id: dbInvite.id,
      teamId: dbInvite.team_id,
      email: dbInvite.email,
      role: dbInvite.role,
      invitedBy: dbInvite.invited_by,
      expiresAt: dbInvite.expires_at,
      status: dbInvite.status,
      createdAt: dbInvite.created_at,
    }
  }

  /**
   * Map database activity to TeamActivity type
   */
  private mapDbActivityToActivity(dbActivity: any): TeamActivity {
    return {
      id: dbActivity.id,
      teamId: dbActivity.team_id,
      userId: dbActivity.user_id,
      action: dbActivity.action,
      targetType: dbActivity.target_type,
      targetId: dbActivity.target_id,
      targetName: dbActivity.target_name,
      metadata: dbActivity.metadata,
      createdAt: dbActivity.created_at,
      user: {
        id: dbActivity.user.id,
        name: dbActivity.user.name,
        email: dbActivity.user.email,
        avatar: dbActivity.user.avatar,
        authProvider: dbActivity.user.auth_provider,
        createdAt: dbActivity.user.created_at,
        updatedAt: dbActivity.user.updated_at,
      },
    }
  }
}

export const teamService = new TeamService()

