'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  Download,
  RefreshCw,
  Filter,
  Phone,
  CreditCard,
  Calendar,
  FileText,
} from 'lucide-react'
import Link from 'next/link'

interface MpesaTransaction {
  _id: string
  transactionType: 'STK' | 'C2B'
  transactionId?: string
  checkoutRequestId?: string
  merchantRequestId?: string
  amount: number
  phoneNumber: string
  accountReference: string
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'timeout'
  responseCode?: string
  resultDesc?: string
  mpesaReceiptNumber?: string
  userId?: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function MpesaTransactionsPage() {
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    transactionType: '',
    phoneNumber: '',
    startDate: '',
    endDate: '',
    search: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  })

  // Ensure component is mounted before making API calls
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    fetchTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mounted,
    filters.status,
    filters.transactionType,
    filters.phoneNumber,
    filters.startDate,
    filters.endDate,
    filters.search,
    pagination.page,
  ])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      
      if (!token) {
        window.location.href = '/auth/login'
        return
      }
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filters.status) params.append('status', filters.status)
      if (filters.transactionType) params.append('transactionType', filters.transactionType)
      if (filters.phoneNumber) params.append('phoneNumber', filters.phoneNumber)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/super-admin/mpesa-transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          window.location.href = '/auth/login'
          return
        }
        throw new Error('Failed to fetch transactions')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setTransactions(result.data)
        if (result.pagination) {
          setPagination(result.pagination)
        }
      } else {
        console.error('Invalid response format:', result)
        setTransactions([])
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
      setError(error.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Type',
      'Amount (KES)',
      'Phone Number',
      'Account Reference',
      'Status',
      'Receipt Number',
      'User',
    ]

    const rows = transactions.map((t) => [
      new Date(t.createdAt).toLocaleString(),
      t.transactionType,
      t.amount?.toFixed(2) || '0.00',
      t.phoneNumber || '-',
      t.accountReference || '-',
      t.status || 'unknown',
      t.mpesaReceiptNumber || '-',
      t.userId && typeof t.userId === 'object' 
        ? `${t.userId.name || ''} (${t.userId.email || ''})`.trim() || '-'
        : '-',
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mpesa-transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      failed: 'bg-red-50 text-red-700 border-red-200',
      cancelled: 'bg-slate-50 text-slate-700 border-slate-200',
      timeout: 'bg-orange-50 text-orange-700 border-orange-200',
    }
    return (
      <Badge variant="outline" className={variants[status] || ''}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  if (!mounted) {
    return (
      <div className="p-6 lg:p-8 bg-[#F8FAFC] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#020617]">M-Pesa Transactions</h1>
            <p className="text-[#64748B] mt-1">View and manage all M-Pesa payment transactions</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-[#E5E7EB] text-[#020617]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={fetchTransactions}
              variant="outline"
              className="border-[#E5E7EB] text-[#020617]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white border-[#E5E7EB] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#64748B]" />
            <h2 className="text-lg font-semibold text-[#020617]">Filters</h2>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label className="text-sm font-medium text-[#020617] mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search..."
                  className="pl-10 border-[#E5E7EB] bg-white text-[#020617]"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-[#020617] mb-2 block">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="border-[#E5E7EB] bg-white text-[#020617]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="timeout">Timeout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-[#020617] mb-2 block">Type</Label>
              <Select
                value={filters.transactionType}
                onValueChange={(value) => setFilters({ ...filters, transactionType: value })}
              >
                <SelectTrigger className="border-[#E5E7EB] bg-white text-[#020617]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="STK">STK Push</SelectItem>
                  <SelectItem value="C2B">C2B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-[#020617] mb-2 block">Phone Number</Label>
              <Input
                value={filters.phoneNumber}
                onChange={(e) => setFilters({ ...filters, phoneNumber: e.target.value })}
                placeholder="254..."
                className="border-[#E5E7EB] bg-white text-[#020617]"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-[#020617] mb-2 block">Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="border-[#E5E7EB] bg-white text-[#020617]"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-[#020617] mb-2 block">End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="border-[#E5E7EB] bg-white text-[#020617]"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => {
                setFilters({
                  status: '',
                  transactionType: '',
                  phoneNumber: '',
                  startDate: '',
                  endDate: '',
                  search: '',
                })
                setPagination({ ...pagination, page: 1 })
              }}
              variant="outline"
              className="border-[#E5E7EB] text-[#020617]"
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-white border-[#E5E7EB] rounded-xl shadow-sm p-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button
                onClick={fetchTransactions}
                variant="outline"
                className="border-[#E5E7EB] text-[#020617]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Account Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="text-sm">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {transaction.transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          KSh {transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm">{transaction.phoneNumber}</TableCell>
                        <TableCell className="text-sm">{transaction.accountReference}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="text-sm">
                          {transaction.mpesaReceiptNumber || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.userId ? (
                            <div>
                              <div className="font-medium">
                                {typeof transaction.userId === 'object' 
                                  ? transaction.userId.name || transaction.userId.email || '-'
                                  : '-'}
                              </div>
                              {typeof transaction.userId === 'object' && transaction.userId.email && (
                                <div className="text-xs text-slate-500">{transaction.userId.email}</div>
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-slate-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} transactions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page >= pagination.pages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

