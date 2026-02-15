'use client'

import { PortalLayout } from '@/components/portal-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Search, Edit, Trash2, Copy } from 'lucide-react'
import { useState } from 'react'

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const templates = [
    {
      id: 1,
      name: 'Welcome Message',
      content: 'Welcome to {{company}}! Thank you for joining us.',
      category: 'Marketing',
      created: '2024-01-15',
      usage: 1250,
    },
    {
      id: 2,
      name: 'OTP Verification',
      content: 'Your verification code is {{code}}. Valid for 5 minutes.',
      category: 'Security',
      created: '2024-01-10',
      usage: 3420,
    },
    {
      id: 3,
      name: 'Order Confirmation',
      content: 'Your order #{{orderId}} has been confirmed. Track at {{link}}',
      category: 'Transactional',
      created: '2024-01-08',
      usage: 890,
    },
    {
      id: 4,
      name: 'Payment Reminder',
      content: 'Reminder: Payment of ${{amount}} is due on {{date}}.',
      category: 'Billing',
      created: '2024-01-05',
      usage: 567,
    },
  ]

  // Category color mapping
  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    Marketing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    Security: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    Transactional: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    Billing: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  }

  // Highlight variables in template content
  const highlightVariables = (text: string) => {
    const parts = text.split(/(\{\{[^}]+\}\})/g)
    return parts.map((part, index) => {
      if (part.match(/\{\{[^}]+\}\}/)) {
        return (
          <span key={index} className="text-teal-600 font-semibold bg-teal-50 px-1 rounded">
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === null || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = Array.from(new Set(templates.map(t => t.category)))

  return (
    <PortalLayout activeSection="Templates">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Message Templates</h1>
            <p className="text-gray-600">Create and manage reusable SMS templates</p>
          </div>
          <Button className="bg-teal-600 text-white hover:bg-teal-700">
            <Plus size={18} className="mr-2" /> New Template
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search templates by name, category, or variable (e.g. {{code}})..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
            />
          </div>
        </Card>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedCategory === null
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => {
            const colors = categoryColors[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  selectedCategory === category
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const categoryColor = categoryColors[template.category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
              return (
                <Card key={template.id} className="p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  {/* Header with icon and category */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-teal-100 text-teal-600">
                      <FileText size={20} />
                    </div>
                    <button
                      onClick={() => setSelectedCategory(template.category)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} hover:opacity-80 transition-opacity`}
                    >
                      {template.category}
                    </button>
                  </div>

                  {/* Template name */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">{template.name}</h3>

                  {/* Message preview as code block */}
                  <div className="mb-4 flex-1">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm text-gray-700 leading-relaxed min-h-[60px]">
                      {highlightVariables(template.content)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Used</span>
                      <span className="text-sm font-semibold text-gray-900">{template.usage.toLocaleString()} times</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Created</span>
                      <span className="text-xs text-gray-400">{template.created}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {/* Primary: Edit */}
                    <Button 
                      size="sm" 
                      className="flex-1 bg-teal-600 text-white hover:bg-teal-700"
                    >
                      <Edit size={16} className="mr-1.5" /> Edit
                    </Button>
                    {/* Secondary: Copy */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Copy size={16} className="mr-1.5" /> Copy
                    </Button>
                    {/* Destructive: Delete (icon only, red) */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-3 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      title="Delete template"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-12 bg-white border border-gray-100 shadow-sm text-center">
            <div className="max-w-md mx-auto">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || selectedCategory 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first template.'}
              </p>
              {!searchQuery && !selectedCategory && (
                <Button className="bg-teal-600 text-white hover:bg-teal-700">
                  <Plus size={18} className="mr-2" /> Create Template
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </PortalLayout>
  )
}
