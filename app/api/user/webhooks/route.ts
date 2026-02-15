/**
 * Get and Create User Webhooks
 * GET /api/user/webhooks - Get user's webhooks
 * POST /api/user/webhooks - Create new webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import { UserWebhook, UserSenderId } from '@/lib/db/models'
import { requireAuth } from '@/lib/auth/middleware'
import mongoose from 'mongoose'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const user = requireAuth(request)

    const userId = new mongoose.Types.ObjectId(user.userId)
    const webhooks = await UserWebhook.find({ userId })
      .sort({ createdAt: -1 })
      .lean()

    // Check if user has any sender IDs
    const senderIdCount = await UserSenderId.countDocuments({ userId })

    const formattedWebhooks = webhooks.map((webhook) => ({
      id: webhook._id?.toString(),
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      status: webhook.status,
      lastTriggeredAt: webhook.lastTriggeredAt,
      createdAt: webhook.createdAt,
      secret: `whsec_${webhook.secret.substring(0, 8)}...`, // Only show prefix
    }))

    return NextResponse.json({
      success: true,
      webhooks: formattedWebhooks,
      hasSenderIds: senderIdCount > 0,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Get webhooks error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const user = requireAuth(request)

    const userId = new mongoose.Types.ObjectId(user.userId)
    const body = await request.json()

    const { name, url, events } = body

    if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Name, URL, and at least one event are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Check if user has at least one sender ID
    const senderIdCount = await UserSenderId.countDocuments({ userId })
    if (senderIdCount === 0) {
      return NextResponse.json(
        { error: 'You must have at least one approved sender ID before creating a webhook. Please request a sender ID first.' },
        { status: 400 }
      )
    }

    // Validate events
    const validEvents = ['sms.delivered', 'sms.failed', 'sms.sent', 'balance.low', 'campaign.completed']
    const invalidEvents = events.filter((e: string) => !validEvents.includes(e))
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex')

    // Create webhook
    const webhook = await UserWebhook.create({
      userId,
      name,
      url,
      events,
      secret,
      status: 'active',
    })

    return NextResponse.json({
      success: true,
      webhook: {
        id: webhook._id?.toString(),
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        status: webhook.status,
        secret: `whsec_${secret.substring(0, 16)}`, // Show first 16 chars for user to save
        createdAt: webhook.createdAt,
      },
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Create webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

