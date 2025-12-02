import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const repairEditSchema = z.object({
  repairTypeId: z.string().min(1, 'Repair type is required').optional(),
  description: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  vendorName: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  cost: z.coerce.number().min(0).optional(),
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const repair = await prisma.repair.findUnique({
    where: { id },
    include: {
      repairType: true,
      car: true,
      transactions: {
        include: {
          bankAccount: true,
          cashAccount: true,
        },
      },
    },
  })
  
  if (!repair) {
    return NextResponse.json({ error: 'Repair not found' }, { status: 404 })
  }
  
  return NextResponse.json(repair)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  
  try {
    const data = repairEditSchema.parse(body)
    
    const existingRepair = await prisma.repair.findUnique({ 
      where: { id },
      include: { transactions: true }
    })
    
    if (!existingRepair) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 })
    }
    
    // Update repair
    const repair = await prisma.repair.update({
      where: { id },
      data,
      include: {
        repairType: true,
        car: true,
        transactions: true,
      },
    })
    
    // If cost changed, update related transactions and account balances
    if (data.cost && data.cost !== existingRepair.cost) {
      const costDiff = data.cost - existingRepair.cost
      
      for (const txn of existingRepair.transactions) {
        await prisma.transaction.update({
          where: { id: txn.id },
          data: { amount: data.cost },
        })
        
        if (txn.bankAccountId) {
          await prisma.bankAccount.update({
            where: { id: txn.bankAccountId },
            data: { balance: { decrement: costDiff } },
          })
        } else if (txn.cashAccountId) {
          await prisma.cashAccount.update({
            where: { id: txn.cashAccountId },
            data: { balance: { decrement: costDiff } },
          })
        }
      }
    }
    
    return NextResponse.json(repair)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update repair' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    const repair = await prisma.repair.findUnique({
      where: { id },
      include: { transactions: true },
    })
    
    if (!repair) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 })
    }
    
    // Reverse the transactions (add money back to accounts)
    for (const txn of repair.transactions) {
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
    
    // Delete repair (cascade will handle transactions)
    await prisma.repair.delete({ where: { id } })
    
    return NextResponse.json({ message: 'Repair deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete repair' }, { status: 500 })
  }
}
