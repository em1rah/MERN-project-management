import React, { useEffect, useState } from 'react'
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
import { Users, Search, Inbox, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZES = [5, 10, 20, 50]

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    API.get('/admin/users')
      .then((r) => {
        setUsers(r.data)
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }, [])

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
   

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 pl-9"
        />
        
      </div>
      

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
