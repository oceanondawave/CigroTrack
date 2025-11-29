/**
 * Validation utilities based on PRD field limits
 */

import { FIELD_LIMITS } from "@/lib/constants"

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= FIELD_LIMITS.EMAIL.max
  },

  password: (password: string): boolean => {
    return (
      password.length >= FIELD_LIMITS.PASSWORD.min &&
      password.length <= FIELD_LIMITS.PASSWORD.max
    )
  },

  userName: (name: string): boolean => {
    return (
      name.length >= FIELD_LIMITS.USER_NAME.min &&
      name.length <= FIELD_LIMITS.USER_NAME.max
    )
  },

  teamName: (name: string): boolean => {
    return (
      name.length >= FIELD_LIMITS.TEAM_NAME.min &&
      name.length <= FIELD_LIMITS.TEAM_NAME.max
    )
  },

  projectName: (name: string): boolean => {
    return (
      name.length >= FIELD_LIMITS.PROJECT_NAME.min &&
      name.length <= FIELD_LIMITS.PROJECT_NAME.max
    )
  },

  projectDescription: (description: string): boolean => {
    return description.length <= FIELD_LIMITS.PROJECT_DESCRIPTION.max
  },

  issueTitle: (title: string): boolean => {
    return (
      title.length >= FIELD_LIMITS.ISSUE_TITLE.min &&
      title.length <= FIELD_LIMITS.ISSUE_TITLE.max
    )
  },

  issueDescription: (description: string): boolean => {
    return description.length <= FIELD_LIMITS.ISSUE_DESCRIPTION.max
  },

  subtaskTitle: (title: string): boolean => {
    return (
      title.length >= FIELD_LIMITS.SUBTASK_TITLE.min &&
      title.length <= FIELD_LIMITS.SUBTASK_TITLE.max
    )
  },

  labelName: (name: string): boolean => {
    return (
      name.length >= FIELD_LIMITS.LABEL_NAME.min &&
      name.length <= FIELD_LIMITS.LABEL_NAME.max
    )
  },

  customStatusName: (name: string): boolean => {
    return (
      name.length >= FIELD_LIMITS.CUSTOM_STATUS_NAME.min &&
      name.length <= FIELD_LIMITS.CUSTOM_STATUS_NAME.max
    )
  },

  commentContent: (content: string): boolean => {
    return (
      content.length >= FIELD_LIMITS.COMMENT_CONTENT.min &&
      content.length <= FIELD_LIMITS.COMMENT_CONTENT.max
    )
  },
}

export function validateField(
  field: keyof typeof validators,
  value: string
): { valid: boolean; error?: string } {
  const validator = validators[field]
  if (!validator) {
    return { valid: false, error: `Unknown field: ${field}` }
  }

  if (!validator(value)) {
    const limits = FIELD_LIMITS[field as keyof typeof FIELD_LIMITS]
    if (limits && "min" in limits && "max" in limits) {
      return {
        valid: false,
        error: `Must be between ${limits.min} and ${limits.max} characters`,
      }
    } else if (limits && "max" in limits) {
      return {
        valid: false,
        error: `Must be less than ${limits.max} characters`,
      }
    }
    return { valid: false, error: "Invalid value" }
  }

  return { valid: true }
}

