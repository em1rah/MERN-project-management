import React, { useEffect, useRef, useState } from 'react'
import API from '../api'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Inbox, Upload, AlertTriangle, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, Download, FileDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const PAGE_SIZES = [5, 10, 20, 50]

export default function UserManagement({ onImported }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const fileInputRef = useRef(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importError, setImportError] = useState('')
  const [viewUser, setViewUser] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editError, setEditError] = useState('')
  const [deleteUser, setDeleteUser] = useState(null)

  const parseListInput = (value) =>
    String(value || '')
      .split(/[;|,]/g)
      .map((s) => s.trim())
      .filter(Boolean)

  const exportCsv = () => {
    const headers = [
      'fullName',
      'email',
      'school',
      'coursesInterested',
      'interestedInCertification',
      'createdAt',
      'trainingAttended',
      'mobileNumber',
      'gradeTeach',
      'yearsExperience',
    ]
    const rows = filteredUsers.map((u) => [
      u.fullName || '',
      u.email || '',
      u.school || '',
      Array.isArray(u.coursesInterested) ? u.coursesInterested.join('; ') : '',
      u.interestedInCertification ? 'Yes' : 'No',
      u.createdAt ? new Date(u.createdAt).toLocaleString() : '',
      u.trainingAttended === true ? 'Yes' : u.trainingAttended === false ? 'No' : '',
      u.mobileNumber || '',
      u.gradeTeach || '',
      Number.isFinite(u.yearsExperience) ? u.yearsExperience : '',
    ])

    const escape = (val) => {
      const v = String(val ?? '')
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
    }
    const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPdf = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const rows = filteredUsers.map((u) => `
      <tr>
        <td>${u.fullName || ''}</td>
        <td>${u.email || ''}</td>
        <td>${u.school || ''}</td>
        <td>${Array.isArray(u.coursesInterested) ? u.coursesInterested.join('; ') : ''}</td>
        <td>${u.interestedInCertification ? 'Yes' : 'No'}</td>
        <td>${u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}</td>
        <td>${u.trainingAttended === true ? 'Yes' : u.trainingAttended === false ? 'No' : ''}</td>
        <td>${u.mobileNumber || ''}</td>
        <td>${u.gradeTeach || ''}</td>
        <td>${Number.isFinite(u.yearsExperience) ? u.yearsExperience : ''}</td>
      </tr>
    `).join('')

    win.document.write(`
      <html>
        <head>
          <title>Users Export</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 18px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; vertical-align: top; }
            th { background: #f5f5f5; }
            .meta { margin-bottom: 12px; font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h1>User Management Export</h1>
          <div class="meta">Rows: ${filteredUsers.length} • Generated: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>School</th>
                <th>Courses Interested</th>
                <th>Certification</th>
                <th>Created At</th>
                <th>Training Attended</th>
                <th>Mobile</th>
                <th>Grade Teach</th>
                <th>Years Exp</th>
              </tr>
            </thead>
            <tbody>
              ${rows || ''}
            </tbody>
          </table>
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  const fetchUsers = () =>
    API.get('/admin/users')
      .then((r) => setUsers(r.data))
      .catch((e) => console.error(e))

  const openEdit = (u) => {
    setEditError('')
    setEditUser(u)
    setEditForm({
      fullName: u.fullName || '',
      email: u.email || '',
      school: u.school || '',
      mobileNumber: u.mobileNumber || '',
      gradeTeach: u.gradeTeach || '',
      yearsExperience: Number.isFinite(u.yearsExperience) ? String(u.yearsExperience) : '',
      coursesInterested: Array.isArray(u.coursesInterested) ? u.coursesInterested.join(', ') : '',
      coursesOther: Array.isArray(u.coursesOther) ? u.coursesOther.join(', ') : '',
      interestedInCertification: u.interestedInCertification === true,
      trainingAttended: u.trainingAttended === true,
    })
  }

  const saveEdit = async () => {
    if (!editUser || !editForm) return
    setEditError('')
    try {
      const payload = {
        fullName: editForm.fullName,
        email: editForm.email,
        school: editForm.school,
        mobileNumber: editForm.mobileNumber,
        gradeTeach: editForm.gradeTeach,
        yearsExperience: editForm.yearsExperience,
        coursesInterested: parseListInput(editForm.coursesInterested),
        coursesOther: parseListInput(editForm.coursesOther),
        interestedInCertification: editForm.interestedInCertification,
        trainingAttended: editForm.trainingAttended,
      }
      await API.patch(`/admin/users/${editUser._id}`, payload)
      await fetchUsers()
      setEditUser(null)
      setEditForm(null)
    } catch (e) {
      setEditError(e.response?.data?.msg || 'Failed to update user')
    }
  }

  const confirmDelete = async () => {
    if (!deleteUser) return
    try {
      await API.delete(`/admin/users/${deleteUser._id}`)
      await fetchUsers()
      setDeleteUser(null)
    } catch (e) {
      console.error(e)
      setDeleteUser(null)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchUsers().finally(() => setLoading(false))
  }, [])

  async function importCsv(file) {
    if (!file) return
    setImportError('')
    setImportResult(null)
    setImporting(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await API.post('/admin/users/import-csv', fd)
      setImportResult(res.data)
      await fetchUsers()
      await onImported?.()
    } catch (e) {
      console.error(e)
      setImportError(e.response?.data?.msg || 'Failed to import CSV')
    } finally {
      setImporting(false)
      // allow re-selecting the same file
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mobileNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const paginatedUsers = filteredUsers.slice(start, start + pageSize)

  useEffect(() => {
    setPage(1)
  }, [searchTerm, pageSize])

  if (loading)
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-3 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-10">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportCsv}>
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPdf}>
                <FileDown className="mr-2 h-4 w-4" />
                Generate PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* <div className="flex flex-wrap items-center gap-3">
          <a
            href="/sample-users-import.csv"
            download
            className="text-sm font-medium text-primary hover:underline"
          >
            Download sample CSV
          </a>
          <input
            ref={fileInputRef}
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
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {importing ? 'Importing…' : 'Import CSV'}
          </Button>
        </div> */}
      </div>

      {importError && (
        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>{importError}</div>
          </CardContent>
        </Card>
      )}

      {importResult && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">Processed: {importResult.processedRows}</Badge>
              <Badge variant="secondary">Unique login emails: {importResult.uniqueEmails}</Badge>
              <Badge variant="secondary">Inserted: {importResult.upsertedCount}</Badge>
              <Badge variant="secondary">Matched: {importResult.matchedCount}</Badge>
              <Badge variant="secondary">Modified: {importResult.modifiedCount}</Badge>
              {importResult.errorCount ? (
                <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  Row errors: {importResult.errorCount}
                </Badge>
              ) : (
                <Badge variant="success">No row errors</Badge>
              )}
            </div>

            {Array.isArray(importResult.errors) && importResult.errors.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="mb-2 text-sm font-medium">Row errors (first 10)</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {importResult.errors.slice(0, 10).map((er, i) => (
                    <li key={`${er.rowNumber}-${i}`}>
                      Row {er.rowNumber}: {er.email ? `${er.email} — ` : ''}{er.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto px-4 pb-4 pt-4 sm:px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-5 py-4 text-sm font-medium">Full Name</TableHead>
                  <TableHead className="px-5 py-4 text-sm font-medium">Email</TableHead>
                  <TableHead className="px-5 py-4 text-sm font-medium">School</TableHead>
                  <TableHead className="px-5 py-4 text-sm font-medium">Training Attended</TableHead>
                  <TableHead className="px-5 py-4 text-sm font-medium">Mobile</TableHead>
                  <TableHead className="px-5 py-4 text-sm font-medium">Grade Teach</TableHead>
                  <TableHead className="px-5 py-4 text-sm font-medium">Years Exp</TableHead>
                  <TableHead className="px-5 py-4 text-center text-sm font-medium">Certification Interest</TableHead>
                  <TableHead className="px-5 py-4 text-center text-sm font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="px-5 py-4 font-medium">{u.fullName}</TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">{u.school || 'N/A'}</TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">
                        {u.trainingAttended === true ? 'Yes' : u.trainingAttended === false ? 'No' : 'N/A'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">{u.mobileNumber || 'N/A'}</TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">{u.gradeTeach || 'N/A'}</TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">
                        {Number.isFinite(u.yearsExperience) ? u.yearsExperience : 'N/A'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-center">
                        {u.interestedInCertification ? (
                          <Badge variant="success">Yes</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-500/15 dark:border-amber-400/40"
                          >
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            aria-label={`View ${u.fullName}`}
                            title="View"
                            onClick={() => setViewUser(u)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            aria-label={`Edit ${u.fullName}`}
                            title="Edit"
                            onClick={() => openEdit(u)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-rose-600 hover:text-rose-700"
                            aria-label={`Delete ${u.fullName}`}
                            title="Delete"
                            onClick={() => setDeleteUser(u)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-40 px-5 py-8 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Inbox className="h-10 w-10" />
                        <p>No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length > 0 && (
            <div className="flex flex-col gap-5 border-t border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {start + 1}–{Math.min(start + pageSize, filteredUsers.length)} of {filteredUsers.length}
                </p>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  aria-label="Rows per page"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="min-w-[100px] px-2 text-center text-sm text-muted-foreground">
                  Page {safePage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>Read-only profile information.</DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Full name</p>
                <p className="font-medium">{viewUser.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{viewUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">School</p>
                <p className="font-medium">{viewUser.school || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mobile</p>
                <p className="font-medium">{viewUser.mobileNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Grade teach</p>
                <p className="font-medium">{viewUser.gradeTeach || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Years experience</p>
                <p className="font-medium">
                  {Number.isFinite(viewUser.yearsExperience) ? viewUser.yearsExperience : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Training attended</p>
                <p className="font-medium">
                  {viewUser.trainingAttended === true ? 'Yes' : viewUser.trainingAttended === false ? 'No' : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Certification interest</p>
                <p className="font-medium">
                  {viewUser.interestedInCertification ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Courses interested</p>
                <p className="font-medium">
                  {Array.isArray(viewUser.coursesInterested) && viewUser.coursesInterested.length
                    ? viewUser.coursesInterested.join(', ')
                    : 'N/A'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Other courses</p>
                <p className="font-medium">
                  {Array.isArray(viewUser.coursesOther) && viewUser.coursesOther.length
                    ? viewUser.coursesOther.join(', ')
                    : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update trainee profile details.</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm((s) => ({ ...s, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Input
                  value={editForm.school}
                  onChange={(e) => setEditForm((s) => ({ ...s, school: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Mobile number</Label>
                <Input
                  value={editForm.mobileNumber}
                  onChange={(e) => setEditForm((s) => ({ ...s, mobileNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Grade teach</Label>
                <Input
                  value={editForm.gradeTeach}
                  onChange={(e) => setEditForm((s) => ({ ...s, gradeTeach: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Years experience</Label>
                <Input
                  value={editForm.yearsExperience}
                  onChange={(e) => setEditForm((s) => ({ ...s, yearsExperience: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Courses interested (comma separated)</Label>
                <Input
                  value={editForm.coursesInterested}
                  onChange={(e) => setEditForm((s) => ({ ...s, coursesInterested: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Other courses (comma separated)</Label>
                <Input
                  value={editForm.coursesOther}
                  onChange={(e) => setEditForm((s) => ({ ...s, coursesOther: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editForm.interestedInCertification}
                  onChange={(e) => setEditForm((s) => ({ ...s, interestedInCertification: e.target.checked }))}
                  className="h-4 w-4 rounded border-input"
                  id="cert"
                />
                <Label htmlFor="cert">Interested in certification</Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editForm.trainingAttended}
                  onChange={(e) => setEditForm((s) => ({ ...s, trainingAttended: e.target.checked }))}
                  className="h-4 w-4 rounded border-input"
                  id="training"
                />
                <Label htmlFor="training">Training attended</Label>
              </div>
            </div>
          )}
          {editError && <p className="text-sm text-rose-600">{editError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveEdit}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
