'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DollarSign,
  Save,
  RefreshCw,
  Calculator,
  Globe,
  User,
  Info,
  Edit,
  Eye,
  Search,
  X,
  Plus,
  Calendar,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface PricingRule {
  _id?: string
  scope: 'global' | 'user'
  userId?: any
  mode: string
  pricePerPart?: number
  pricePerSms?: number
  gsm7Part1?: number
  gsm7PartN?: number
  ucs2Part1?: number
  ucs2PartN?: number
  chargeFailed?: boolean
  refundOnFail?: boolean
  updatedAt?: string
  createdAt?: string
}

interface Account {
  id: string
  name: string
  email: string
  senderIds: Array<{ id: string; senderName: string; status: string; isDefault: boolean }>
  pricing: {
    mode: string
    pricePerSms?: number
    pricePerPart?: number
  } | null
}

export default function SuperAdminPricing() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOverride, setFilterOverride] = useState<'all' | 'has_override' | 'using_global'>('all')
  const [dateRange, setDateRange] = useState('last_7_days')

  useEffect(() => {
    fetchData()
    // Create default global rule if none exists
    const createDefault = async () => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/pricing', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.rules.filter((r: PricingRule) => r.scope === 'global').length === 0) {
          // Create default
          await fetch('/api/super-admin/pricing/default', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
          fetchData()
        }
      }
    }
    createDefault()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Fetch pricing rules
      const rulesResponse = await fetch('/api/super-admin/pricing', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (rulesResponse.ok) {
        const rulesResult = await rulesResponse.json()
        setRules(rulesResult.rules || [])
      }

      // Fetch accounts
      const accountsResponse = await fetch('/api/super-admin/accounts', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (accountsResponse.ok) {
        const accountsResult = await accountsResponse.json()
        setAccounts(accountsResult.accounts || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editingRule) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingRule),
      })

      if (response.ok) {
        await fetchData()
        setEditingRule(null)
        alert('Pricing rule saved successfully')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save')
      }
    } catch (error) {
      alert('Failed to save pricing rule')
    }
  }

  const calculatePreview = async () => {
    if (!preview?.message) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/super-admin/pricing/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: preview.message,
          userId: preview.selectedAccountId || undefined,
          encoding: preview.encoding === 'auto' ? undefined : preview.encoding,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const calculation = result.calculation
        
        // Get the pricing rule to know price per part
        const rule = preview.selectedAccountId
          ? rules.find((r) => {
              const userId = typeof r.userId === 'object' ? r.userId._id?.toString() : r.userId?.toString()
              return r.scope === 'user' && userId === preview.selectedAccountId
            })
          : globalRule
        
        const pricePerPart = rule?.pricePerPart || (calculation.chargedKes / calculation.parts)
        
        setPreview({ 
          ...preview, 
          calculation: {
            ...calculation,
            pricePerPart,
          }
        })
      }
    } catch (error) {
      console.error('Preview calculation error:', error)
    }
  }

  const globalRule = rules.find((r) => r.scope === 'global')
  const userOverrides = rules.filter((r) => r.scope === 'user')
  
  // Calculate counts
  const accountsWithOverrides = accounts.filter((acc) => acc.pricing !== null).length
  const accountsUsingGlobal = accounts.length - accountsWithOverrides

  // Filter accounts for table
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter =
      filterOverride === 'all' ||
      (filterOverride === 'has_override' && acc.pricing !== null) ||
      (filterOverride === 'using_global' && acc.pricing === null)
    
    return matchesSearch && matchesFilter
  })

  // Get account details for override rules
  const getAccountForRule = (rule: PricingRule) => {
    if (rule.scope !== 'user' || !rule.userId) return null
    const userId = typeof rule.userId === 'object' ? rule.userId._id?.toString() : rule.userId.toString()
    return accounts.find((acc) => acc.id === userId)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#020617]">Pricing & Deductions Engine</h1>
            <p className="text-[#64748B] mt-1">Configure global pricing and account overrides</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px] bg-white border-[#E5E7EB] text-[#020617]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E5E7EB]">
                <SelectItem value="last_7_days">Last 7 days</SelectItem>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="last_90_days">Last 90 days</SelectItem>
                <SelectItem value="all_time">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={fetchData}
              className="bg-[#FACC15] hover:bg-[#EAB308] text-[#020617] font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Info Callout */}
        <Card className="bg-white border-[#E5E7EB] rounded-xl shadow-sm border-l-4 border-l-[#FACC15] p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#64748B] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#64748B]">
              <span className="font-medium text-[#020617]">Global rules apply to all accounts</span> unless an admin override exists. Accounts with overrides use their custom pricing instead of the global rule.
            </p>
          </div>
        </Card>

        {/* Two-Column Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Global Pricing Rule Card */}
          <Card className="bg-white border-[#E5E7EB] rounded-xl shadow-sm border-l-4 border-l-[#FACC15] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#64748B]" />
                <h2 className="text-xl font-semibold text-[#020617]">Global Pricing Rule</h2>
              </div>
              <Badge className="bg-[#FACC15] text-[#020617] border-0">Active</Badge>
            </div>

            {globalRule ? (
              <div className="space-y-6">
                {/* Pricing Breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                    <span className="text-sm text-[#64748B]">Mode</span>
                    <span className="text-sm font-medium text-[#020617] capitalize">{globalRule.mode?.replace('_', ' ')}</span>
                  </div>
                  {globalRule.mode === 'per_part' && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                        <span className="text-sm text-[#64748B]">Price per SMS segment</span>
                        <span className="text-sm font-medium text-[#020617]">
                          KSh {globalRule.pricePerPart || 0}
                        </span>
                      </div>
                      
                      {/* Pricing Breakdown */}
                      <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E5E7EB] space-y-4">
                        <p className="text-sm font-medium text-[#020617] mb-3">Pricing Breakdown</p>
                        
                        {/* GSM-7 */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-[#020617]">GSM-7 (standard text)</p>
                          <div className="space-y-1.5 pl-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#64748B]">First {globalRule.gsm7Part1 || 160} chars:</span>
                              <span className="font-medium text-[#020617]">KSh {globalRule.pricePerPart || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#64748B]">Each extra {globalRule.gsm7PartN || 153} chars:</span>
                              <span className="font-medium text-[#020617]">+KSh {globalRule.pricePerPart || 0}</span>
                            </div>
                            <p className="text-xs text-[#64748B] mt-2">
                              Example: 200 chars → 2 parts → KSh {((globalRule.pricePerPart || 0) * 2).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <Separator className="bg-[#E5E7EB]" />
                        
                        {/* UCS-2 */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-[#020617]">UCS-2 (unicode/emoji)</p>
                          <div className="space-y-1.5 pl-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#64748B]">First {globalRule.ucs2Part1 || 70} chars:</span>
                              <span className="font-medium text-[#020617]">KSh {globalRule.pricePerPart || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#64748B]">Each extra {globalRule.ucs2PartN || 67} chars:</span>
                              <span className="font-medium text-[#020617]">+KSh {globalRule.pricePerPart || 0}</span>
                            </div>
                            <p className="text-xs text-[#64748B] mt-2">
                              Example: 90 chars → 2 parts → KSh {((globalRule.pricePerPart || 0) * 2).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {globalRule.mode === 'per_sms' && (
                    <div className="flex justify-between items-center py-2 border-b border-[#E5E7EB]">
                      <span className="text-sm text-[#64748B]">Price per SMS</span>
                      <span className="text-sm font-medium text-[#020617]">
                        KSh {globalRule.pricePerSms || 0} per SMS
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="bg-[#E5E7EB]" />

                {/* Applies To Section */}
                <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E5E7EB]">
                  <p className="text-sm font-medium text-[#020617] mb-2">Applies to:</p>
                  <p className="text-sm text-[#64748B] mb-3">All accounts without overrides</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Covered by global:</span>
                      <span className="font-medium text-[#020617]">{accountsUsingGlobal} accounts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Overrides:</span>
                      <span className="font-medium text-[#020617]">{accountsWithOverrides} accounts</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setEditingRule({ ...globalRule, scope: 'global' })}
                    className="flex-1 bg-[#FACC15] hover:bg-[#EAB308] text-[#020617] font-medium"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Global Rule
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Impact
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-[#64748B] mb-4">No global rule configured</p>
                <Button
                  onClick={() => setEditingRule({ scope: 'global', mode: 'per_part', pricePerPart: 2.0 } as PricingRule)}
                  className="bg-[#FACC15] hover:bg-[#EAB308] text-[#020617] font-medium"
                >
                  Create Global Rule
                </Button>
              </div>
            )}
          </Card>

          {/* Pricing Calculator Card */}
          <Card className="bg-white border-[#E5E7EB] rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5 text-[#64748B]" />
              <h2 className="text-xl font-semibold text-[#020617]">Pricing Calculator</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-[#020617] mb-2 block">Test Message</Label>
                <Textarea
                  value={preview?.message || ''}
                  onChange={(e) => setPreview({ ...preview, message: e.target.value })}
                  className="w-full border-[#E5E7EB] bg-white text-[#020617] placeholder:text-[#64748B] focus:border-[#FACC15] focus:ring-[#FACC15]"
                  rows={4}
                  placeholder="Enter message to calculate pricing..."
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-[#020617] mb-2 block">Encoding</Label>
                <Select
                  value={preview?.encoding || 'auto'}
                  onValueChange={(value) => setPreview({ ...preview, encoding: value })}
                >
                  <SelectTrigger className="border-[#E5E7EB] bg-white text-[#020617]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E7EB]">
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="gsm7">GSM-7</SelectItem>
                    <SelectItem value="ucs2">UCS-2 (Unicode)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-[#020617] mb-2 block">Account (Optional)</Label>
                <Select
                  value={preview?.selectedAccountId || 'global'}
                  onValueChange={(value) => setPreview({ ...preview, selectedAccountId: value === 'global' ? undefined : value })}
                >
                  <SelectTrigger className="border-[#E5E7EB] bg-white text-[#020617]">
                    <SelectValue placeholder="Select account to test override" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E7EB]">
                    <SelectItem value="global">Global pricing</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({acc.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={calculatePreview}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate
              </Button>

              {preview?.calculation && (() => {
                const encoding = preview.calculation.encoding
                const parts = preview.calculation.parts
                const totalCost = preview.calculation.chargedKes
                const charCount = preview.message?.length || 0
                
                // Get the pricing rule to determine mode and pricing
                const rule = preview.selectedAccountId
                  ? rules.find((r) => {
                      const userId = typeof r.userId === 'object' ? r.userId._id?.toString() : r.userId?.toString()
                      return r.scope === 'user' && userId === preview.selectedAccountId
                    })
                  : globalRule
                
                const isPerPart = rule?.mode === 'per_part'
                const pricePerPart = rule?.pricePerPart || (isPerPart ? (totalCost / parts) : 0)
                const pricePerSms = rule?.pricePerSms || (!isPerPart ? totalCost : 0)
                
                // Get segment sizes based on encoding
                const firstSegmentSize = encoding === 'gsm7' ? (rule?.gsm7Part1 || 160) : (rule?.ucs2Part1 || 70)
                const extraSegmentSize = encoding === 'gsm7' ? (rule?.gsm7PartN || 153) : (rule?.ucs2PartN || 67)
                
                const firstSegmentCost = isPerPart ? pricePerPart : pricePerSms
                const extraSegments = parts > 1 ? parts - 1 : 0
                const extraSegmentsCost = isPerPart ? (extraSegments * pricePerPart) : 0
                
                return (
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium text-[#020617] mb-3">Result:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Encoding detected:</span>
                        <span className="font-medium text-[#020617]">{encoding.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Characters:</span>
                        <span className="font-medium text-[#020617]">{charCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Parts:</span>
                        <span className="font-medium text-[#020617]">{parts}</span>
                      </div>
                      
                      <Separator className="bg-[#E5E7EB] my-2" />
                      
                      {/* Cost Breakdown */}
                      {isPerPart ? (
                        <div className="space-y-1.5 bg-white rounded p-3 border border-[#E5E7EB]">
                          <p className="text-xs font-medium text-[#020617] mb-2">Cost Breakdown:</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#64748B]">First {firstSegmentSize} chars:</span>
                            <span className="font-medium text-[#020617]">KSh {firstSegmentCost.toFixed(2)}</span>
                          </div>
                          {extraSegments > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-[#64748B]">
                                {extraSegments} extra {extraSegmentSize}-char segment{extraSegments > 1 ? 's' : ''}:
                              </span>
                              <span className="font-medium text-[#020617]">KSh {extraSegmentsCost.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5 bg-white rounded p-3 border border-[#E5E7EB]">
                          <p className="text-xs font-medium text-[#020617] mb-2">Cost Breakdown:</p>
                          <div className="flex justify-between text-sm">
                            <span className="text-[#64748B]">Per SMS:</span>
                            <span className="font-medium text-[#020617]">KSh {pricePerSms.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                      
                      <Separator className="bg-[#E5E7EB] my-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B] font-medium">Total cost:</span>
                        <div className="text-right">
                          <span className="font-semibold text-lg text-[#020617]">
                            KSh {totalCost.toFixed(2)}
                          </span>
                          {preview.selectedAccountId && (
                            <Badge className="ml-2 bg-[#FACC15] text-[#020617] border-0 text-xs">
                              Override Applied
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </Card>
        </div>

        {/* User-Specific Overrides Section */}
        <Card className="bg-white border-[#E5E7EB] rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[#020617]">User-Specific Overrides</h2>
              <p className="text-sm text-[#64748B] mt-1">
                {userOverrides.length} override{userOverrides.length !== 1 ? 's' : ''} configured
              </p>
            </div>
            <Button
              onClick={() => {
                // Open create override dialog - for now just show message
                alert('Select an account from the table and use the Actions menu to create an override')
              }}
              className="bg-[#FACC15] hover:bg-[#EAB308] text-[#020617] font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Override
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <Input
                type="text"
                placeholder="Search by account name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#E5E7EB] bg-white text-[#020617] placeholder:text-[#64748B]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterOverride === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterOverride('all')}
                className={
                  filterOverride === 'all'
                    ? 'bg-[#FACC15] hover:bg-[#EAB308] text-[#020617]'
                    : 'bg-white border-[#E5E7EB] text-[#64748B] hover:bg-[#F8FAFC]'
                }
              >
                All
              </Button>
              <Button
                variant={filterOverride === 'has_override' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterOverride('has_override')}
                className={
                  filterOverride === 'has_override'
                    ? 'bg-[#FACC15] hover:bg-[#EAB308] text-[#020617]'
                    : 'bg-white border-[#E5E7EB] text-[#64748B] hover:bg-[#F8FAFC]'
                }
              >
                Has Overrides
              </Button>
              <Button
                variant={filterOverride === 'using_global' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterOverride('using_global')}
                className={
                  filterOverride === 'using_global'
                    ? 'bg-[#FACC15] hover:bg-[#EAB308] text-[#020617]'
                    : 'bg-white border-[#E5E7EB] text-[#64748B] hover:bg-[#F8FAFC]'
                }
              >
                Using Global
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-[#64748B] mx-auto mb-2" />
              <p className="text-sm text-[#64748B]">Loading...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-12 border border-[#E5E7EB] rounded-lg bg-[#F8FAFC]">
              <User className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
              <p className="text-[#64748B] font-medium mb-1">No overrides yet</p>
              <p className="text-sm text-[#64748B] mb-4">
                Global pricing is currently applied to all accounts.
              </p>
              <Button
                onClick={() => {
                  alert('Select an account from the table and use the Actions menu to create an override')
                }}
                className="bg-[#FACC15] hover:bg-[#EAB308] text-[#020617] font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Override
              </Button>
            </div>
          ) : (
            <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                    <TableHead className="text-[#020617] font-semibold">Account</TableHead>
                    <TableHead className="text-[#020617] font-semibold">Email</TableHead>
                    <TableHead className="text-[#020617] font-semibold">Sender IDs</TableHead>
                    <TableHead className="text-[#020617] font-semibold">Override Mode</TableHead>
                    <TableHead className="text-[#020617] font-semibold">Price</TableHead>
                    <TableHead className="text-[#020617] font-semibold">Updated</TableHead>
                    <TableHead className="text-[#020617] font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => {
                    const overrideRule = userOverrides.find((r) => {
                      const userId = typeof r.userId === 'object' ? r.userId._id?.toString() : r.userId?.toString()
                      return userId === account.id
                    })
                    
                    return (
                      <TableRow key={account.id} className="hover:bg-[#F8FAFC]">
                        <TableCell className="font-medium text-[#020617]">{account.name}</TableCell>
                        <TableCell className="text-[#64748B]">{account.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {account.senderIds.length > 0 ? (
                              account.senderIds.slice(0, 2).map((sid) => (
                                <Badge
                                  key={sid.id}
                                  variant="outline"
                                  className="bg-white text-[#64748B] border-[#E5E7EB] text-xs"
                                >
                                  {sid.senderName}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-[#94A3B8]">None</span>
                            )}
                            {account.senderIds.length > 2 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="outline" className="bg-white text-[#64748B] border-[#E5E7EB] text-xs">
                                      +{account.senderIds.length - 2}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {account.senderIds.slice(2).map((sid) => sid.senderName).join(', ')}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {account.pricing ? (
                            <Badge className="bg-[#FACC15] text-[#020617] border-0">
                              {account.pricing.mode === 'per_sms' ? 'Per SMS' : 'Per Part'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-[#F8FAFC] text-[#64748B] border-[#E5E7EB]">
                              Global
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {account.pricing ? (
                            <div className="space-y-0.5">
                              <span className="text-sm font-medium text-[#020617]">
                                KSh {account.pricing.pricePerSms || account.pricing.pricePerPart || 0}
                              </span>
                              {account.pricing.mode === 'per_part' && (
                                <p className="text-xs text-[#64748B]">
                                  per SMS segment
                                </p>
                              )}
                              {account.pricing.mode === 'per_sms' && (
                                <p className="text-xs text-[#64748B]">
                                  per SMS
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-[#64748B]">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[#64748B] text-sm">
                          {overrideRule?.updatedAt
                            ? new Date(overrideRule.updatedAt).toLocaleDateString()
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {account.pricing ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const rule = userOverrides.find((r) => {
                                    const userId = typeof r.userId === 'object' ? r.userId._id?.toString() : r.userId?.toString()
                                    return userId === account.id
                                  })
                                  if (rule) {
                                    setEditingRule(rule)
                                  }
                                }}
                                className="text-[#64748B] hover:text-[#020617] hover:bg-[#F8FAFC]"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingRule({
                                    scope: 'user',
                                    userId: account.id,
                                    mode: 'per_part',
                                    pricePerPart: globalRule?.pricePerPart || 2.0,
                                  } as PricingRule)
                                }}
                                className="text-[#64748B] hover:text-[#020617] hover:bg-[#F8FAFC]"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Edit Rule Modal */}
        {editingRule && (
          <Dialog open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
            <DialogContent className="max-w-2xl bg-white border-[#E5E7EB] rounded-xl shadow-xl">
              <DialogHeader className="border-l-4 border-l-[#FACC15] pl-6">
                <DialogTitle className="text-xl font-bold text-[#020617]">
                  {editingRule.scope === 'global' ? 'Edit Global Rule' : 'Edit User Override'}
                </DialogTitle>
                <DialogDescription className="text-[#64748B] mt-1">
                  {editingRule.scope === 'user' && getAccountForRule(editingRule)
                    ? `${getAccountForRule(editingRule)?.name} (${getAccountForRule(editingRule)?.email})`
                    : 'Configure pricing settings'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                <div>
                  <Label className="text-sm font-medium text-[#020617] mb-2 block">Pricing Mode</Label>
                  <Select
                    value={editingRule.mode || 'per_part'}
                    onValueChange={(value) => setEditingRule({ ...editingRule, mode: value })}
                  >
                    <SelectTrigger className="border-[#E5E7EB] bg-white text-[#020617]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E7EB]">
                      <SelectItem value="per_part">Per Part</SelectItem>
                      <SelectItem value="per_sms">Per SMS</SelectItem>
                      <SelectItem value="tiered">Tiered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editingRule.mode === 'per_part' && (
                  <div>
                    <Label className="text-sm font-medium text-[#020617] mb-2 block">Price per Part (KES)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingRule.pricePerPart || ''}
                      onChange={(e) =>
                        setEditingRule({ ...editingRule, pricePerPart: parseFloat(e.target.value) })
                      }
                      className="border-[#E5E7EB] bg-white text-[#020617]"
                    />
                  </div>
                )}

                {editingRule.mode === 'per_sms' && (
                  <div>
                    <Label className="text-sm font-medium text-[#020617] mb-2 block">Price per SMS (KES)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingRule.pricePerSms || ''}
                      onChange={(e) =>
                        setEditingRule({ ...editingRule, pricePerSms: parseFloat(e.target.value) })
                      }
                      className="border-[#E5E7EB] bg-white text-[#020617]"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-[#E5E7EB]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.chargeFailed || false}
                      onChange={(e) => setEditingRule({ ...editingRule, chargeFailed: e.target.checked })}
                      className="w-4 h-4 text-[#FACC15] border-[#E5E7EB] rounded focus:ring-[#FACC15]"
                    />
                    <span className="text-sm text-[#020617]">Charge for failed SMS</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.refundOnFail !== false}
                      onChange={(e) => setEditingRule({ ...editingRule, refundOnFail: e.target.checked })}
                      className="w-4 h-4 text-[#FACC15] border-[#E5E7EB] rounded focus:ring-[#FACC15]"
                    />
                    <span className="text-sm text-[#020617]">Refund on failure</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[#E5E7EB]">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-[#FACC15] hover:bg-[#EAB308] text-[#020617] font-medium"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Rule
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingRule(null)}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
