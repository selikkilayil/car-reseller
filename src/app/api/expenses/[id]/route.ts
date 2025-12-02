import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const expenseEditSchema = z.object({
  type: z.enum(['TRAVEL', 'FUEL', 'BROKERAGE', 'DELIVERY', 'OTHER']).optional(),
  description: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  amount: z.coerce.number().min(0).optional(),
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      car: true,
      transactions: {
        include: {
          bankAccount: true,
          cashAccount: true,
        },
      },
    },
  })
  
  if (!expense) {
    return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
  }
  
  return NextResponse.json(expense)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  
  try {
    const data = expenseEditSchema.parse(body)
    
    const existingExpense = await prisma.expense.findUnique({ 
      where: { id },
      include: { transactions: true }
    })
    
    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    
    // Update expense
    const expense = await prisma.expense.update({
      where: { id },
      data,
      include: {
        car: true,
        transactions: true,
      },
    })
    
    // If amount changed, update related transactions and account balances
    if (data.amount && data.amount !== existingExpense.amount) {
      const amountDiff = data.amount - existingExpense.amount
      
      for (const txn of existingExpense.transactions) {
        await prisma.transaction.update({
          where: { id: txn.id },
          data: { amount: data.amount },
        })
        
        if (txn.bankAccountId) {
          await prisma.bankAccount.update({
            where: { id: txn.bankAccountId },
            data: { balance: { decrement: amountDiff } },
          })
        } else if (txn.cashAccountId) {
          await prisma.cashAccount.update({
            where: { id: txn.cashAccountId },
            data: { balance: { decrement: amountDiff } },
          })
        }
      }
    }
    
    return NextResponse.json(expense)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { transactions: true },
    })
    
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    
    // Reverse the transactions (add money back to accounts)
    for (const txn of expense.transactions) {
      if (txn.bankAccountId) {
        await prisma.bankAccount.update({
          where: { id: txn.bankAccountId },
          data: { balance: { increment: txn.amount } },
        })
      } else if (txn.cashAccountId) {
        await prisma.cashAccount.update({
          where: { id: txn.cashAccountId },
          data: { balance: { increment: txn.amount } },
        })
      }
    }
    
    // Delete expense (cascade will handle transactions)
    await prisma.expense.delete({ where: { id } })
    
    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
