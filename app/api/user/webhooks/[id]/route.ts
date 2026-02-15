/**
 * Update and Delete User Webhooks
 * PATCH /api/user/webhooks/[id] - Update webhook
 * DELETE /api/user/webhooks/[id] - Delete webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import { UserWebhook } from '@/lib/db/models'
import { requireAuth } from '@/lib/auth/middleware'
import mongoose from 'mongoose'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const user = requireAuth(request)

    const userId = new mongoose.Types.ObjectId(user.userId)
    const keyId = new mongoose.Types.ObjectId(params.id)
    const body = await request.json()

    // Find and verify ownership
    const webhook = await UserWebhook.findOne({ _id: keyId, userId })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // Update allowed fields
    if (body.name !== undefined) webhook.name = body.name
    if (body.url !== undefined) {
      try {
        new URL(body.url)
        webhook.url = body.url
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        )
      }
    }
    if (body.events !== undefined) {
      const validEvents = ['sms.delivered', 'sms.failed', 'sms.sent', 'balance.low', 'campaign.completed']
      const invalidEvents = body.events.filter((e: string) => !validEvents.includes(e))
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          { error: `Invalid events: ${invalidEvents.join(', ')}` },
          { status: 400 }
        )
      }
      webhook.events = body.events
    }
    if (body.status !== undefined) {
      if (!['active', 'inactive'].includes(body.status)) {
        return NextResponse.json(
          { error: 'Status must be either "active" or "inactive"' },
          { status: 400 }
        )
      }
      webhook.status = body.status
    }

    await webhook.save()

    return NextResponse.json({
      success: true,
      message: 'Webhook updated successfully',
      webhook: {
        id: webhook._id?.toString(),
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        status: webhook.status,
      },
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Update webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const user = requireAuth(request)

    const userId = new mongoose.Types.ObjectId(user.userId)
    const webhookId = new mongoose.Types.ObjectId(params.id)

    // Find and verify ownership
    const webhook = await UserWebhook.findOne({ _id: webhookId, userId })

    if (!webhook) {
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    // Delete the webhook
    await UserWebhook.deleteOne({ _id: webhookId })

    return NextResponse.json({
      success: true,
      message: 'Webhook deleted successfully',
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Delete webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

