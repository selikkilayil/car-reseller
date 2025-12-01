import { prisma } from '@/lib/prisma'
import { repairSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const data = repairSchema.parse(body)
  
  const { paymentMethod, bankAccountId, ...repairData } = data
  
  // Create repair
  const repair = await prisma.repair.create({
    data: repairData,
    include: { repairType: true },
  })
  
  // Update car status to IN_REPAIR if not already
  await prisma.car.update({
    where: { id: data.carId },
    data: { status: 'IN_REPAIR' },
  })
  
  // Record transaction
  if (paymentMethod === 'BANK' && bankAccountId) {
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: data.cost,
          type: 'DEBIT',
          purpose: 'REPAIR',
          description: `Repair: ${repair.repairType.name}`,
          bankAccountId,
          carId: data.carId,
          repairId: repair.id,
        },
      }),
      prisma.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: { decrement: data.cost } },
      }),
    ])
  } else {
    const cashAccount = await prisma.cashAccount.findFirst()
    if (cashAccount) {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            amount: data.cost,
            type: 'DEBIT',
            purpose: 'REPAIR',
            description: `Repair: ${repair.repairType.name}`,
            cashAccountId: cashAccount.id,
            carId: data.carId,
            repairId: repair.id,
          },
        }),
        prisma.cashAccount.update({
          where: { id: cashAccount.id },
          data: { balance: { decrement: data.cost } },
        }),
      ])
    }
  }
  
  return NextResponse.json(repair)
}
