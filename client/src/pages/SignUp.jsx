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
import { BookOpen, Check, X } from 'lucide-react'

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
  const [errors, setErrors] = useState({})
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const navigate = useNavigate()

  function toggleCourse(c) {
    setForm((s) => {
      const arr = s.coursesInterested.includes(c)
        ? s.coursesInterested.filter((x) => x !== c)
        : [...s.coursesInterested, c]
      return { ...s, coursesInterested: arr }
    })
  }

  function setFieldValue(field, value) {
    setForm((s) => ({ ...s, [field]: value }))
    validateField(field, value)
  }

  function validateField(field, value) {
    const v = (value || '').toString()
    setErrors((prev) => {
      const next = { ...prev }
      if (field === 'fullName') {
        const name = v.trim()
        if (!name) next.fullName = 'Full name is required'
        else if (name.length > 100) next.fullName = 'Full name must be 100 characters or fewer'
        else if (!/^[A-Za-z\s]+$/.test(name)) next.fullName = 'Full name may only contain letters and spaces'
        else delete next.fullName
      }
      if (field === 'school') {
        const s = v.trim()
        if (!s) next.school = 'School / Institution is required'
        else if (s.length > 100) next.school = 'School / Institution must be 100 characters or fewer'
        else delete next.school
      }
      if (field === 'email') {
        if (!/^\S+@\S+\.\S+$/.test(v)) next.email = 'Enter a valid email address'
        else delete next.email
      }
      if (field === 'roleOther') {
        if (form.role === 'Other') {
          const r = v.trim()
          if (!r) next.roleOther = 'Please specify your role'
          else if (r.length > 50) next.roleOther = 'Role description must be 50 characters or fewer'
          else delete next.roleOther
        } else {
          delete next.roleOther
        }
      }
      if (field === 'password') {
        const pw = v
        const checks = passwordChecks(pw)
        if (!Object.values(checks).every(Boolean)) next.password = 'Password does not meet all requirements'
        else delete next.password
      }
      return next
    })
  }

  function passwordChecks(pw) {
    return {
      minLength: pw.length >= 8,
      maxLength: pw.length <= 128,
      hasLower: /[a-z]/.test(pw),
      hasUpper: /[A-Z]/.test(pw),
      hasDigit: /\d/.test(pw),
      hasSymbol: /[^A-Za-z0-9]/.test(pw),
    }
  }

  async function submit(e) {
    e.preventDefault()
    // Client-side validation
    // validate all fields before submit
    validateField('fullName', form.fullName)
    validateField('school', form.school)
    validateField('email', form.email)
    validateField('password', form.password)
    validateField('roleOther', form.roleOther)
    const pwChecks = passwordChecks(form.password || '')
    const hasPwOK = Object.values(pwChecks).every(Boolean)
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors || !hasPwOK) return

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

  // legacy validateForm removed; validation is live via setFieldValue/validateField

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
              onChange={(e) => setFieldValue('fullName', e.target.value)}
              maxLength={100}
              className="h-10"
              aria-invalid={errors.fullName ? 'true' : 'false'}
            />
            <div className="flex justify-between text-xs">
              {errors.fullName && <p className="text-red-600">{errors.fullName}</p>}
              <p className={form.fullName.length > 80 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
                {form.fullName.length}/100
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>School / Institution</Label>
            <Input
              required
              placeholder="Your school or university"
              value={form.school}
              onChange={(e) => setFieldValue('school', e.target.value)}
              maxLength={100}
              className="h-10"
              aria-invalid={errors.school ? 'true' : 'false'}
            />
            <div className="flex justify-between text-xs">
              {errors.school && <p className="text-red-600">{errors.school}</p>}
              <p className={form.school.length > 80 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
                {form.school.length}/100
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={form.role}
            onValueChange={(value) => {
              setForm((s) => ({ ...s, role: value }))
              // validate roleOther when role changes
              if (value !== 'Other') setErrors((p) => { const n = { ...p }; delete n.roleOther; return n })
              else validateField('roleOther', form.roleOther)
            }}
          >
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
              onChange={(e) => setFieldValue('roleOther', e.target.value)}
              maxLength={50}
              className="h-10"
              aria-invalid={errors.roleOther ? 'true' : 'false'}
            />
            <div className="flex justify-between text-xs">
              {errors.roleOther && <p className="text-red-600">{errors.roleOther}</p>}
              <p className={form.roleOther.length > 40 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
                {form.roleOther.length}/50
              </p>
            </div>
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
              maxLength={100}
              className="h-10 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => {
                const v = otherCourseInput.trim()
                if (!v) return
                if (v.length > 100) {
                  alert('Other course name must be 100 characters or fewer')
                  return
                }
                setForm((s) => {
                  if (!Array.isArray(s.coursesOther)) s.coursesOther = []
                  if (s.coursesOther.length >= 10) {
                    alert('You can add up to 10 other courses')
                    return s
                  }
                  return { ...s, coursesOther: [...s.coursesOther, v] }
                })
                setOtherCourseInput('')
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
              onChange={(e) => setFieldValue('email', e.target.value)}
              maxLength={254}
              className="h-10"
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              required
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setFieldValue('password', e.target.value)}
              maxLength={128}
              className="h-10"
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            <button
              type="button"
              onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
              className="text-sm text-primary hover:underline"
            >
              {showPasswordRequirements ? 'Hide password requirements' : 'Show password requirements'}
            </button>

            {showPasswordRequirements && (
              <div className="mt-2 grid gap-1 text-sm">
                {Object.entries({
                  'At least 8 characters': 'minLength',
                  'No more than 128 characters': 'maxLength',
                  'One lowercase letter': 'hasLower',
                  'One uppercase letter': 'hasUpper',
                  'One number': 'hasDigit',
                  'One symbol (e.g. !@#$)': 'hasSymbol',
                }).map(([label, key]) => {
                  const ok = passwordChecks(form.password || '')[key]
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className={ok ? 'text-green-600' : 'text-red-600'}>
                        {ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      </span>
                      <span className={ok ? 'text-green-700' : 'text-red-700'}>{label}</span>
                    </div>
                  )
                })}
              </div>
            )}
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
