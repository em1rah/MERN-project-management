import React from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/components/auth-layout'

export default function ForgotPassword() {
  return (
    <AuthLayout
      headline="Reset password"
      subline="Request a password reset link to your email."
    >
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Password reset is not yet configured. Contact your administrator.
      </p>
      <p className="mt-4 text-center">
        <Link to="/signin" className="font-medium text-primary hover:underline">
          Back to Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
