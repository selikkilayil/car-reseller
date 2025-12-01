import { prisma } from '@/lib/prisma'
import { carPurchaseSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
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
  return NextResponse.json(cars)
}

export async function POST(req: Request) {
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
