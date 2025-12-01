import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, amount, bankAccountId, description } = body

    if (!type || !amount || !bankAccountId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Get current balances
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    })

    if (!bankAccount) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 404 }
      )
    }

    let cashAccount = await prisma.cashAccount.findFirst()
    if (!cashAccount) {
      cashAccount = await prisma.cashAccount.create({ data: { balance: 0 } })
    }

    // Validate sufficient balance
    if (type === 'add' && bankAccount.balance < parsedAmount) {
      return NextResponse.json(
        { error: 'Insufficient bank account balance' },
        { status: 400 }
      )
    }

    if (type === 'withdraw' && cashAccount.balance < parsedAmount) {
      return NextResponse.json(
        { error: 'Insufficient cash balance' },
        { status: 400 }
      )
    }

    // Perform transaction
    if (type === 'add') {
      // Add to cash, deduct from bank
      await prisma.$transaction([
        prisma.cashAccount.update({
          where: { id: cashAccount.id },
          data: { balance: { increment: parsedAmount } },
        }),
        prisma.bankAccount.update({
          where: { id: bankAccountId },
          data: { balance: { decrement: parsedAmount } },
        }),
        prisma.transaction.create({
          data: {
            amount: parsedAmount,
            type: 'DEBIT',
            purpose: 'CASH_WITHDRAWAL',
            description: description || 'Cash withdrawal from bank',
            bankAccountId,
            cashAccountId: cashAccount.id,
          },
        }),
      ])
    } else {
      // Withdraw from cash, add to bank
      await prisma.$transaction([
        prisma.cashAccount.update({
          where: { id: cashAccount.id },
          data: { balance: { decrement: parsedAmount } },
        }),
        prisma.bankAccount.update({
          where: { id: bankAccountId },
          data: { balance: { increment: parsedAmount } },
        }),
        prisma.transaction.create({
          data: {
            amount: parsedAmount,
            type: 'CREDIT',
            purpose: 'CASH_DEPOSIT',
            description: description || 'Cash deposit to bank',
            bankAccountId,
            cashAccountId: cashAccount.id,
          },
        }),
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cash transaction error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transaction failed' },
      { status: 500 }
    )
  }
}
