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
    console.log('Received bank account data:', body)
    const data = bankAccountSchema.parse(body)
    console.log('Validated bank account data:', data)
    
    const account = await prisma.bankAccount.create({ data })
    return NextResponse.json(account)
  } catch (error) {
    console.error('Error creating bank account:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 400 }
    )
  }
}
