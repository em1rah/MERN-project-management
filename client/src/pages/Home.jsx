import React, { useEffect, useState } from 'react'
import API from '../api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/mode-toggle'
import { LogoutButton } from '@/components/logout-button'
import {
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  BookOpen,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    API.get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
  }, [])

  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-amber-500/20 p-3">
                <Sparkles className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Please sign in</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to view your profile and learning dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )

  const courseCount = user.coursesInterested?.length || 0
  const hasOtherCourses = user.coursesOther?.length > 0

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6">
          <h2 className="text-lg font-semibold tracking-tight">Trainee Project</h2>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <LogoutButton variant="outline" showLabel className="gap-2" />
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-8 sm:px-6">
        {/* Hero / Welcome */}
        <section className="mb-10 rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-primary/10 p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Welcome back</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {user.fullName}
              </h1>
              <p className="mt-2 max-w-lg text-muted-foreground">
                Here’s your learning profile and certification interest at a glance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={user.interestedInCertification ? 'success' : 'secondary'}
                className="text-sm px-3 py-1"
              >
                {user.interestedInCertification ? 'Certification interested' : 'No certification'}
              </Badge>
            </div>
          </div>
        </section>

        {/* Stats / Analytics row */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Your profile
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-l-4 border-l-primary/80 transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    School
                  </CardTitle>
                  <p className="truncate text-lg font-semibold text-foreground">{user.school}</p>
                </div>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-primary/80 transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Role
                  </CardTitle>
                  <p className="truncate text-lg font-semibold text-foreground">
                    {user.role}
                    {user.roleOther ? ` (${user.roleOther})` : ''}
                  </p>
                </div>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-primary/80 transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Courses
                  </CardTitle>
                  <p className="text-lg font-semibold text-foreground">
                    {courseCount} selected
                    {hasOtherCourses ? ` +${user.coursesOther.length} other` : ''}
                  </p>
                </div>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-primary/80 transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    user.interestedInCertification ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Award className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Certification
                  </CardTitle>
                  <p className="text-lg font-semibold text-foreground">
                    {user.interestedInCertification ? 'Interested' : 'Not interested'}
                  </p>
                </div>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Courses list card */}
        {(courseCount > 0 || hasOtherCourses) && (
          <section>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Your courses
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Enrolled interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.coursesInterested?.map((c) => (
                    <Badge key={c} variant="secondary" className="px-3 py-1.5">
                      {c}
                    </Badge>
                  ))}
                  {user.coursesOther?.map((c, i) => (
                    <Badge key={i} variant="outline" className="px-3 py-1.5">
                      {c}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  )
}
