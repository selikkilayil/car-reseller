import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json()
  
  const validStatuses = ['PURCHASED', 'IN_REPAIR', 'READY_FOR_SALE', 'SOLD', 'DELIVERED']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  
  const car = await prisma.car.update({
    where: { id },
    data: { status },
  })
  
  return NextResponse.json(car)
}
