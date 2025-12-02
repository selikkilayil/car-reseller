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
  try {
    const body = await req.json()
    const data = bankAccountSchema.parse(body)
    
    const account = await prisma.bankAccount.create({ data })
    return NextResponse.json(account)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 400 }
    )
  }
}
