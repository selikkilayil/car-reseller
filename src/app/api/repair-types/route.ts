import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const types = await prisma.repairType.findMany({
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(types)
}

export async function POST(req: Request) {
  const { name, description } = await req.json()
  
  const type = await prisma.repairType.create({
    data: { name, description },
  })
  return NextResponse.json(type)
}
