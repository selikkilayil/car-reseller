import { prisma } from '@/lib/prisma'
import { saleSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data = saleSchema.parse({ ...body, carId: id })
  
  const { paymentMethod, bankAccountId, bankAmount, cashAmount, carId, ...saleData } = data
  
  // Get current car to check if it's booked
  const currentCar = await prisma.car.findUnique({ where: { id } })
  const bookingAmount = currentCar?.isBooked ? currentCar.bookingAmount || 0 : 0
  const remainingAmount = saleData.salePrice - bookingAmount
  
  // Update car with sale info
  const car = await prisma.car.update({
    where: { id },
    data: {
      ...saleData,
      saleDate: new Date(),
      status: 'SOLD',
    },
  })
  
  // Record incoming payment (remaining amount after booking)
  const paymentAmount = remainingAmount > 0 ? remainingAmount : saleData.salePrice
  const paymentDescription = bookingAmount > 0 
    ? `Sale of car (Remaining: ${remainingAmount}, Booking: ${bookingAmount})`
    : `Sale of car`
  
  if (paymentMethod === 'BANK' && bankAccountId) {
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: paymentAmount,
          type: 'CREDIT',
          purpose: 'SALE',
          description: paymentDescription,
          bankAccountId,
          carId: id,
        },
      }),
      prisma.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: { increment: paymentAmount } },
      }),
    ])
  } else if (paymentMethod === 'CASH') {
    const cashAccount = await prisma.cashAccount.findFirst()
    if (cashAccount) {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            amount: paymentAmount,
            type: 'CREDIT',
            purpose: 'SALE',
            description: paymentDescription,
            cashAccountId: cashAccount.id,
            carId: id,
          },
        }),
        prisma.cashAccount.update({
          where: { id: cashAccount.id },
          data: { balance: { increment: paymentAmount } },
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
            type: 'CREDIT',
            purpose: 'SALE',
            description: `Sale of car (Bank)`,
            bankAccountId,
            carId: id,
          },
        }),
        prisma.bankAccount.update({
          where: { id: bankAccountId },
          data: { balance: { increment: bankAmount } },
        }),
        prisma.transaction.create({
          data: {
            amount: cashAmount,
            type: 'CREDIT',
            purpose: 'SALE',
            description: `Sale of car (Cash)`,
            cashAccountId: cashAccount.id,
            carId: id,
          },
        }),
        prisma.cashAccount.update({
          where: { id: cashAccount.id },
          data: { balance: { increment: cashAmount } },
        }),
      ])
    }
  }
  
  return NextResponse.json(car)
}
