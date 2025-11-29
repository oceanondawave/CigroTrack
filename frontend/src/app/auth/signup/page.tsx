"use client"

import { SignupForm } from "@/features/auth/components/signup-form"
import { GuestRoute } from "@/components/guest-route"

export default function SignupPage() {
  return (
    <GuestRoute>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <SignupForm />
      </div>
    </GuestRoute>
  )
}
