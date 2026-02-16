'use client'

import React from "react"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    phone: '',
    password: '',
    country: 'KE',
    agreeTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.company || formData.email.split('@')[0],
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Store token and user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('isAuthenticated', 'true')
        
        // New users always go to app (they can't be owner/admin on registration)
        router.push('/app/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.')
      console.error('Registration error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="text-2xl font-bold text-teal-700 hover:text-teal-800 transition-colors">
            TXTLINK
          </Link>
        </div>

        {/* Card */}
        <Card className="p-8 border-teal-200/50 shadow-xl bg-white/95 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600 mb-8">Start sending SMS with TXTLINK</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+254 7XX XXX XXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
              >
                <option value="KE">Kenya</option>
                <option value="UG">Uganda</option>
                <option value="TZ">Tanzania</option>
                <option value="NG">Nigeria</option>
                <option value="GH">Ghana</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                required
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                name="agreeTerms"
                id="agree"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-1"
                required
              />
              <label htmlFor="agree" className="ml-3 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/legal/terms" className="text-teal-600 hover:text-teal-700 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/legal/privacy" className="text-teal-600 hover:text-teal-700 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.agreeTerms}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-500/30 py-3 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'} {!loading && <ArrowRight className="ml-2" size={18} />}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-teal-600 font-medium hover:text-teal-700 hover:underline">
              Sign in
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <Link href="/" className="hover:text-teal-600 transition-colors font-medium">
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
