import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AuthLayout } from '@/components/auth-layout'
import { BookOpen, Check, X } from 'lucide-react'

const courses = ['Generative AI - Prompting', 'Machine Learning', 'Cloud Foundations']

export default function SignUp() {
  const [form, setForm] = useState({
    fullName: '',
    school: '',
    coursesInterested: [],
    coursesOther: [],
    interestedInCertification: true,
    trainingAttended: false,
    mobileNumber: '',
    gradeTeach: [],
    yearsExperience: '',
    email: '',
    password: '',
  })

  const [otherCourseInput, setOtherCourseInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [showGrades, setShowGrades] = useState(false)
  const navigate = useNavigate()

  const gradeOptions = [
    'Pre-School',
    'Primary',
    'Secondary',
    'Tertiary',
  ]

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
      if (field === 'password') {
        const pw = v
        const checks = passwordChecks(pw)
        if (!Object.values(checks).every(Boolean)) next.password = 'Password does not meet all requirements'
        else delete next.password
      }
      if (field === 'mobileNumber') {
        const m = v.trim()
        if (m && m.length > 30) next.mobileNumber = 'Mobile number must be 30 characters or fewer'
        else delete next.mobileNumber
      }
      if (field === 'yearsExperience') {
        if (v === '') {
          delete next.yearsExperience
        } else if (!/^\d+$/.test(v)) {
          next.yearsExperience = 'Years experience must be a whole number'
        } else if (Number(v) > 80) {
          next.yearsExperience = 'Years experience must be 80 or fewer'
        } else {
          delete next.yearsExperience
        }
      }
      if (field === 'gradeTeach') {
        if (!Array.isArray(value) || value.length === 0) next.gradeTeach = 'Select at least one grade'
        else delete next.gradeTeach
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
    validateField('mobileNumber', form.mobileNumber)
    validateField('yearsExperience', form.yearsExperience)
    validateField('gradeTeach', form.gradeTeach)
    const pwChecks = passwordChecks(form.password || '')
    const hasPwOK = Object.values(pwChecks).every(Boolean)
    const hasErrors = Object.keys(errors).length > 0
    if (hasErrors || !hasPwOK) return

    setLoading(true)

    try {
      const payload = {
        ...form,
        gradeTeach: Array.isArray(form.gradeTeach) ? form.gradeTeach.join(', ') : '',
        yearsExperience: form.yearsExperience === '' ? undefined : Number(form.yearsExperience),
      }
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
                  const normalized = v.replace(/\s+/g, ' ')
                  if (!Array.isArray(s.coursesOther)) s.coursesOther = []
                  if (s.coursesOther.length >= 10) {
                    alert('You can add up to 10 other courses')
                    return s
                  }
                  return { ...s, coursesOther: [...s.coursesOther, normalized] }
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
            <Label>Mobile number</Label>
            <Input
              type="text"
              placeholder="e.g. 0917 123 4567"
              value={form.mobileNumber}
              onChange={(e) => setFieldValue('mobileNumber', e.target.value)}
              maxLength={30}
              className="h-10"
              aria-invalid={errors.mobileNumber ? 'true' : 'false'}
            />
            {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
          </div>
          <div className="space-y-2">
            <Label>Years of experience</Label>
            <Input
              type="number"
              min={0}
              max={80}
              placeholder="e.g. 5"
              value={form.yearsExperience}
              onChange={(e) => setFieldValue('yearsExperience', e.target.value)}
              className="h-10"
              aria-invalid={errors.yearsExperience ? 'true' : 'false'}
            />
            {errors.yearsExperience && <p className="mt-1 text-sm text-red-600">{errors.yearsExperience}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label className="block font-semibold">Grade teach</Label>
            <button
              type="button"
              onClick={() => setShowGrades((s) => !s)}
              className="text-sm font-medium text-primary hover:underline"
            >
              {showGrades ? 'Hide grades' : 'Show grades'}
            </button>
          </div>
          {showGrades && (
            <div className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {gradeOptions.map((g) => {
                const checked = form.gradeTeach.includes(g)
                return (
                  <label key={g} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? form.gradeTeach.filter((x) => x !== g)
                          : [...form.gradeTeach, g]
                        setFieldValue('gradeTeach', next)
                      }}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <span className="text-muted-foreground">{g}</span>
                  </label>
                )
              })}
            </div>
          )}
          {!showGrades && (
            <div className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
              {form.gradeTeach.length > 0 ? `${form.gradeTeach.length} selected` : 'No grades selected'}
            </div>
          )}
          {errors.gradeTeach && <p className="mt-1 text-sm text-red-600">{errors.gradeTeach}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Email address (login)</Label>
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
            {!errors.email && (
              <p className="mt-1 text-xs text-muted-foreground">
                This will be used to sign in to your account.
              </p>
            )}
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
