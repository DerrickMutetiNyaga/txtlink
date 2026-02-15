/**
 * Delivery Report Webhook Handler
 * POST /api/sms/dlr
 * 
 * Receives delivery status updates from HostPinnacle
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import { SmsMessage, User, WebhookLog } from '@/lib/db/models'
import { getPricingRule } from '@/lib/utils/pricing'

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Verify webhook secret if provided
    const secret = request.headers.get('x-webhook-secret') || request.nextUrl.searchParams.get('secret')
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
    }

    // Parse webhook payload
    // HostPinnacle may send form data or JSON
    let data: any
    const contentType = request.headers.get('content-type')

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      data = Object.fromEntries(formData.entries())
    } else {
      data = await request.json()
    }

    // Log webhook payload
    const transactionId =
      data.transactionId ||
      data.transactionid ||
      data.trans_id ||
      data.txnid ||
      data.id

    await WebhookLog.create({
      transactionId,
      provider: 'hostpinnacle',
      eventType: 'dlr',
      payload: data,
      processed: false,
    })

    // Common field names from HostPinnacle DLR
    const status = data.status || data.Status || data.delivery_status || data.dlrstatus
    const mobile = data.mobile || data.mobileno || data.to

    if (!transactionId) {
      await WebhookLog.findOneAndUpdate(
        { transactionId: null },
        { error: 'Missing transactionId', processed: true },
        { sort: { createdAt: -1 } }
      )
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 })
    }

    // Find SMS message by transaction ID
    const smsMessage = await SmsMessage.findOne({ hpTransactionId: transactionId })

    if (!smsMessage) {
      console.warn(`SMS message not found for transactionId: ${transactionId}`)
      return NextResponse.json({ received: true })
    }

    // Map HostPinnacle status to our status
    let mappedStatus: 'sent' | 'delivered' | 'failed' = 'sent'
    const statusLower = (status || '').toLowerCase()

    if (statusLower.includes('deliver') || statusLower === 'success' || statusLower === 'delivered') {
      mappedStatus = 'delivered'
    } else if (
      statusLower.includes('fail') ||
      statusLower.includes('reject') ||
      statusLower === 'error'
    ) {
      mappedStatus = 'failed'
    }

    // Update SMS message
    const updateData: any = {
      status: mappedStatus,
    }

    if (mappedStatus === 'delivered') {
      updateData.deliveredAt = new Date()
    } else if (mappedStatus === 'failed') {
      updateData.failedAt = new Date()
      updateData.errorCode = data.errorCode || data.errorcode
      updateData.errorMessage = data.errorMessage || data.errormessage || data.message

      // Check pricing rule for refund policy
      const rule = await getPricingRule(smsMessage.userId.toString())
      
      // Refund credits if enabled and not already refunded
      if (rule.refundOnFail && !smsMessage.refunded) {
        const refundAmount = smsMessage.chargedKes || smsMessage.totalCost
        
        await User.findByIdAndUpdate(smsMessage.userId, {
          $inc: { credits: refundAmount },
        })

        updateData.refunded = true
        updateData.refundAmountKes = refundAmount
      }
    }

    await SmsMessage.findByIdAndUpdate(smsMessage._id, updateData)

    // Mark webhook as processed
    await WebhookLog.findOneAndUpdate(
      { transactionId },
      { processed: true, processedAt: new Date() }
    )

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Allow GET for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok' })
}

