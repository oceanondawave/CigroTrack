/**
 * Settings feature types
 */

export interface ProfileSettings {
  name: string
  email: string
  avatar?: string
  bio?: string
}

export interface AccountSettings {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface PreferencesSettings {
  theme?: "light" | "dark" | "system"
  notifications: {
    email: boolean
    push: boolean
    issueAssigned: boolean
    issueMentioned: boolean
    comments: boolean
  }
}

