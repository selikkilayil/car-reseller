import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const repairType = await prisma.repairType.findUnique({
    where: { id },
  })
  
  if (!repairType) {
    return NextResponse.json({ error: 'Repair type not found' }, { status: 404 })
  }
  
  return NextResponse.json(repairType)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name, description } = await req.json()
  
  const repairType = await prisma.repairType.update({
    where: { id },
    data: { name, description },
  })
  
  return NextResponse.json(repairType)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.repairType.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Cannot delete repair type. It may be referenced by repairs.' },
      { status: 400 }
    )
  }
}
