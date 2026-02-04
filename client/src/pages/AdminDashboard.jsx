import React, { useEffect, useRef, useState } from 'react'
import API from '../api'
import { Pie, Bar, Line } from 'react-chartjs-2'
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
  Filler,
} from 'chart.js'
import UserManagement from './UserManagement'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  TrendingUp,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Upload,
} from 'lucide-react'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [enrolledModal, setEnrolledModal] = useState({ open: false, courseName: null, users: [], loading: false })
  const importInputRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [importDetails, setImportDetails] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin-sidebar-collapsed') === '1'
    } catch {
      return false
    }
  })

  const openEnrolledModal = (courseName) => {
    setEnrolledModal({ open: true, courseName, users: [], loading: true })
    API.get('/admin/courses/enrolled', { params: { course: courseName } })
      .then((r) => setEnrolledModal((prev) => ({ ...prev, users: r.data || [], loading: false })))
      .catch(() => setEnrolledModal((prev) => ({ ...prev, users: [], loading: false })))
  }

  const closeEnrolledModal = () => setEnrolledModal({ open: false, courseName: null, users: [], loading: false })

  const fetchStats = () =>
    API.get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch((e) => console.error(e))

  const importCsv = async (file) => {
    if (!file) return
    setImportMsg('')
    setImportDetails(null)
    setImporting(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await API.post('/admin/users/import-csv', fd)
      setImportDetails(res.data || null)
      setImportMsg(
        `Imported: ${res.data?.upsertedCount ?? 0} inserted, ${res.data?.modifiedCount ?? 0} modified` +
          (res.data?.errorCount ? ` (${res.data.errorCount} row errors)` : ''),
      )
      await fetchStats()
    } catch (e) {
      console.error(e)
      const data = e.response?.data
      setImportDetails(data || null)
      setImportMsg(data?.msg || 'Failed to import CSV')
    } finally {
      setImporting(false)
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('admin-sidebar-collapsed', isSidebarCollapsed ? '1' : '0')
    } catch {
      // ignore storage errors (private mode, disabled storage, etc.)
    }
  }, [isSidebarCollapsed])

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
  const totalForCert = interestedCount + notInterestedCount
  const certRatePercent = totalForCert > 0 ? Math.round((interestedCount / totalForCert) * 100) : 0

  // Registrations over time (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const regOverTime = stats?.registrationsOverTime || []
  const regLabels = regOverTime.map(({ _id }) => `${monthNames[_id.month - 1]} ${_id.year}`)
  const regData = regOverTime.map(({ count }) => count)

  const coursesPerTrainee = stats?.coursesPerTrainee || []
  const cptOrder = ['0', '1', '2', '3+']
  const cptLabels = cptOrder.map((k) => (k === '3+' ? '3+' : `${k} course${k === '1' ? '' : 's'}`))
  const cptData = cptOrder.map((k) => coursesPerTrainee.find((x) => x._id === k)?.count ?? 0)

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
        offset: [52, 0],
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

  const cptBarOptions = {
    indexAxis: 'y',
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
      x: {
        beginAtZero: true,
        grid: { drawBorder: false },
        ticks: {
          stepSize: 1,
          callback: (value) => (Number.isInteger(value) ? value : ''),
        },
      },
      y: {
        grid: { display: false },
      },
    },
  }

  // Check dark mode and set line chart colors
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const lineBorderColor = isDarkMode ? '#818cf8' : '#6366f1' // indigo-400 for dark, indigo-500 for light
  const linePointColor = isDarkMode ? '#a5b4fc' : '#6366f1' // indigo-300 for dark, indigo-500 for light

  // Create a nice gradient for the line chart (theme-aware)
  const getLineGradient = () => {
    try {
      if (typeof document === 'undefined') {
        // Fallback color if document is not available
        return isDarkMode ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.1)'
      }
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return isDarkMode ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.1)'
      }
      
      const isDark = document.documentElement.classList.contains('dark')
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      
      if (isDark) {
        // Dark mode: brighter, more vibrant colors
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.25)') // indigo-400
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0.05)')
      } else {
        // Light mode: softer colors
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)') // indigo-500
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.03)')
      }
      return gradient
    } catch (error) {
      // Fallback to solid color if gradient creation fails
      return isDarkMode ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.1)'
    }
  }

  const lineChartData = {
    labels: regLabels,
    datasets: [
      {
        label: 'Registrations',
        data: regData,
        borderColor: lineBorderColor,
        backgroundColor: getLineGradient(),
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: linePointColor,
        pointBorderColor: isDarkMode ? '#1e293b' : '#ffffff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: isDarkMode ? '#c7d2fe' : '#818cf8',
        pointHoverBorderColor: isDarkMode ? '#1e293b' : '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.85)',
        padding: 12,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: lineBorderColor,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `Registrations: ${ctx.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { 
          drawBorder: false,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: { 
          stepSize: 1,
          color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        },
      },
    },
  }

  const cptChartData = {
    labels: cptLabels,
    datasets: [
      {
        label: 'Trainees',
        data: cptData,
        backgroundColor: barColors.slice(0, 4),
        borderRadius: 6,
      },
    ],
  }

  const statCards = [
    {
      key: 'total',
      label: 'Total Trainees',
      value: stats?.totalUsers || 0,
      icon: Users,
      accent: 'from-primary/20 to-primary/5',
      iconBg: 'bg-primary/10 text-primary',
      borderClass: 'border-primary/20',
    },
    {
      key: 'interested',
      label: 'Certification interested',
      value: stats?.cert.yes || 0,
      icon: UserCheck,
      accent: 'from-emerald-500/20 to-emerald-500/5',
      iconBg: 'bg-emerald-400/15 text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500/20',
    },
    {
      key: 'not-interested',
      label: 'Not interested',
      value: stats?.cert.no || 0,
      icon: UserX,
      accent: 'from-rose-500/20 to-rose-500/5',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
      borderClass: 'border-rose-500/20',
    },
     {
      key: 'cert-rate',
      label: 'Certification interest rate',
      value: `${certRatePercent}%`,
      icon: TrendingUp,
      accent: 'from-amber-500/20 to-amber-500/5',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-500/20',
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card shadow-sm transition-[width] duration-200',
          isSidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className={cn('border-b border-border', isSidebarCollapsed ? 'p-4' : 'p-6')}>
          <div className={cn('flex items-start', isSidebarCollapsed ? 'justify-center' : 'justify-between gap-4')}>
            <div className={cn(isSidebarCollapsed ? 'flex flex-col items-center' : '')}>
              <div
                className={cn(
                  'mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm',
                  isSidebarCollapsed ? 'mb-0' : ''
                )}
              >
                D
              </div>
              <div className={cn(isSidebarCollapsed ? 'hidden' : 'block')}>
                <h5 className="font-semibold text-foreground">Trainee Admin</h5>
                <p className="text-sm text-muted-foreground">Project Management</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((v) => !v)}
              className={cn(
                'inline-flex items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                isSidebarCollapsed ? 'mt-3 h-9 w-9' : 'h-9 w-9 shrink-0'
              )}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-4">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              'flex w-full items-center rounded-lg text-sm font-medium transition-colors',
              isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
              activeTab === 'dashboard'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            aria-label="Dashboard"
            title="Dashboard"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className={cn(isSidebarCollapsed ? 'hidden' : 'block')}>Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={cn(
              'flex w-full items-center rounded-lg text-sm font-medium transition-colors',
              isSidebarCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
              activeTab === 'users'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            aria-label="User Management"
            title="User Management"
          >
            <Users className="h-4 w-4 shrink-0" />
            <span className={cn(isSidebarCollapsed ? 'hidden' : 'block')}>User Management</span>
          </button>
        </nav>

        <div className="border-t border-border p-4">
          <LogoutButton
            variant="outline"
            showLabel={!isSidebarCollapsed}
            className={cn('w-full gap-2', isSidebarCollapsed ? 'justify-center px-2' : '')}
          />
        </div>
      </aside>

      {/* Main */}
      <div className={cn('flex flex-1 flex-col min-w-0 transition-[margin-left] duration-200', isSidebarCollapsed ? 'ml-20' : 'ml-64')}>
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
              {/* Hero */}
              <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/8 via-card to-primary/5 p-6 shadow-sm transition-shadow hover:shadow-md animate-in fade-in duration-500">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-inner">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Analytics overview</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Trainee enrollment, certification interest, and course distribution at a glance.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="w-fit px-4 py-2 text-sm font-medium">
                      {stats?.totalUsers || 0} total trainees
                    </Badge>
                   
                    <input
                      ref={importInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => importCsv(e.target.files?.[0])}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10"
                      disabled={importing}
                      onClick={() => importInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {importing ? 'Importing…' : 'Import CSV'}
                    </Button>
                  </div>
                </div>
                {!!importMsg && <p className="mt-4 text-sm text-muted-foreground">{importMsg}</p>}
                {!!importDetails && (
                  <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    <div className="font-medium text-foreground">Import details</div>
                    {!!importDetails.msg && <p className="mt-2">Message: {importDetails.msg}</p>}
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <div>Processed rows: {importDetails.processedRows ?? 'N/A'}</div>
                      <div>Unique login emails: {importDetails.uniqueEmails ?? 'N/A'}</div>
                      <div>Inserted: {importDetails.upsertedCount ?? 'N/A'}</div>
                      <div>Modified: {importDetails.modifiedCount ?? 'N/A'}</div>
                      <div>Matched: {importDetails.matchedCount ?? 'N/A'}</div>
                      <div>Error count: {importDetails.errorCount ?? 'N/A'}</div>
                    </div>
                    {Array.isArray(importDetails.errors) && importDetails.errors.length > 0 && (
                      <div className="mt-3 rounded-md border border-border bg-background/60 p-3">
                        <div className="mb-2 font-medium text-foreground">Row errors (first 10)</div>
                        <ul className="space-y-1">
                          {importDetails.errors.slice(0, 10).map((er, i) => (
                            <li key={`${er.rowNumber}-${i}`}>
                              Row {er.rowNumber}: {er.email ? `${er.email} — ` : ''}{er.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Key metrics – 4 cards */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '50ms' }}>
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Key metrics
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {statCards.map((s, i) => (
                    <Card
                      key={s.key}
                      className={cn(
                        'overflow-hidden border-l-4 transition-all hover:shadow-md hover:-translate-y-0.5',
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

              {/* Registrations over time */}
              {regLabels.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '100ms' }}>
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Registrations over time
                  </h3>
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    <CardContent className="pt-6">
                      <div className="h-[220px]">
                        <Line data={lineChartData} options={lineOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Charts row: Certification + Courses */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '150ms' }}>
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Certification & courses
                </h3>
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Certification interest</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center">
                        <Pie data={certData} options={pieOptions} />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
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

              {/* Courses per trainee */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '200ms' }}>
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Engagement
                </h3>
                <div className="grid gap-6 lg:grid-cols-1">
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">Courses per trainee</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[280px]">
                        <Bar data={cptChartData} options={cptBarOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Course enrollment table */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: '250ms' }}>
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
            <UserManagement onImported={fetchStats} />
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
