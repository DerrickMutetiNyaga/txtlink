/**
 * M-Pesa C2B Confirmation Handler
 * POST /api/mpesa/c2b-confirmation
 * 
 * This endpoint confirms and processes C2B payments
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
    
    // M-Pesa C2B confirmation structure
    const {
      TransactionType,
      TransID,
      TransTime,
      TransAmount,
      BusinessShortCode,
      BillRefNumber,
      InvoiceNumber,
      OrgAccountBalance,
      ThirdPartyTransID,
      MSISDN,
      FirstName,
      MiddleName,
      LastName,
    } = body

    console.log('C2B Confirmation received:', {
      TransactionType,
      TransID,
      TransAmount,
      MSISDN,
      BillRefNumber,
    })

    // Find the transaction
    let mpesaTransaction = await MpesaTransaction.findOne({
      transactionId: TransID,
    })

    if (!mpesaTransaction) {
      // Create new transaction if not found (shouldn't happen, but handle it)
      mpesaTransaction = await MpesaTransaction.create({
        transactionType: 'C2B',
        transactionId: TransID,
        amount: parseFloat(TransAmount),
        phoneNumber: MSISDN,
        accountReference: BillRefNumber || InvoiceNumber || 'C2B-PAYMENT',
        status: 'success',
        responseCode: '0',
        resultDesc: 'Payment confirmed',
        mpesaReceiptNumber: TransID,
        rawResponse: body,
      })
    } else {
      // Update existing transaction
      mpesaTransaction.status = 'success'
      mpesaTransaction.responseCode = '0'
      mpesaTransaction.resultDesc = 'Payment confirmed'
      mpesaTransaction.mpesaReceiptNumber = TransID
      mpesaTransaction.rawResponse = body
      await mpesaTransaction.save()
    }

    // Try to find user by account reference or phone number
    let userId: mongoose.Types.ObjectId | undefined

    // Account reference might contain user ID or email
    if (mpesaTransaction.accountReference) {
      // Try to extract user ID from account reference
      // Format might be: USER-{userId} or {email} or {userId}
      const ref = mpesaTransaction.accountReference
      
      // Check if it's a MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(ref)) {
        userId = new mongoose.Types.ObjectId(ref)
      } else if (ref.startsWith('USER-')) {
        const idPart = ref.replace('USER-', '')
        if (mongoose.Types.ObjectId.isValid(idPart)) {
          userId = new mongoose.Types.ObjectId(idPart)
        }
      } else {
        // Try to find by email
        const user = await User.findOne({ email: ref })
        if (user) {
          userId = new mongoose.Types.ObjectId(user._id)
        }
      }
    }

    // If no user found by reference, try phone number
    if (!userId && mpesaTransaction.phoneNumber) {
      const phone = mpesaTransaction.phoneNumber.replace(/^254/, '0')
      const user = await User.findOne({
        $or: [
          { phone: phone },
          { phone: mpesaTransaction.phoneNumber },
        ],
      })
      if (user) {
        userId = new mongoose.Types.ObjectId(user._id)
        mpesaTransaction.userId = userId
        await mpesaTransaction.save()
      }
    }

    // Process payment if user found
    if (userId) {
      try {
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
            const reference = TransID || `MPESA-C2B-${Date.now()}`
            
            // Check if transaction already exists
            const existingTransaction = await Transaction.findOne({ reference })
            if (!existingTransaction) {
              await Transaction.create({
                userId,
                type: 'top-up',
                amount: amountKes,
                description: `M-Pesa C2B top-up: ${creditsToAdd} SMS credits @ KSh ${pricePerCreditKes.toFixed(2)} per credit`,
                reference,
                status: 'completed',
                metadata: {
                  currency: 'KES',
                  amountKes,
                  creditsAdded: creditsToAdd,
                  pricePerCreditKes,
                  mpesaReceiptNumber: TransID,
                  transactionType: 'C2B',
                },
              })
            }

            // Update M-Pesa transaction with invoice ID
            mpesaTransaction.invoiceId = reference
            mpesaTransaction.userId = userId
            await mpesaTransaction.save()

            console.log(`C2B top-up successful for user ${userDoc.email}:`, {
              userId: userDoc._id,
              amountKes,
              creditsToAdd,
              newBalance: finalBalance,
              mpesaReceiptNumber: TransID,
            })
          }
        }
      } catch (error: any) {
        console.error('Error processing C2B payment:', error)
        // Don't fail the callback, just log the error
      }
    }

    // Return success response to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Confirmation processed successfully',
    })
  } catch (error: any) {
    console.error('C2B confirmation error:', error)
    // Still return success to M-Pesa to prevent retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Confirmation received',
    })
  }
}

