/**
 * Update and Delete User API Keys
 * DELETE /api/user/api-keys/[id] - Revoke API key
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import { ApiKey } from '@/lib/db/models'
import { requireAuth } from '@/lib/auth/middleware'
import mongoose from 'mongoose'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const user = requireAuth(request)

    const userId = new mongoose.Types.ObjectId(user.userId)
    const keyId = new mongoose.Types.ObjectId(params.id)

    // Find and verify ownership
    const apiKey = await ApiKey.findOne({ _id: keyId, userId })

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Revoke the key (soft delete by setting status to revoked)
    apiKey.status = 'revoked'
    await apiKey.save()

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Revoke API key error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

