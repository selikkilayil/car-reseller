import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  
  const car = await prisma.car.update({
    where: { id },
    data: {
      status: 'READY_FOR_SALE',
      netRate: body.netRate,
      readyForSaleDate: new Date(),
    },
  })
  
  return NextResponse.json(car)
}
