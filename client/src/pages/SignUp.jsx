import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AuthLayout } from '@/components/auth-layout'
import { BookOpen } from 'lucide-react'

const roles = [
  'Business Analyst',
  'Implementation Consultant',
  'System Developer',
  'Quality Assurance',
  'Other',
]

const courses = ['AWS Gen. AI', 'AWS Cloud Practitioner', 'AWS Certified Solution Architect']

export default function SignUp() {
  const [form, setForm] = useState({
    fullName: '',
    school: '',
    role: roles[0],
    roleOther: '',
    coursesInterested: [],
    coursesOther: [],
    interestedInCertification: true,
    email: '',
    password: '',
  })

  const [otherCourseInput, setOtherCourseInput] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function toggleCourse(c) {
    setForm((s) => {
      const arr = s.coursesInterested.includes(c)
        ? s.coursesInterested.filter((x) => x !== c)
        : [...s.coursesInterested, c]
      return { ...s, coursesInterested: arr }
    })
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)

    if (form.role !== 'Other') {
      form.roleOther = ''
    }

    try {
      const payload = { ...form }
      const res = await API.post('/auth/signup', payload)

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token)
        const me = await API.get('/auth/me')
        if (me.data.roleType === 'admin') {
          navigate('/admin')
        } else {
          navigate('/home')
        }
      } else {
        navigate('/home')
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      headline="Adventure start here"
      subline="Create an account to join our community."
      contentClassName="max-w-2xl"
    >
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl text-primary"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <BookOpen className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create trainee profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us a bit about your background and AWS learning goals.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              required
              placeholder="John Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label>School / Institution</Label>
            <Input
              required
              placeholder="Your school or university"
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.role === 'Other' && (
          <div className="space-y-2">
            <Label>Specify your role</Label>
            <Input
              placeholder="Please specify your role"
              value={form.roleOther}
              onChange={(e) => setForm({ ...form, roleOther: e.target.value })}
              className="h-10"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label className="font-semibold">Courses you&apos;re interested in</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((c) => (
              <label
                key={c}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent/50 has-[:checked]:bg-accent/50"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={form.coursesInterested.includes(c)}
                  onChange={() => toggleCourse(c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Other course (optional)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Azure Fundamentals"
              value={otherCourseInput}
              onChange={(e) => setOtherCourseInput(e.target.value)}
              className="h-10 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => {
                if (otherCourseInput.trim()) {
                  setForm((s) => ({
                    ...s,
                    coursesOther: [...s.coursesOther, otherCourseInput.trim()],
                  }))
                  setOtherCourseInput('')
                }
              }}
            >
              Add
            </Button>
          </div>
          {form.coursesOther.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.coursesOther.map((c, i) => (
                <Badge key={i} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="block font-semibold">Interested in certification?</Label>
          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="cert"
                className="h-4 w-4"
                checked={form.interestedInCertification === true}
                onChange={() => setForm({ ...form, interestedInCertification: true })}
              />
              Yes
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="cert"
                className="h-4 w-4"
                checked={form.interestedInCertification === false}
                onChange={() => setForm({ ...form, interestedInCertification: false })}
              />
              No
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Email address</Label>
            <Input
              required
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              required
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="h-10"
            />
          </div>
        </div>

        <Button type="submit" className="mt-2 h-10 w-full" disabled={loading}>
          {loading ? <span className="animate-pulse">Creating account...</span> : 'Create Account'}
        </Button>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
