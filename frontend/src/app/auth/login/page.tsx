"use client"

import { LoginForm } from "@/features/auth/components/login-form"
import { GuestRoute } from "@/components/guest-route"

export default function LoginPage() {
  return (
    <GuestRoute>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <LoginForm />
      </div>
    </GuestRoute>
  )
}
