import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { AuthLayout } from '@/components/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, KeyRound, BookOpen } from 'lucide-react'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function handleRequestCode(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      await API.post('/auth/forgot-password', { email: email.trim() })
      setMessage('If an account exists for this email, you will receive a 6-digit code shortly. Check your inbox and enter it below.')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send reset code.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await API.post('/auth/reset-password', {
        email: email.trim(),
        code: code.trim(),
        newPassword,
      })
      setMessage('Password has been reset. You can sign in with your new password.')
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) {
    return (
      <AuthLayout
        headline="Password reset"
        subline="Your password has been updated successfully."
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl text-primary"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">All set</h2>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <Button asChild className="mt-6 w-full">
            <Link to="/signin">Sign in</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      headline="Reset password"
      subline={step === 1 ? 'Enter your email to receive a 6-digit reset code.' : 'Enter the code from your email and choose a new password.'}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl text-primary"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <BookOpen className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {step === 1 ? 'Forgot your password?' : 'Enter reset code'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === 1 ? 'We’ll send a code to your email.' : 'Check your inbox for the 6-digit code.'}
        </p>
      </div>

      {message && (
        <p className="mt-4 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === 1 && (
        <form onSubmit={handleRequestCode} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                id="email"
                required
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </div>
          <Button type="submit" className="h-10 w-full" disabled={loading}>
            {loading ? 'Sending code...' : 'Send reset code'}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-display">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                id="email-display"
                type="email"
                value={email}
                readOnly
                className="h-10 pl-9 bg-muted"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Reset code</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                id="code"
                required
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="h-10 pl-9 font-mono text-lg tracking-widest"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                id="new-password"
                required
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 pl-9"
                minLength={6}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                id="confirm-password"
                required
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 pl-9"
                minLength={6}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1"
              onClick={() => { setStep(1); setCode(''); setNewPassword(''); setConfirmPassword(''); setError(null); setMessage(null); }}
            >
              Back
            </Button>
            <Button type="submit" className="h-10 flex-1" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/signin" className="font-medium text-primary hover:underline">
          Back to Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
