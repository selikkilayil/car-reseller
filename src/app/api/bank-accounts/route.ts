import { prisma } from '@/lib/prisma'
import { bankAccountSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function GET() {
  const accounts = await prisma.bankAccount.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(accounts)
}

export async function POST(req: Request) {
  const body = await req.json()
  const data = bankAccountSchema.parse(body)
  
  const account = await prisma.bankAccount.create({ data })
  return NextResponse.json(account)
}
