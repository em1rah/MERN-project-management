import React, { useEffect, useState } from 'react'
import API from '../api'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import UserManagement from './UserManagement'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ModeToggle } from '@/components/mode-toggle'
import { LogoutButton } from '@/components/logout-button'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserX,
  BookOpen,
  BarChart3,
  PieChart as PieChartIcon,
  Eye,
  X,
} from 'lucide-react'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [enrolledModal, setEnrolledModal] = useState({ open: false, courseName: null, users: [], loading: false })

  const openEnrolledModal = (courseName) => {
    setEnrolledModal({ open: true, courseName, users: [], loading: true })
    API.get('/admin/courses/enrolled', { params: { course: courseName } })
      .then((r) => setEnrolledModal((prev) => ({ ...prev, users: r.data || [], loading: false })))
      .catch(() => setEnrolledModal((prev) => ({ ...prev, users: [], loading: false })))
  }

  const closeEnrolledModal = () => setEnrolledModal({ open: false, courseName: null, users: [], loading: false })

  useEffect(() => {
    API.get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch((e) => console.error(e))
  }, [])

  if (!stats && activeTab === 'dashboard')
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )

  // Read theme-aware chart colors from CSS variables
  const getChartColor = (varName) => {
    if (typeof document === 'undefined') return '#86efac'
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#86efac'
  }
  const pieGreen = getChartColor('--chart-pie-interested')
  const pieRed = getChartColor('--chart-pie-not-interested')
  const barColors = [
    getChartColor('--chart-bar-1'),
    getChartColor('--chart-bar-2'),
    getChartColor('--chart-bar-3'),
    getChartColor('--chart-bar-4'),
    getChartColor('--chart-bar-5'),
  ]

  const interestedCount = stats?.cert.yes || 0
  const notInterestedCount = stats?.cert.no || 0

  const certData = {
    labels: ['Interested in certification', 'Not interested'],
    datasets: [
      {
        data: [interestedCount, notInterestedCount],
        backgroundColor: [pieGreen, pieRed],
        borderColor: [pieGreen, pieRed],
        borderWidth: 2,
        hoverOffset: 0,
        // Lift the first slice (Interested) – offset in pixels
        offset: [18, 0],
      },
    ],
  }

  const courses = stats?.courses || []
  const courseData = {
    labels: courses.map((c) => c._id),
    datasets: [
      {
        label: 'Trainees Enrolled',
        data: courses.map((c) => c.count),
        backgroundColor: courses.map((_, i) => barColors[i % barColors.length]),
        borderColor: courses.map((_, i) => barColors[i % barColors.length]),
        borderRadius: 6,
      },
    ],
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    layout: { padding: 20 },
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 12, weight: 500 },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart) => {
            const data = chart.data
            return (data.labels || []).map((label, i) => {
              const value = data.datasets?.[0]?.data?.[i] ?? 0
              const color = data.datasets?.[0]?.backgroundColor?.[i]
              return {
                text: `${label}: ${Math.round(Number(value))}`,
                fillStyle: color,
                strokeStyle: color,
                index: i,
              }
            })
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${Math.round(Number(ctx.raw))}`,
        },
      },
    },
    scales: {},
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Trainees: ${Math.round(Number(ctx.raw))}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { drawBorder: false },
        ticks: {
          stepSize: 1,
          callback: (value) => (Number.isInteger(value) ? value : ''),
        },
      },
      x: {
        grid: { display: false },
      },
    },
  }

  const statCards = [
    {
      key: 'total',
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      accent: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/10 text-primary',
      borderClass: 'border-primary/20',
    },
    {
      key: 'interested',
      label: 'Certification Interested',
      value: stats?.cert.yes || 0,
      icon: UserCheck,
      accent: 'from-emerald-500/20 to-emerald-500/5',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500/20',
    },
    {
      key: 'not-interested',
      label: 'Not Interested',
      value: stats?.cert.no || 0,
      icon: UserX,
      accent: 'from-rose-500/20 to-rose-500/5',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
      borderClass: 'border-rose-500/20',
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm">
            D
          </div>
          <h5 className="font-semibold text-foreground">Trainee Admin</h5>
          <p className="text-sm text-muted-foreground">Project Management</p>
        </div>

        <nav className="flex-1 space-y-0.5 p-4">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              activeTab === 'dashboard'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              activeTab === 'users'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Users className="h-4 w-4 shrink-0" />
            User Management
          </button>
        </nav>

        <div className="border-t border-border p-4">
          <LogoutButton variant="outline" showLabel className="w-full gap-2" />
        </div>
      </aside>

      {/* Main */}
      <div className="ml-64 flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <h1 className="truncate text-lg font-semibold">
            {activeTab === 'dashboard' ? 'Dashboard' : 'User Management'}
          </h1>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">
              <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                A
              </span>
              Admin
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' ? (
            <div className="space-y-8">
              {/* Overview / Hero */}
              <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-transparent to-primary/10 p-6 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Analytics overview</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Trainee enrollment, certification interest, and course distribution.
                    </p>
                  </div>
                  <Badge variant="secondary" className="w-fit px-3 py-1.5">
                    {stats?.totalUsers || 0} total trainees
                  </Badge>
                </div>
              </section>

              {/* Stat cards */}
              <section>
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Key metrics
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {statCards.map((s) => (
                    <Card
                      key={s.key}
                      className={cn(
                        'overflow-hidden border-l-4 transition-all hover:shadow-md',
                        s.borderClass
                      )}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {s.label}
                        </CardTitle>
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', s.iconBg)}>
                          <s.icon className="h-5 w-5" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Charts row */}
              <section>
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Charts
                </h3>
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Certification interest</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[260px] flex items-center justify-center">
                        <Pie data={certData} options={pieOptions} />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Courses distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[260px]">
                        <Bar data={courseData} options={barOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Course enrollment table */}
              <section>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Course enrollment
                </h3>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course name</TableHead>
                          <TableHead className="text-center">Trainees</TableHead>
                          <TableHead className="text-center">Enrolled</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats?.courses.map((c) => (
                          <TableRow key={c._id}>
                            <TableCell className="font-medium">{c._id}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">{c.count}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <button
                                type="button"
                                onClick={() => openEnrolledModal(c._id)}
                                className="inline-flex items-center justify-center rounded-lg border border-border bg-muted/50 p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                title="View enrolled users"
                                aria-label={`View users enrolled in ${c._id}`}
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
            </div>
          ) : (
            <UserManagement />
          )}
        </main>
      </div>

      {/* Enrolled users modal */}
      {enrolledModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enrolled-modal-title"
        >
          <Card className="w-full max-w-md max-h-[80vh] flex flex-col shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-4">
              <CardTitle id="enrolled-modal-title" className="text-base">
                Enrolled in {enrolledModal.courseName}
              </CardTitle>
              <button
                type="button"
                onClick={closeEnrolledModal}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-4">
              {enrolledModal.loading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm">Loading users...</p>
                </div>
              ) : enrolledModal.users.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No users enrolled in this course.</p>
              ) : (
                <ul className="space-y-2">
                  {enrolledModal.users.map((u) => (
                    <li
                      key={u._id || u.email}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <UserCheck className="h-4 w-4 shrink-0 text-primary" />
                      <span className="font-medium">{u.fullName}</span>
                      {u.email && <span className="text-muted-foreground">({u.email})</span>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
