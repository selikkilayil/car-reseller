import { prisma } from '@/lib/prisma'
import { carEditSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      purchaseParty: true,
      purchaseBroker: true,
      saleParty: true,
      saleBroker: true,
      repairs: { include: { repairType: true } },
      expenses: true,
      transactions: true,
    },
  })
  
  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  }
  
  return NextResponse.json(car)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  
  try {
    const data = carEditSchema.parse(body)
    
    // Check if car exists
    const existingCar = await prisma.car.findUnique({ where: { id } })
    if (!existingCar) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }
    
    // Prepare update data
    const updateData: any = { ...data }
    
    // Convert purchaseDate string to Date if provided
    if (data.purchaseDate) {
      updateData.purchaseDate = new Date(data.purchaseDate)
    }
    
    // Update car
    const car = await prisma.car.update({
      where: { id },
      data: updateData,
      include: {
        purchaseParty: true,
        purchaseBroker: true,
        saleParty: true,
        saleBroker: true,
        repairs: { include: { repairType: true } },
        expenses: true,
        transactions: true,
      },
    })
    
    return NextResponse.json(car)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update car' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    // Check if car exists
    const existingCar = await prisma.car.findUnique({ where: { id } })
    if (!existingCar) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    }
    
    // Delete car (cascade will handle related records)
    await prisma.car.delete({ where: { id } })
    
    return NextResponse.json({ message: 'Car deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 })
  }
}
