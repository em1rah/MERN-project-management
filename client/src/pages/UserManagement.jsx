import React, { useEffect, useRef, useState } from 'react'
import API from '../api'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Inbox, Upload, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

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

  const fetchUsers = () =>
    API.get('/admin/users')
      .then((r) => setUsers(r.data))
      .catch((e) => console.error(e))

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
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
        </div>
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
              <Badge variant="secondary">Unique emails: {importResult.uniqueEmails}</Badge>
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
                  <TableHead className="px-5 py-4 text-sm font-medium">Role</TableHead>
                  <TableHead className="px-5 py-4 text-sm font-medium">School</TableHead>
                  <TableHead className="px-5 py-4 text-center text-sm font-medium">Certification Interest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="px-5 py-4 font-medium">{u.fullName}</TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge variant="secondary">{u.role}</Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-muted-foreground">{u.school || 'N/A'}</TableCell>
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 px-5 py-8 text-center">
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
    </div>
  )
}
