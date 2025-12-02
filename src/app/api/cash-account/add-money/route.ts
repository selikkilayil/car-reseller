import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { amount, description } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Get or create cash account
    let cashAccount = await prisma.cashAccount.findFirst()
    if (!cashAccount) {
      cashAccount = await prisma.cashAccount.create({ data: { balance: 0 } })
    }

    // Update cash account balance and create transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedCash = await tx.cashAccount.update({
        where: { id: cashAccount.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      })

      const transaction = await tx.transaction.create({
        data: {
          amount,
          type: 'CREDIT',
          purpose: 'DEPOSIT',
          description: description || 'Money added to cash',
          cashAccountId: cashAccount.id,
        },
      })

      return { cash: updatedCash, transaction }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error adding money to cash:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add money' },
      { status: 400 }
    )
  }
}
