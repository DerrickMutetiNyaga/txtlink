/**
 * M-Pesa STK Push Callback Handler
 * POST /api/mpesa/stk-callback
 * 
 * This endpoint receives callbacks from M-Pesa after STK Push payment
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/connect'
import { MpesaTransaction, Transaction, User } from '@/lib/db/models'
import { convertKesToCredits, getEffectivePricePerCreditKes } from '@/lib/utils/credits'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    
    // M-Pesa STK callback structure
    const stkCallback = body.Body?.stkCallback
    if (!stkCallback) {
      console.error('Invalid STK callback structure:', body)
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid callback structure' }, { status: 400 })
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback

    // Find existing transaction by checkout request ID
    let mpesaTransaction = await MpesaTransaction.findOne({
      checkoutRequestId: CheckoutRequestID,
    })

    if (!mpesaTransaction) {
      console.error('M-Pesa transaction not found:', CheckoutRequestID)
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Transaction not found' }, { status: 404 })
    }

    // Update transaction status
    let status: 'pending' | 'success' | 'failed' | 'cancelled' | 'timeout' = 'pending'
    let mpesaReceiptNumber: string | undefined
    let amount: number | undefined

    if (ResultCode === 0) {
      // Success
      status = 'success'
      
      // Extract receipt number and amount from callback metadata
      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = item.Value
          }
          if (item.Name === 'Amount') {
            amount = parseFloat(item.Value)
          }
        }
      }
    } else if (ResultCode === 1032) {
      status = 'cancelled'
    } else if (ResultCode === 1037) {
      status = 'timeout'
    } else {
      status = 'failed'
    }

    // Update M-Pesa transaction
    mpesaTransaction.status = status
    mpesaTransaction.responseCode = ResultCode?.toString()
    mpesaTransaction.resultDesc = ResultDesc
    mpesaTransaction.mpesaReceiptNumber = mpesaReceiptNumber
    mpesaTransaction.rawResponse = body
    if (amount) {
      mpesaTransaction.amount = amount
    }
    await mpesaTransaction.save()

    // If payment was successful, process the top-up
    if (status === 'success' && mpesaTransaction.userId) {
      try {
        const userId = new mongoose.Types.ObjectId(mpesaTransaction.userId)
        const userDoc = await User.findById(userId)

        if (userDoc) {
          const amountKes = mpesaTransaction.amount
          const pricePerCreditKes = getEffectivePricePerCreditKes()

          const { creditsToAdd } = convertKesToCredits({
            paidKes: amountKes,
            pricePerCreditKes,
          })

          if (creditsToAdd > 0) {
            // Update user balance
            const currentBalanceRaw =
              typeof userDoc.creditsBalance === 'number' ? userDoc.creditsBalance : 0
            const safeStartingBalance = Math.max(0, currentBalanceRaw)
            const finalBalance = safeStartingBalance + creditsToAdd

            await User.findByIdAndUpdate(
              userId,
              { creditsBalance: finalBalance },
              { new: false }
            )

            // Create transaction record
            const reference = mpesaReceiptNumber || `MPESA-${Date.now()}`
            
            // Check if transaction already exists
            const existingTransaction = await Transaction.findOne({ reference })
            if (!existingTransaction) {
              await Transaction.create({
                userId,
                type: 'top-up',
                amount: amountKes,
                description: `M-Pesa top-up: ${creditsToAdd} SMS credits @ KSh ${pricePerCreditKes.toFixed(2)} per credit`,
                reference,
                status: 'completed',
                metadata: {
                  currency: 'KES',
                  amountKes,
                  creditsAdded: creditsToAdd,
                  pricePerCreditKes,
                  mpesaReceiptNumber,
                  checkoutRequestId: CheckoutRequestID,
                },
              })
            }

            // Update M-Pesa transaction with invoice ID
            mpesaTransaction.invoiceId = reference
            await mpesaTransaction.save()

            console.log(`Top-up successful for user ${userDoc.email}:`, {
              userId: userDoc._id,
              amountKes,
              creditsToAdd,
              newBalance: finalBalance,
              mpesaReceiptNumber,
            })
          }
        }
      } catch (error: any) {
        console.error('Error processing successful payment:', error)
        // Don't fail the callback, just log the error
      }
    }

    // Return success response to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully',
    })
  } catch (error: any) {
    console.error('STK callback error:', error)
    // Still return success to M-Pesa to prevent retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Callback received',
    })
  }
}

