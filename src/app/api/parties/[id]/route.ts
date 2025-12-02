import { prisma } from '@/lib/prisma'
import { partySchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const party = await prisma.party.findUnique({
    where: { id },
  })
  
  if (!party) {
    return NextResponse.json({ error: 'Party not found' }, { status: 404 })
  }
  
  return NextResponse.json(party)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data = partySchema.parse(body)
  
  const party = await prisma.party.update({
    where: { id },
    data,
  })
  
  return NextResponse.json(party)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.party.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Cannot delete party. It may be referenced by cars or transactions.' },
      { status: 400 }
    )
  }
}
