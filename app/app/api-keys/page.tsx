'use client'

import { PortalLayout } from '@/components/portal-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Copy, Trash2, RefreshCw, Plus, Key, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  type: 'live' | 'test'
  status: 'active' | 'revoked'
  createdAt: string | Date
  lastUsedAt?: string | Date | null
}

export default function APIKeysPage() {
  const [showModal, setShowModal] = useState(false)
  const [newKeyVisible, setNewKeyVisible] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyType, setNewKeyType] = useState<'live' | 'test'>('live')
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSenderIds, setHasSenderIds] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  // Fetch API keys
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const response = await fetch('/api/user/api-keys', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setApiKeys(data.apiKeys || [])
          setHasSenderIds(data.hasSenderIds || false)
        }
      } catch (error) {
        console.error('Failed to fetch API keys:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApiKeys()
  }, [])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisibleKeys(newVisible)
  }

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a key name')
      return
    }

    setCreating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newKeyName,
          type: newKeyType,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewKey(data.apiKey.key)
        setNewKeyVisible(true)
        setShowModal(false)
        setNewKeyName('')
        // Refresh the list
        const listResponse = await fetch('/api/user/api-keys', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (listResponse.ok) {
          const listData = await listResponse.json()
          setApiKeys(listData.apiKeys || [])
          setHasSenderIds(listData.hasSenderIds || false)
        }
      } else {
        alert(data.error || 'Failed to generate API key')
      }
    } catch (error) {
      console.error('Failed to generate API key:', error)
      alert('Failed to generate API key')
    } finally {
      setCreating(false)
    }
  }

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return
    }

    setRevoking(id)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/user/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from list
        setApiKeys(apiKeys.filter((key) => key.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to revoke API key')
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error)
      alert('Failed to revoke API key')
    } finally {
      setRevoking(null)
    }
  }

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'Never'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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

  const getKeyPreview = (keyPrefix: string, id: string) => {
    // Since we only store the prefix, we can't show the full key
    // Show prefix + masked part
    return `${keyPrefix}...${id.substring(0, 8)}`
  }

  return (
    <PortalLayout activeSection="API Keys">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">API Keys</h1>
            <p className="text-gray-600">Manage your API credentials for authentication</p>
          </div>
          <Button 
            className="bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowModal(true)}
            disabled={!hasSenderIds}
            title={!hasSenderIds ? 'You need at least one approved sender ID to generate an API key' : ''}
          >
            <Plus size={18} className="mr-2" /> Generate New Key
          </Button>
        </div>

        {/* Keys Table */}
        {loading ? (
          <Card className="p-12 bg-white border border-gray-100 shadow-sm text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Loading API keys...</p>
          </Card>
        ) : apiKeys.length > 0 ? (
          <Card className="p-6 bg-white border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-gray-600 font-semibold text-xs uppercase">
                  <th className="pb-4">Name</th>
                  <th className="pb-4">Key Preview</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Created</th>
                  <th className="pb-4">Last Used</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 font-semibold text-gray-900">{key.name}</td>
                    <td className="py-4">
                      <code className="font-mono text-xs text-gray-600">
                        {getKeyPreview(key.keyPrefix, key.id)}
                      </code>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        key.type === 'live' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {key.type === 'live' ? 'Live' : 'Test'}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600">{formatDate(key.createdAt)}</td>
                    <td className="py-4 text-gray-600">{getTimeAgo(key.lastUsedAt)}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        {key.status === 'active' ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="py-4 flex gap-2">
                      <button
                        onClick={() => handleCopy(getKeyPreview(key.keyPrefix, key.id))}
                        className="p-2 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition"
                        title="Copy key preview"
                      >
                        <Copy size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        disabled={revoking === key.id}
                        className="p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Revoke key"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card className="p-16 bg-white border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 mb-6">
                <Key size={48} className="text-teal-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No API Keys Yet</h3>
              {!hasSenderIds ? (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 w-full">
                    <p className="text-sm text-amber-800 font-medium mb-2">Sender ID Required</p>
                    <p className="text-sm text-amber-700">
                      You need at least one approved sender ID before you can generate an API key. Request a sender ID to get started.
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
                    Generate your first API key to start integrating with SignalHub. Use API keys to authenticate your requests and send SMS programmatically.
                  </p>
                  <Button
                    onClick={() => setShowModal(true)}
                    className="bg-teal-600 text-white hover:bg-teal-700 px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Plus size={18} className="mr-2" />
                    Generate Your First API Key
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}

        {/* New Key Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-teal-100 text-teal-600">
                  <Key size={24} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Generate New API Key</h3>
              </div>

              {!hasSenderIds && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                  <p className="text-sm font-semibold text-amber-900 mb-2">Sender ID Required</p>
                  <p className="text-sm text-amber-800 mb-3">
                    You must have at least one approved sender ID before generating an API key.
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API Key"
                    disabled={!hasSenderIds}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Key Type</label>
                  <select
                    value={newKeyType}
                    onChange={(e) => setNewKeyType(e.target.value as 'live' | 'test')}
                    disabled={!hasSenderIds}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <option value="live">Live (Production)</option>
                    <option value="test">Test (Development)</option>
                  </select>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  After generation, you won't be able to see this key again. Store it securely.
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleGenerateKey}
                  disabled={creating || !newKeyName.trim() || !hasSenderIds}
                >
                  {creating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Show Generated Key */}
        {newKeyVisible && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                  <Key size={24} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">API Key Generated</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Your API Key:</p>
                  <code className="text-xs font-mono text-gray-900 break-all">{newKey}</code>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  onClick={() => handleCopy(newKey)}
                >
                  <Copy size={16} className="mr-2" /> Copy to Clipboard
                </Button>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                  Save this key in a secure location. You won't be able to see it again.
                </div>
              </div>

              <Button
                className="w-full bg-teal-600 text-white hover:bg-teal-700"
                onClick={() => {
                  setNewKeyVisible(false)
                  setNewKey('')
                }}
              >
                Done
              </Button>
            </Card>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
