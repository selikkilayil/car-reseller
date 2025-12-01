import { prisma } from '@/lib/prisma'
import { partySchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  
  const parties = await prisma.party.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(parties)
}

export async function POST(req: Request) {
  const body = await req.json()
  const data = partySchema.parse(body)
  
  const party = await prisma.party.create({ data })
  return NextResponse.json(party)
}
