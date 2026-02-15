'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Search,
  RefreshCw,
  MoreVertical,
  Radio,
  DollarSign,
  Ban,
  CheckCircle2,
  X,
  Plus,
  Minus,
  ArrowRight,
  XCircle,
  Circle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

interface Account {
  id: string
  name: string
  email: string
  phone?: string
  credits: number
  isActive: boolean
  hpUserLoginName?: string
  senderIds: Array<{
    id: string
    senderName: string
    status: string
    isDefault: boolean
  }>
  pricing: {
    mode: string
    pricePerSms?: number
    pricePerPart?: number
  } | null
  globalPricing: {
    mode: string
    pricePerSms?: number
    pricePerPart?: number
  } | null
}

export default function SuperAdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [senderIdDrawerOpen, setSenderIdDrawerOpen] = useState(false)
  const [pricingDrawerOpen, setPricingDrawerOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [allSenderIds, setAllSenderIds] = useState<any[]>([])
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
    fetchAllSenderIds()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const result = await response.json()
        setAccounts(result.accounts || [])
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSenderIds = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/senderids', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const result = await response.json()
        setAllSenderIds(result.senderIds || [])
      }
    } catch (error) {
      console.error('Error fetching sender IDs:', error)
    }
  }

  const handleAssignSenderId = async (senderId: string, senderName?: string) => {
    if (!selectedAccount) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/super-admin/accounts/${selectedAccount.id}/senderids/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(senderId ? { senderId } : { senderName }),
      })

      if (response.ok) {
        await fetchAccounts()
        await fetchAllSenderIds()
        alert('Sender ID assigned successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to assign sender ID')
      }
    } catch (error) {
      alert('Failed to assign sender ID')
    }
  }

  const handleUnassignSenderId = async (senderId: string) => {
    if (!selectedAccount) return
    if (!confirm('Are you sure you want to unassign this sender ID?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/super-admin/accounts/${selectedAccount.id}/senderids/unassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senderId }),
      })

      if (response.ok) {
        await fetchAccounts()
        alert('Sender ID unassigned successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to unassign sender ID')
      }
    } catch (error) {
      alert('Failed to unassign sender ID')
    }
  }

  const handleSetDefault = async (senderId: string) => {
    if (!selectedAccount) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/super-admin/accounts/${selectedAccount.id}/senderids/default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senderId }),
      })

      if (response.ok) {
        await fetchAccounts()
        alert('Default sender ID updated')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to set default')
      }
    } catch (error) {
      alert('Failed to set default')
    }
  }

  const handleTransfer = async (senderId: string, toUserId: string) => {
    if (!selectedAccount) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/senderids/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderId,
          fromUserId: selectedAccount.id,
          toUserId,
          makeDefault: false,
        }),
      })

      if (response.ok) {
        await fetchAccounts()
        setTransferDialogOpen(false)
        alert('Sender ID transferred successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to transfer sender ID')
      }
    } catch (error) {
      alert('Failed to transfer sender ID')
    }
  }

  const handleSuspend = async (accountId: string, currentIsActive: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/super-admin/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentIsActive }),
      })

      if (response.ok) {
        await fetchAccounts()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update status')
      }
    } catch (error) {
      alert('Failed to update status')
    }
  }

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? acc.isActive : !acc.isActive)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 lg:p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#020617]">Accounts & Tenants</h1>
            <p className="text-[#64748B] mt-1">Manage all customer accounts</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAccounts}
            className="border-[#E5E7EB] bg-white hover:bg-[#F8FAFC] text-[#020617]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters - White Card */}
        <Card className="p-4 border border-[#E5E7EB] rounded-xl shadow-sm bg-white">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#E5E7EB] bg-white text-[#020617] placeholder:text-[#64748B] focus:border-[#FACC15] focus:ring-[#FACC15]"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-full md:w-[180px] border-[#E5E7EB] bg-white text-[#020617]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E5E7EB]">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Accounts Table - Premium White Card */}
        <Card className="border border-[#E5E7EB] rounded-xl shadow-sm bg-white overflow-hidden">
          {loading ? (
            <div className="p-12">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-[#F1F5F9]" />
                ))}
              </div>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-[#64748B]" />
              <p className="text-[#64748B] mb-2">No accounts found</p>
              <p className="text-sm text-[#94A3B8]">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F1F5F9] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-[#020617] uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-[#020617] uppercase tracking-wider">
                      HP Username
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-[#020617] uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-[#020617] uppercase tracking-wider">
                      Sender IDs
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-[#020617] uppercase tracking-wider">
                      Pricing
                    </th>
                    <th className="text-center py-4 px-6 text-xs font-semibold text-[#020617] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-[#020617] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredAccounts.map((account) => (
                    <tr
                      key={account.id}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                      onMouseEnter={() => setHoveredRow(account.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center flex-shrink-0 border border-[#E5E7EB]">
                            <span className="text-sm font-semibold text-[#020617]">
                              {account.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-[#020617]">{account.name}</div>
                            <div className="text-sm text-[#64748B]">{account.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-sm text-[#64748B]">
                        {account.hpUserLoginName || '-'}
                      </td>
                      <td className="text-right py-5 px-6 font-medium text-[#020617]">
                        {account.credits.toLocaleString()} credits
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-wrap gap-2">
                          {account.senderIds.length > 0 ? (
                            account.senderIds.map((sid) => (
                              <Badge
                                key={sid.id}
                                variant="outline"
                                className={
                                  sid.isDefault
                                    ? 'bg-[#F1F5F9] text-[#020617] border-[#E5E7EB] font-medium'
                                    : sid.status === 'active'
                                    ? 'bg-white text-[#16A34A] border-[#16A34A]'
                                    : 'bg-white text-[#F59E0B] border-[#F59E0B]'
                                }
                              >
                                {sid.status === 'active' && !sid.isDefault && (
                                  <Circle className="w-2.5 h-2.5 mr-1.5 fill-[#16A34A] text-[#16A34A]" />
                                )}
                                {sid.senderName}
                                {sid.isDefault && (
                                  <Circle className="w-2.5 h-2.5 ml-1.5 fill-[#FACC15] text-[#FACC15]" />
                                )}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-[#94A3B8]">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {account.pricing ? (
                          <Badge variant="outline" className="bg-white text-[#020617] border-[#E5E7EB]">
                            <span className="text-[#FACC15] font-semibold mr-1">●</span>
                            Override: KSh {account.pricing.pricePerSms || account.pricing.pricePerPart}/
                            {account.pricing.mode === 'per_sms' ? 'SMS' : 'Part'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-[#F1F5F9] text-[#64748B] border-[#E5E7EB]">
                            Global
                          </Badge>
                        )}
                      </td>
                      <td className="text-center py-5 px-6">
                        {account.isActive ? (
                          <Badge variant="outline" className="bg-white border-[#16A34A] text-[#16A34A]">
                            <Circle className="w-2 h-2 mr-1.5 fill-[#16A34A]" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-white border-[#DC2626] text-[#DC2626]">
                            <Circle className="w-2 h-2 mr-1.5 fill-[#DC2626]" />
                            Suspended
                          </Badge>
                        )}
                      </td>
                      <td className="text-right py-5 px-6">
                        <div className={`flex items-center justify-end ${hoveredRow === account.id ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-[#64748B] hover:text-[#020617] hover:bg-[#F8FAFC]">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white border-[#E5E7EB] shadow-lg">
                              <DropdownMenuLabel className="text-[#020617] font-semibold">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-[#E5E7EB]" />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAccount(account)
                                  setSenderIdDrawerOpen(true)
                                }}
                                className="text-[#020617] hover:bg-[#F8FAFC] cursor-pointer"
                              >
                                <Radio className="w-4 h-4 mr-2 text-[#64748B]" />
                                Manage Sender IDs
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAccount(account)
                                  setPricingDrawerOpen(true)
                                }}
                                className="text-[#020617] hover:bg-[#F8FAFC] cursor-pointer"
                              >
                                <DollarSign className="w-4 h-4 mr-2 text-[#64748B]" />
                                Pricing Override
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#E5E7EB]" />
                              <DropdownMenuItem
                                onClick={() => handleSuspend(account.id, account.isActive)}
                                className={account.isActive ? 'text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer' : 'text-[#16A34A] hover:bg-[#F0FDF4] cursor-pointer'}
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                {account.isActive ? 'Suspend' : 'Unsuspend'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Sender ID Management Modal - Premium White */}
      <SenderIdDrawer
        account={selectedAccount}
        open={senderIdDrawerOpen}
        onOpenChange={setSenderIdDrawerOpen}
        onAssign={handleAssignSenderId}
        onUnassign={handleUnassignSenderId}
        onSetDefault={handleSetDefault}
        onTransfer={(senderId, toUserId) => {
          setTransferDialogOpen(true)
          ;(window as any).pendingTransfer = { senderId, toUserId, account: selectedAccount }
        }}
        allSenderIds={allSenderIds}
        onRefresh={fetchAccounts}
      />

      {/* Pricing Override Modal - Premium White */}
      <PricingDrawer
        account={selectedAccount}
        open={pricingDrawerOpen}
        onOpenChange={setPricingDrawerOpen}
        onSave={fetchAccounts}
      />

      {/* Transfer Dialog */}
      <TransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        accounts={accounts}
        onTransfer={handleTransfer}
      />
    </div>
  )
}

// Sender ID Management Modal - Premium White Design
function SenderIdDrawer({
  account,
  open,
  onOpenChange,
  onAssign,
  onUnassign,
  onSetDefault,
  onTransfer,
  allSenderIds,
  onRefresh,
}: {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssign: (senderId: string, senderName?: string) => void
  onUnassign: (senderId: string) => void
  onSetDefault: (senderId: string) => void
  onTransfer: (senderId: string, toUserId: string) => void
  allSenderIds: any[]
  onRefresh: () => void
}) {
  const [selectedSenderId, setSelectedSenderId] = useState('')
  const [manualSenderName, setManualSenderName] = useState('')
  const [useManual, setUseManual] = useState(false)

  if (!account) return null

  const availableSenderIds = allSenderIds.filter(
    (sid) => !account.senderIds.some((usid) => usid.id === sid.id || usid.senderName === sid.senderName)
  )

  const handleAssign = () => {
    if (useManual && manualSenderName.trim()) {
      onAssign('', manualSenderName.trim().toUpperCase())
      setManualSenderName('')
      setUseManual(false)
    } else if (selectedSenderId) {
      onAssign(selectedSenderId)
      setSelectedSenderId('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-[#E5E7EB] rounded-xl shadow-xl p-0 [&>button]:text-[#64748B] [&>button]:hover:text-[#020617]">
        <div className="bg-white rounded-xl">
          <DialogHeader className="border-l-4 border-yellow-400 pl-6 pr-12 pt-6 pb-4">
            <DialogTitle className="text-[#020617] text-xl font-bold">Manage Sender IDs</DialogTitle>
            <DialogDescription className="text-[#64748B] mt-1">{account.name}</DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
          {/* Current Sender IDs */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:p-5">
            <Label className="text-sm font-semibold text-[#020617] mb-3 block">Current Sender IDs</Label>
            {account.senderIds.length > 0 ? (
              <div className="space-y-2">
                {account.senderIds.map((sid) => (
                  <div
                    key={sid.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E5E7EB]"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={
                          sid.status === 'active'
                            ? 'bg-white text-[#16A34A] border-[#16A34A]'
                            : 'bg-white text-[#F59E0B] border-[#F59E0B]'
                        }
                      >
                        <Circle className={`w-2 h-2 mr-1.5 ${sid.status === 'active' ? 'fill-[#16A34A]' : 'fill-[#F59E0B]'}`} />
                        {sid.senderName}
                      </Badge>
                      {sid.isDefault && (
                        <Badge variant="outline" className="bg-white text-[#020617] border-[#E5E7EB] text-xs font-medium">
                          Default
                        </Badge>
                      )}
                      <span className="text-xs text-[#64748B] capitalize">{sid.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!sid.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSetDefault(sid.id)}
                          className="text-xs text-[#64748B] hover:text-[#020617] hover:bg-white"
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUnassign(sid.id)}
                        className="text-[#DC2626] hover:text-[#DC2626] hover:bg-[#FEF2F2] text-xs"
                      >
                        <Minus className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">No sender IDs assigned</p>
            )}
          </div>

          {/* Add Sender ID */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:p-5">
            <Label className="text-sm font-semibold text-[#020617] mb-3 block">Add Sender ID</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <Switch 
                  checked={useManual} 
                  onCheckedChange={setUseManual}
                  className="data-[state=checked]:bg-[#16A34A] data-[state=unchecked]:bg-slate-300 [&>span]:bg-white"
                />
                <Label className="text-sm text-[#64748B]">Enter sender name manually</Label>
              </div>

              {useManual ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter sender name (e.g., MYCOMPANY)"
                    value={manualSenderName}
                    onChange={(e) => setManualSenderName(e.target.value.toUpperCase())}
                    className="flex-1 border-[#E5E7EB] bg-white text-[#020617]"
                  />
                  <Button
                    onClick={handleAssign}
                    disabled={!manualSenderName.trim()}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select value={selectedSenderId} onValueChange={setSelectedSenderId}>
                    <SelectTrigger className="flex-1 border-[#E5E7EB] bg-white text-[#020617]">
                      <SelectValue placeholder="Select sender ID" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E7EB]">
                      {availableSenderIds.length > 0 ? (
                        availableSenderIds.map((sid) => (
                          <SelectItem key={sid.id || sid.senderName} value={sid.id || sid.senderName}>
                            {sid.senderName} ({sid.status})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No available sender IDs
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAssign}
                    disabled={!selectedSenderId}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-white rounded-b-xl">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Pricing Override Modal - Premium Enterprise Design
function PricingDrawer({
  account,
  open,
  onOpenChange,
  onSave,
}: {
  account: Account | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}) {
  const [mode, setMode] = useState<'per_sms' | 'per_part'>('per_sms')
  const [pricePerSms, setPricePerSms] = useState('')
  const [pricePerPart, setPricePerPart] = useState('')
  const [chargeFailed, setChargeFailed] = useState(false)
  const [refundOnFail, setRefundOnFail] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (account && open) {
      if (account.pricing) {
        setMode(account.pricing.mode as 'per_sms' | 'per_part')
        setPricePerSms(account.pricing.pricePerSms?.toString() || '')
        setPricePerPart(account.pricing.pricePerPart?.toString() || '')
      } else {
        setMode('per_sms')
        setPricePerSms('')
        setPricePerPart('')
      }
    }
  }, [account, open])

  const handleSave = async () => {
    if (!account) return

    const price = mode === 'per_sms' ? parseFloat(pricePerSms) : parseFloat(pricePerPart)
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price')
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/super-admin/accounts/${account.id}/pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mode,
          pricePerSms: mode === 'per_sms' ? price : undefined,
          pricePerPart: mode === 'per_part' ? price : undefined,
          chargeFailed,
          refundOnFail,
        }),
      })

      if (response.ok) {
        onSave()
        onOpenChange(false)
        alert('Pricing override saved')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save pricing')
      }
    } catch (error) {
      alert('Failed to save pricing')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!account || !account.pricing) return
    if (!confirm('Remove pricing override? User will use global pricing.')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/super-admin/accounts/${account.id}/pricing`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        onSave()
        onOpenChange(false)
        alert('Pricing override removed')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove pricing')
      }
    } catch (error) {
      alert('Failed to remove pricing')
    }
  }

  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-[#E5E7EB] rounded-xl shadow-xl p-0 [&>button]:text-[#64748B] [&>button]:hover:text-[#020617]">
        <div className="bg-white rounded-xl">
          <DialogHeader className="border-l-4 border-yellow-400 pl-6 pr-12 pt-6 pb-4">
            <DialogTitle className="text-[#020617] text-xl font-bold">Pricing Override</DialogTitle>
            <DialogDescription className="text-[#64748B] mt-1">{account.name}</DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
            {/* Global Pricing Info */}
            {account.globalPricing && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:p-5">
                <Label className="text-sm font-semibold text-[#020617] mb-2 block">Global Pricing</Label>
                <p className="text-sm text-[#64748B]">
                  {account.globalPricing.mode === 'per_sms'
                    ? `KSh ${account.globalPricing.pricePerSms} per SMS (Default)`
                    : `KSh ${account.globalPricing.pricePerPart} per part (Default)`}
                </p>
              </div>
            )}

            {/* Pricing Mode */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:p-5">
              <Label className="text-sm font-semibold text-[#020617] mb-3 block">Pricing Mode</Label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger className="border-[#E5E7EB] bg-white text-[#020617]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  <SelectItem value="per_sms">Per SMS (Simple)</SelectItem>
                  <SelectItem value="per_part">Per Part (Advanced)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Input */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:p-5">
              <Label className="text-sm font-semibold text-[#020617] mb-2 block">
                Custom Price ({mode === 'per_sms' ? 'KSh per SMS' : 'KSh per part'})
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={mode === 'per_sms' ? pricePerSms : pricePerPart}
                onChange={(e) => {
                  if (mode === 'per_sms') {
                    setPricePerSms(e.target.value)
                  } else {
                    setPricePerPart(e.target.value)
                  }
                }}
                placeholder="0.00"
                className="border-[#E5E7EB] bg-white text-[#020617]"
              />
            </div>

            {/* Billing Rules */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:p-5">
              <Label className="text-sm font-semibold text-[#020617] mb-3 block">Billing Rules</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#E5E7EB]">
                  <div>
                    <Label className="text-sm font-medium text-[#020617]">Charge for Failed Messages</Label>
                    <p className="text-xs text-[#64748B] mt-0.5">Charge user even if SMS delivery fails</p>
                  </div>
                  <Switch
                    checked={chargeFailed}
                    onCheckedChange={setChargeFailed}
                    className="data-[state=checked]:bg-[#16A34A] data-[state=unchecked]:bg-slate-300 [&>span]:bg-white"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#E5E7EB]">
                  <div>
                    <Label className="text-sm font-medium text-[#020617]">Auto-refund on Failure</Label>
                    <p className="text-xs text-[#64748B] mt-0.5">Automatically refund if SMS delivery fails</p>
                  </div>
                  <Switch
                    checked={refundOnFail}
                    onCheckedChange={setRefundOnFail}
                    className="data-[state=checked]:bg-[#16A34A] data-[state=unchecked]:bg-slate-300 [&>span]:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-white rounded-b-xl">
            {account.pricing && (
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-[#DC2626] border-[#DC2626] hover:bg-[#FEF2F2]"
              >
                Remove Override
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-medium"
            >
              {saving ? 'Saving...' : 'Save Pricing'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Transfer Dialog - Premium White
function TransferDialog({
  open,
  onOpenChange,
  accounts,
  onTransfer,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Account[]
  onTransfer: (senderId: string, toUserId: string) => void
}) {
  const [selectedSenderId, setSelectedSenderId] = useState('')
  const [selectedToUser, setSelectedToUser] = useState('')
  const [fromAccount, setFromAccount] = useState<Account | null>(null)

  useEffect(() => {
    const pending = (window as any).pendingTransfer
    if (pending && open) {
      setFromAccount(pending.account)
      setSelectedSenderId(pending.senderId)
      setSelectedToUser('')
      delete (window as any).pendingTransfer
    }
  }, [open])

  const handleTransfer = () => {
    if (!selectedSenderId || !selectedToUser || !fromAccount) return

    const senderName = fromAccount.senderIds.find((sid) => sid.id === selectedSenderId)?.senderName
    const toUserName = accounts.find((a) => a.id === selectedToUser)?.name

    if (
      confirm(
        `Transfer "${senderName}" from ${fromAccount.name} to ${toUserName}? This will remove it from the current user.`
      )
    ) {
      onTransfer(selectedSenderId, selectedToUser)
      setSelectedSenderId('')
      setSelectedToUser('')
      setFromAccount(null)
    }
  }

  const availableUsers = accounts.filter((a) => a.id !== fromAccount?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[#E5E7EB] rounded-xl shadow-xl p-0 [&>button]:text-[#64748B] [&>button]:hover:text-[#020617]">
        <div className="bg-white rounded-xl">
          <DialogHeader className="border-l-4 border-yellow-400 pl-6 pr-12 pt-6 pb-4">
            <DialogTitle className="text-[#020617] text-xl font-bold">Transfer Sender ID</DialogTitle>
            <DialogDescription className="text-[#64748B] mt-1">Move a sender ID from one user to another</DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-4">
            {fromAccount && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:p-5">
                <Label className="text-sm font-semibold text-[#020617] mb-2 block">From User</Label>
                <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                  <p className="font-medium text-[#020617]">{fromAccount.name}</p>
                  <p className="text-sm text-[#64748B]">{fromAccount.email}</p>
                </div>
              </div>
            )}

            {fromAccount && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:p-5">
                <Label className="text-sm font-semibold text-[#020617] mb-2 block">Sender ID</Label>
                <Select value={selectedSenderId} onValueChange={setSelectedSenderId}>
                  <SelectTrigger className="border-[#E5E7EB] bg-white text-[#020617]">
                    <SelectValue placeholder="Select sender ID" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E7EB]">
                    {fromAccount.senderIds.map((sid) => (
                      <SelectItem key={sid.id} value={sid.id}>
                        {sid.senderName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:p-5">
              <Label className="text-sm font-semibold text-[#020617] mb-2 block">To User</Label>
              <Select value={selectedToUser} onValueChange={setSelectedToUser}>
                <SelectTrigger className="border-[#E5E7EB] bg-white text-[#020617]">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-white rounded-b-xl">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!selectedSenderId || !selectedToUser}
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-medium"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Transfer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
