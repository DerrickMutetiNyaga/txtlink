'use client'

import { PortalLayout } from '@/components/portal-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Webhook, Plus, Trash2, Copy, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  lastTriggeredAt?: string | Date | null
  createdAt: string | Date
  secret: string
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSenderIds, setHasSenderIds] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
  })
  const [creating, setCreating] = useState(false)

  // Available event types
  const availableEvents = [
    { value: 'sms.delivered', label: 'SMS Delivered' },
    { value: 'sms.failed', label: 'SMS Failed' },
    { value: 'sms.sent', label: 'SMS Sent' },
    { value: 'balance.low', label: 'Balance Low' },
    { value: 'campaign.completed', label: 'Campaign Completed' },
  ]

  // Fetch webhooks
  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await fetch('/api/user/webhooks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setWebhooks(data.webhooks || [])
          setHasSenderIds(data.hasSenderIds || false)
        }
      } catch (error) {
        console.error('Failed to fetch webhooks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWebhooks()
  }, [])

  const handleCreateWebhook = async () => {
    if (!formData.name.trim() || !formData.url.trim() || formData.events.length === 0) {
      alert('Please fill in all fields and select at least one event')
      return
    }

    setCreating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh list
        const listResponse = await fetch('/api/user/webhooks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (listResponse.ok) {
          const listData = await listResponse.json()
          setWebhooks(listData.webhooks || [])
          setHasSenderIds(listData.hasSenderIds || false)
        }
        setShowModal(false)
        setFormData({ name: '', url: '', events: [] })
        alert('Webhook created successfully!')
      } else {
        alert(data.error || 'Failed to create webhook')
      }
    } catch (error) {
      console.error('Failed to create webhook:', error)
      alert('Failed to create webhook')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook? This action cannot be undone.')) {
      return
    }

    setDeleting(id)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/user/webhooks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setWebhooks(webhooks.filter((w) => w.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete webhook')
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error)
      alert('Failed to delete webhook')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleEvent = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }))
  }

  const getTimeAgo = (date: string | Date | null | undefined) => {
    if (!date) return 'Never'
    const d = new Date(date)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
  }

  return (
    <PortalLayout activeSection="Webhooks">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[#1F2937] mb-2">Webhooks</h1>
            <p className="text-slate-600">Configure webhooks to receive real-time event notifications</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-[#059669] to-[#14B8A6] text-white hover:from-[#064E3B] hover:to-[#059669] shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowModal(true)}
            disabled={!hasSenderIds}
            title={!hasSenderIds ? 'You need at least one approved sender ID to create a webhook' : ''}
          >
            <Plus size={18} className="mr-2" /> Create Webhook
          </Button>
        </div>

        {/* Webhooks List */}
        {loading ? (
          <Card className="p-12 bg-white border border-slate-200 shadow-sm text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Loading webhooks...</p>
          </Card>
        ) : webhooks.length === 0 ? (
          <Card className="p-16 bg-white border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 mb-6">
                <Webhook size={48} className="text-teal-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Webhooks Yet</h3>
              {!hasSenderIds ? (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 w-full">
                    <p className="text-sm text-amber-800 font-medium mb-2">Sender ID Required</p>
                    <p className="text-sm text-amber-700">
                      You need at least one approved sender ID before you can create a webhook. Request a sender ID to get started.
                    </p>
                  </div>
                  <Link href="/app/sender-ids/request">
                    <Button className="bg-teal-600 text-white hover:bg-teal-700 px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all">
                      <Plus size={18} className="mr-2" />
                      Request Sender ID
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Create webhooks to receive real-time notifications about SMS delivery status, balance changes, and other events.
                  </p>
                  <Button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-[#059669] to-[#14B8A6] text-white hover:from-[#064E3B] hover:to-[#059669] px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Your First Webhook
                  </Button>
                </>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-6 bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#059669] to-[#14B8A6]">
                    <Webhook size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-slate-900">{webhook.name}</h3>
                      {webhook.status === 'active' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                          <CheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 font-mono">{webhook.url}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400"
                    onClick={() => {
                      navigator.clipboard.writeText(webhook.url)
                      // You could add a toast notification here
                    }}
                  >
                    <Copy size={16} className="mr-2" /> Copy URL
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-300 bg-white text-red-600 hover:bg-red-50 hover:border-red-400"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    disabled={deleting === webhook.id}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">EVENTS</p>
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map((event, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-[#064E3B] font-medium">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">LAST TRIGGERED</p>
                  <p className="text-sm text-slate-900">{getTimeAgo(webhook.lastTriggeredAt)}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400"
                  onClick={() => {
                    // Test webhook functionality could be added here
                    alert('Test webhook functionality coming soon!')
                  }}
                >
                  <ExternalLink size={16} className="mr-2" /> Test Webhook
                </Button>
              </div>
            </Card>
          ))}
          </div>
        )}

        {/* Create Webhook Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg p-8 bg-white border border-gray-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-teal-100 text-teal-600">
                  <Webhook size={24} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Create New Webhook</h3>
              </div>

              {!hasSenderIds && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                  <p className="text-sm font-semibold text-amber-900 mb-2">Sender ID Required</p>
                  <p className="text-sm text-amber-800 mb-3">
                    You must have at least one approved sender ID before creating a webhook.
                  </p>
                  <Link href="/app/sender-ids/request">
                    <Button className="w-full bg-amber-600 text-white hover:bg-amber-700 text-sm">
                      Request Sender ID
                    </Button>
                  </Link>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Webhook Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., SMS Delivery Status"
                    disabled={!hasSenderIds}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://api.example.com/webhooks/sms-status"
                    disabled={!hasSenderIds}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be a valid HTTPS URL</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Events</label>
                  <div className="space-y-2">
                    {availableEvents.map((event) => (
                      <label
                        key={event.value}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.events.includes(event.value)}
                          onChange={() => handleToggleEvent(event.value)}
                          disabled={!hasSenderIds}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 disabled:opacity-50"
                        />
                        <span className="text-sm text-gray-900">{event.label}</span>
                        <code className="ml-auto text-xs text-gray-500 font-mono">{event.value}</code>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  Your webhook will receive POST requests to the URL above when selected events occur. Make sure your endpoint is ready to receive webhook payloads.
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ name: '', url: '', events: [] })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#059669] to-[#14B8A6] text-white hover:from-[#064E3B] hover:to-[#059669] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleCreateWebhook}
                  disabled={creating || !hasSenderIds || !formData.name.trim() || !formData.url.trim() || formData.events.length === 0}
                >
                  {creating ? 'Creating...' : 'Create Webhook'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}

