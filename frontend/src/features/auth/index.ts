/**
 * Auth feature exports
 * FR-001 to FR-007: Authentication features
 */

// Components
export { LoginForm } from "./components/login-form"
export { SignupForm } from "./components/signup-form"
export { ForgotPasswordForm } from "./components/forgot-password-form"
export { ResetPasswordForm } from "./components/reset-password-form"

// Hooks
export { useAuth } from "./hooks/use-auth"
export { useGoogleOAuth } from "./hooks/use-google-oauth"

// Services
export { authService } from "./services/auth-service"

// Types
export type {
  SignupData,
  LoginCredentials,
  AuthSession,
  PasswordResetRequest,
  PasswordResetData,
  ProfileUpdateData,
  PasswordChangeData,
  AccountDeletionData,
} from "./types"
