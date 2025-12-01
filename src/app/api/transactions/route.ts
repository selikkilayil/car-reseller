import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    include: {
      bankAccount: {
        select: {
          name: true,
          bankName: true,
        },
      },
      cashAccount: {
        select: {
          id: true,
        },
      },
      car: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json(transactions)
}
