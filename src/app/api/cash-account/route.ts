import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  let cash = await prisma.cashAccount.findFirst()
  if (!cash) {
    cash = await prisma.cashAccount.create({ data: { balance: 0 } })
  }
  return NextResponse.json(cash)
}

export async function PUT(req: Request) {
  const { balance } = await req.json()
  let cash = await prisma.cashAccount.findFirst()
  
  if (!cash) {
    cash = await prisma.cashAccount.create({ data: { balance } })
  } else {
    cash = await prisma.cashAccount.update({
      where: { id: cash.id },
      data: { balance },
    })
  }
  return NextResponse.json(cash)
}
