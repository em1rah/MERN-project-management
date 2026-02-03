import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ModeToggle, ThemePickerCompact } from '@/components/mode-toggle'
import { Sparkles, QrCode, Users, LineChart } from 'lucide-react'

const SIGNUP_QR_URL = 'https://mern-project-management-w5fj.onrender.com/signup'

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-primary/10">
      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <span className="text-lg font-bold">T</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight text-foreground">Trainee Project Management</p>
            <p className="text-xs text-muted-foreground">AWS learning cohorts & analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
            <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
              ●
            </span>
            Live trainee insights
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* Hero copy */}
          <section className="space-y-6">
            <Badge variant="secondary" className="border-primary/20 bg-primary/5 text-xs font-medium">
              <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">
                <Sparkles className="h-3 w-3" />
              </span>
              Designed for AWS trainee programs
            </Badge>

            <div className="space-y-4">
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Onboard trainees in seconds.
                <span className="block text-primary">Visualize progress in real time.</span>
              </h1>
              <p className="max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
                Share a single QR code in your classroom, collect trainee profiles instantly, and monitor AWS learning
                journeys with an opinionated, analytics‑ready dashboard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-11 rounded-lg px-6 text-sm font-semibold shadow-sm">
                <Link to="/signup">Create trainee account</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 rounded-lg px-6 text-sm font-semibold border-dashed"
              >
                <Link to="/signin">Admin / trainer sign in</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground sm:text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Capture roles, schools, and certification interest</span>
              </div>
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <span>See enrollment trends & course demand at a glance</span>
              </div>
            </div>

            <div className="mt-4 hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
              <span className="font-medium">Quick theme preview</span>
              <ThemePickerCompact />
            </div>
          </section>

          {/* QR card */}
          <section className="flex justify-center lg:justify-end">
            <Card className="relative w-full max-w-md border-primary/20 bg-card/90 shadow-xl backdrop-blur">
              <div className="pointer-events-none absolute -left-12 -top-10 hidden h-28 w-28 rounded-full bg-primary/20 blur-3xl lg:block" />
              <CardHeader className="space-y-2 pb-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200">
                  <QrCode className="h-3.5 w-3.5" />
                  Classroom‑ready signup QR
                </div>
                <CardTitle className="text-lg">Share this code with your trainees</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Ask trainees to scan the QR code on their phone to open the signup page. Once they submit, their
                  profile and course interests feed directly into your admin dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex justify-center">
                  <div className="rounded-2xl border border-dashed border-primary/40 bg-gradient-to-br from-background via-background to-primary/10 p-3 shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                        SIGNUP_QR_URL,
                      )}`}
                      alt="Signup QR code"
                      className="h-[220px] w-[220px] rounded-xl border border-border bg-white object-contain"
                    />
                  </div>
                </div>
                <div className="space-y-2 text-center text-xs text-muted-foreground sm:text-sm">
                  <p>
                    Or open directly:{' '}
                    <a
                      href={SIGNUP_QR_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      trainee signup link
                    </a>
                  </p>
                  <p>Best displayed on a projector or large screen at the beginning of your session.</p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}

