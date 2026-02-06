import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth-layout'
import { Mail, Lock, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import authIllustration from '@/assets/auth-illustration.png'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/auth/signin', { email, password })
      localStorage.setItem('token', res.data.token)
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }

      const me = await API.get('/auth/me')
      if (me.data.roleType === 'admin') {
        navigate('/admin')
      } else {
        navigate('/home')
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      headline="Adventure start here"
      subline="Sign in to access your trainee or admin dashboard."
      illustrationSrc={authIllustration}
      illustrationAlt="Sign in illustration"
      contentClassName="max-w-3xl"
    >
      <div className="flex flex-col items-center text-center">
        {/* Logo */}
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl text-primary"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <BookOpen className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Hello! Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign in with your login email and password.</p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Login email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              id="email"
              required
              type="email"
              placeholder="Enter your login email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <Input
              id="password"
              required
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Reset Password!
          </Link>
        </div>
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? <span className="animate-pulse">Signing in...</span> : 'Login'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Create Account
        </Link>
      </p>
    </AuthLayout>
  )
}
