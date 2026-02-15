'use client'

import React from "react"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token and user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('isAuthenticated', 'true')
        
      // Debug logging - show full user object
      console.log('Login successful:', {
        email: data.user.email,
        role: data.user.role,
        isOwner: data.user.isOwner,
        fullUserObject: data.user
      })
      console.log('isOwner value:', data.user.isOwner, 'Type:', typeof data.user.isOwner)
        
        // Check if there's a redirect destination
        const redirectAfterLogin = localStorage.getItem('redirectAfterLogin')
        
        if (redirectAfterLogin) {
          localStorage.removeItem('redirectAfterLogin')
          router.push(redirectAfterLogin)
        } else {
          // Redirect based on user type
          if (data.user.isOwner) {
            // Super admin (owner) → super admin pages only
            console.log('Login: Redirecting owner to /super-admin', { 
              email: data.user.email, 
              isOwner: data.user.isOwner,
              userObject: data.user
            })
            // Use window.location for immediate, unblockable redirect
            window.location.href = '/super-admin'
          } else if (data.user.role === 'admin') {
            // Regular admin → admin pages
            console.log('Login: Redirecting admin to /admin/users', { 
              email: data.user.email, 
              role: data.user.role,
              isOwner: data.user.isOwner 
            })
            router.push('/admin/users')
          } else {
            // Regular user → app pages
            console.log('Login: Redirecting user to /app/dashboard')
            router.push('/app/dashboard')
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="text-2xl font-bold text-teal-700 hover:text-teal-800 transition-colors">
            SignalHub
          </Link>
        </div>

        {/* Card */}
        <Card className="p-8 border-teal-200/50 shadow-xl bg-white/95 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-8">Sign in to your SignalHub account</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/auth/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                required
              />
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-4 h-4" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-500/30 py-3 transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight className="ml-2" size={18} />}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white">
                Google
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white">
                Microsoft
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-teal-600 font-medium hover:text-teal-700 hover:underline">
              Sign up
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
