import { prisma } from '@/lib/prisma'
import { carPurchaseSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, Permissions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  // Check if user has permission to view cars
  const auth = await requireAuth(req, Permissions.canViewCars)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  
  const cars = await prisma.car.findMany({
    where: status ? { status } : undefined,
    include: {
      purchaseParty: true,
      purchaseBroker: true,
      saleParty: true,
      saleBroker: true,
      repairs: { include: { repairType: true } },
      expenses: true,
      transactions: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  
  // Add summary data for each car
  const carsWithSummary = cars.map(car => {
    const totalExpenses = car.expenses.reduce((sum, e) => sum + e.amount, 0)
    const repairTotal = car.repairs.reduce((sum, r) => sum + r.cost, 0)
    
    // Calculate days since purchase
    const daysSincePurchase = Math.floor(
      (Date.now() - new Date(car.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    // Calculate repair days if car went through repair
    let repairDays = null
    if (car.status === 'IN_REPAIR' || car.status === 'READY_FOR_SALE' || car.status === 'SOLD' || car.status === 'DELIVERED') {
      // Find first repair date and ready for sale date
      const firstRepair = car.repairs.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0]
      
      if (firstRepair) {
        const repairStartDate = new Date(firstRepair.createdAt)
        const repairEndDate = car.readyForSaleDate ? new Date(car.readyForSaleDate) : new Date()
        repairDays = Math.floor((repairEndDate.getTime() - repairStartDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    }
    
    return {
      ...car,
      summary: {
        totalExpenses: totalExpenses + repairTotal,
        daysSincePurchase,
        repairDays,
      }
    }
  })
  
  return NextResponse.json(carsWithSummary)
}

export async function POST(req: NextRequest) {
  // Check if user has permission to create cars
  const auth = await requireAuth(req, Permissions.canCreateCars)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await req.json()
  const data = carPurchaseSchema.parse(body)
  
  const { paymentMethod, bankAccountId, bankAmount, cashAmount, ...carData } = data
  
  // Create car
  const car = await prisma.car.create({
    data: {
      ...carData,
      purchaseDate: new Date(carData.purchaseDate),
      status: 'PURCHASED',
    },
  })
  
  // Record transactions based on payment method
  const totalPaid = carData.amountPaidToSeller || carData.purchasePrice
  
  if (paymentMethod === 'BANK' && bankAccountId) {
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: totalPaid,
          type: 'DEBIT',
          purpose: 'PURCHASE',
          description: `Purchase of ${carData.make} ${carData.model}`,
          bankAccountId,
          carId: car.id,
        },
      }),
      prisma.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: { decrement: totalPaid } },
      }),
    ])
  } else if (paymentMethod === 'CASH') {
    const cashAccount = await prisma.cashAccount.findFirst()
    if (cashAccount) {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            amount: totalPaid,
            type: 'DEBIT',
            purpose: 'PURCHASE',
            description: `Purchase of ${carData.make} ${carData.model}`,
            cashAccountId: cashAccount.id,
            carId: car.id,
          },
        }),
        prisma.cashAccount.update({
          where: { id: cashAccount.id },
          data: { balance: { decrement: totalPaid } },
        }),
      ])
    }
  } else if (paymentMethod === 'MIXED' && bankAccountId && bankAmount && cashAmount) {
    const cashAccount = await prisma.cashAccount.findFirst()
    if (cashAccount) {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            amount: bankAmount,
            type: 'DEBIT',
            purpose: 'PURCHASE',
            description: `Purchase of ${carData.make} ${carData.model} (Bank)`,
            bankAccountId,
            carId: car.id,
          },
        }),
        prisma.bankAccount.update({
          where: { id: bankAccountId },
          data: { balance: { decrement: bankAmount } },
        }),
        prisma.transaction.create({
          data: {
            amount: cashAmount,
            type: 'DEBIT',
            purpose: 'PURCHASE',
            description: `Purchase of ${carData.make} ${carData.model} (Cash)`,
            cashAccountId: cashAccount.id,
            carId: car.id,
          },
        }),
        prisma.cashAccount.update({
          where: { id: cashAccount.id },
          data: { balance: { decrement: cashAmount } },
        }),
      ])
    }
  }
  
  return NextResponse.json(car)
}
