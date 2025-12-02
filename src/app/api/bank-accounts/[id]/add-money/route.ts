import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bankAccountId } = await params
    const { amount, description } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Update bank account balance and create transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update bank account balance
      const updatedAccount = await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: {
          balance: {
            increment: amount,
          },
        },
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount,
          type: 'CREDIT',
          purpose: 'DEPOSIT',
          description: description || 'Money added to bank account',
          bankAccountId,
        },
      })

      return { account: updatedAccount, transaction }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error adding money to bank account:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add money' },
      { status: 400 }
    )
  }
}
