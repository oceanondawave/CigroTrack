/**
 * Permission checking utilities based on PRD requirements (FR-070)
 */

import type { TeamRole } from "@/types"

/**
 * Check if user can perform action on team
 */
export function canUpdateTeam(userRole: TeamRole): boolean {
  return userRole === "OWNER" || userRole === "ADMIN"
}

export function canDeleteTeam(userRole: TeamRole): boolean {
  return userRole === "OWNER"
}

export function canInviteMember(userRole: TeamRole): boolean {
  return userRole === "OWNER" || userRole === "ADMIN"
}

export function canKickMember(
  userRole: TeamRole,
  targetRole: TeamRole
): boolean {
  if (userRole === "OWNER") return true
  if (userRole === "ADMIN" && targetRole === "MEMBER") return true
  return false
}

export function canChangeRole(userRole: TeamRole): boolean {
  return userRole === "OWNER"
}

export function canLeaveTeam(userRole: TeamRole): boolean {
  return userRole === "ADMIN" || userRole === "MEMBER"
}

/**
 * Check if user can perform action on project
 */
export function canUpdateProject(
  userRole: TeamRole,
  isProjectOwner: boolean
): boolean {
  return userRole === "OWNER" || userRole === "ADMIN" || isProjectOwner
}

export function canDeleteProject(
  userRole: TeamRole,
  isProjectOwner: boolean
): boolean {
  return userRole === "OWNER" || userRole === "ADMIN" || isProjectOwner
}

export function canArchiveProject(
  userRole: TeamRole,
  isProjectOwner: boolean
): boolean {
  return userRole === "OWNER" || userRole === "ADMIN" || isProjectOwner
}

/**
 * Check if user can perform action on issue
 */
export function canDeleteIssue(
  userRole: TeamRole,
  isIssueOwner: boolean,
  isProjectOwner: boolean
): boolean {
  return (
    userRole === "OWNER" ||
    userRole === "ADMIN" ||
    isIssueOwner ||
    isProjectOwner
  )
}

/**
 * Check if user can delete comment
 */
export function canDeleteComment(
  userRole: TeamRole,
  isCommentAuthor: boolean,
  isIssueOwner: boolean,
  isProjectOwner: boolean
): boolean {
  return (
    userRole === "OWNER" ||
    userRole === "ADMIN" ||
    isCommentAuthor ||
    isIssueOwner ||
    isProjectOwner
  )
}

