import { prisma } from '@/lib/prisma'
import { expenseSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const data = expenseSchema.parse(body)
  
  const { paymentMethod, bankAccountId, ...expenseData } = data
  
  // Create expense
  const expense = await prisma.expense.create({ data: expenseData })
  
  // Record transaction
  if (paymentMethod === 'BANK' && bankAccountId) {
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: data.amount,
          type: 'DEBIT',
          purpose: 'EXPENSE',
          description: `${data.category} expense: ${data.type}`,
          bankAccountId,
          carId: data.carId,
          expenseId: expense.id,
        },
      }),
      prisma.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: { decrement: data.amount } },
      }),
    ])
  } else {
    const cashAccount = await prisma.cashAccount.findFirst()
    if (cashAccount) {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            amount: data.amount,
            type: 'DEBIT',
            purpose: 'EXPENSE',
            description: `${data.category} expense: ${data.type}`,
            cashAccountId: cashAccount.id,
            carId: data.carId,
            expenseId: expense.id,
          },
        }),
        prisma.cashAccount.update({
          where: { id: cashAccount.id },
          data: { balance: { decrement: data.amount } },
        }),
      ])
    }
  }
  
  return NextResponse.json(expense)
}
