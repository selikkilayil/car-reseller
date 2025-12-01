import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      purchaseParty: true,
      purchaseBroker: true,
      saleParty: true,
      saleBroker: true,
      repairs: { include: { repairType: true, transactions: true } },
      expenses: { include: { transactions: true } },
      transactions: { include: { bankAccount: true, cashAccount: true } },
    },
  })
  
  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  }
  
  // Calculate totals
  const purchaseTotal = car.amountPaidToSeller || car.purchasePrice
  const repairTotal = car.repairs.reduce((sum, r) => sum + r.cost, 0)
  const purchaseExpenses = car.expenses.filter(e => e.category === 'PURCHASE').reduce((sum, e) => sum + e.amount, 0)
  const repairExpenses = car.expenses.filter(e => e.category === 'REPAIR').reduce((sum, e) => sum + e.amount, 0)
  const saleExpenses = car.expenses.filter(e => e.category === 'SALE').reduce((sum, e) => sum + e.amount, 0)
  
  const totalCost = purchaseTotal + repairTotal + purchaseExpenses + repairExpenses + (car.brokerageAmount || 0)
  const profit = car.salePrice ? car.salePrice - totalCost - saleExpenses - (car.saleBrokerage || 0) : null
  
  return NextResponse.json({
    ...car,
    summary: {
      purchaseTotal,
      repairTotal,
      purchaseExpenses,
      repairExpenses,
      saleExpenses,
      totalCost,
      profit,
    },
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  
  const car = await prisma.car.update({
    where: { id },
    data: body,
  })
  
  return NextResponse.json(car)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  await prisma.car.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
