'use client'

import { PortalLayout } from '@/components/portal-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ArrowLeft, Phone, CreditCard, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TopUpPage() {
  const router = useRouter()
  const [paymentMethod] = useState<'mpesa' | 'card'>('mpesa')
  const [amount, setAmount] = useState<number | ''>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const presets = [1000, 2500, 5000, 10000]

  const handleTopUp = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (paymentMethod === 'mpesa' && !phoneNumber) {
      setError('Please enter your phone number')
      return
    }

    setProcessing(true)
    setError(null)
    setSuccess(null)
    setPending(false)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/topup/mpesa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amountKes: amount,
          phoneNumber: phoneNumber,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to initiate top-up')
      }

      // STK Push initiated successfully - payment is pending
      setPending(true)
      setSuccess(
        data.message || 'STK Push request sent. Please check your phone and enter your M-Pesa PIN to complete the payment.'
      )

      // Poll for payment status (optional - can be done via webhooks)
      // For now, we'll just show the pending message and let the callback handle it
      
    } catch (err: any) {
      setError(err.message || 'Failed to process top-up. Please try again.')
      console.error('Top-up error:', err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <PortalLayout activeSection="Billing">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link href="/app/billing" className="flex items-center gap-2 text-[#059669] hover:text-[#064E3B] mb-6 text-sm font-semibold transition-colors">
          <ArrowLeft size={16} /> Back to Billing
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-[#1F2937] mb-2">Top Up Account</h1>
          <p className="text-slate-600">Add funds to your account balance</p>
        </div>

        {/* Payment Method Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card
            onClick={() => setPaymentMethod('mpesa')}
            className={`p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
              paymentMethod === 'mpesa'
                ? 'border-[#059669] bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg'
                : 'border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-xl ${
                paymentMethod === 'mpesa'
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                  : 'bg-slate-100'
              }`}>
                <Phone size={24} className={paymentMethod === 'mpesa' ? 'text-white' : 'text-slate-600'} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">M-Pesa</h3>
            </div>
            <p className="text-sm text-slate-600">Pay via M-Pesa STK push (Kenya)</p>
          </Card>

          <Card
            className="p-6 border-2 border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed relative"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-slate-200">
                <CreditCard size={24} className="text-slate-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-500">Card</h3>
              </div>
            </div>
            <p className="text-sm text-slate-400">Visa, Mastercard (International)</p>
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                Coming Soon
              </span>
            </div>
          </Card>
        </div>

        {/* Amount Selection */}
        <Card className="p-8 bg-white border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#059669] to-[#14B8A6]">
              <Wallet size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1F2937]">Choose Top-Up Amount</h2>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  amount === preset
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-emerald-500 hover:bg-emerald-50'
                }`}
              >
                KSh {preset.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Or enter custom amount</label>
            <div className="flex gap-2 items-center">
              <span className="text-slate-500 text-sm">KSh</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
                min="100"
                max="500000"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 text-2xl font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 focus:border-[#059669]"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Minimum: KSh 100 | Maximum: KSh 500,000</p>
          </div>
        </Card>

        {/* Payment Form */}
        {paymentMethod === 'mpesa' ? (
          <Card className="p-8 bg-white border border-slate-200 shadow-sm">
            <h3 className="font-bold text-xl text-slate-900 mb-6">M-Pesa Payment</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254712345678 or 0712345678"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 focus:border-[#059669]"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Enter your M-Pesa registered phone number</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900">
                <p className="mb-2">
                  An M-Pesa STK prompt will be sent to your phone.
                </p>
                <p>
                  Enter your M-Pesa PIN to complete the payment.
                </p>
                <p className="mt-2 text-xs text-blue-700">
                  Ensure your phone is unlocked and has network coverage.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {error}
                </div>
              )}
              {pending && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-sm font-medium text-amber-900 mb-2">⏳ Payment Pending</p>
                  <p className="text-xs text-amber-700 mb-2">{success}</p>
                  <p className="text-xs text-amber-600">
                    Your account will be credited automatically once payment is confirmed. You can close this page and check your balance later.
                  </p>
                </div>
              )}
              {success && !pending && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                  {success}
                </div>
              )}

              <div className="flex gap-4">
                <Link href="/app/billing" className="flex-1">
                  <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={handleTopUp}
                  disabled={!amount || !phoneNumber || processing || pending}
                  className="flex-1 bg-gradient-to-r from-[#059669] to-[#14B8A6] text-white hover:shadow-lg disabled:opacity-50"
                >
                  {processing ? 'Sending STK Push...' : pending ? 'Payment Pending...' : `Send STK Push (${amount ? `KSh ${amount.toLocaleString()}` : 'Amount'})`}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card className="p-8 bg-white border border-slate-200 shadow-sm">
            <h3 className="font-bold text-xl text-slate-900 mb-6">Card Payment</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 focus:border-[#059669]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 focus:border-[#059669]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/50 focus:border-[#059669]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/app/billing" className="flex-1">
                  <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50">
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={handleTopUp}
                  disabled={!amount || processing}
                  className="flex-1 bg-gradient-to-r from-[#059669] to-[#14B8A6] text-white hover:shadow-lg disabled:opacity-50"
                >
                  {processing ? 'Processing...' : `Pay ${amount ? `KSh ${amount.toLocaleString()}` : ''}`}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </PortalLayout>
  )
}
