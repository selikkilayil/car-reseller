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
  
  // Calculate summary data
  const purchaseExpenses = car.expenses.filter(e => e.category === 'PURCHASE').reduce((sum, e) => sum + e.amount, 0)
  const repairExpenses = car.expenses.filter(e => e.category === 'REPAIR').reduce((sum, e) => sum + e.amount, 0)
  const saleExpenses = car.expenses.filter(e => e.category === 'SALE').reduce((sum, e) => sum + e.amount, 0)
  const repairTotal = car.repairs.reduce((sum, r) => sum + r.cost, 0)
  
  const purchaseTotal = car.purchasePrice + (car.brokerageAmount || 0)
  const totalCost = purchaseTotal + purchaseExpenses + repairTotal + repairExpenses + saleExpenses
  
  // Calculate days since purchase
  const daysSincePurchase = Math.floor(
    (Date.now() - new Date(car.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  // Calculate repair days if car went through repair
  let repairDays = null
  if (car.status === 'IN_REPAIR' || car.status === 'READY_FOR_SALE' || car.status === 'SOLD' || car.status === 'DELIVERED') {
    const firstRepair = car.repairs.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0]
    
    if (firstRepair) {
      const repairStartDate = new Date(firstRepair.createdAt)
      const repairEndDate = car.readyForSaleDate ? new Date(car.readyForSaleDate) : new Date()
      repairDays = Math.floor((repairEndDate.getTime() - repairStartDate.getTime()) / (1000 * 60 * 60 * 24))
    }
  }
  
  // Calculate profit if sold
  const profit = car.salePrice ? car.salePrice - totalCost : 0
  
  const carWithSummary = {
    ...car,
    summary: {
      purchaseTotal,
      purchaseExpenses,
      repairTotal,
      repairExpenses,
      saleExpenses,
      totalCost,
      totalExpenses: purchaseExpenses + repairTotal + repairExpenses + saleExpenses,
      daysSincePurchase,
      repairDays,
      profit,
    }
  }
  
  return NextResponse.json(carWithSummary)
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
    
    // Calculate summary data
    const purchaseExpenses = car.expenses.filter(e => e.category === 'PURCHASE').reduce((sum, e) => sum + e.amount, 0)
    const repairExpenses = car.expenses.filter(e => e.category === 'REPAIR').reduce((sum, e) => sum + e.amount, 0)
    const saleExpenses = car.expenses.filter(e => e.category === 'SALE').reduce((sum, e) => sum + e.amount, 0)
    const repairTotal = car.repairs.reduce((sum, r) => sum + r.cost, 0)
    
    const purchaseTotal = car.purchasePrice + (car.brokerageAmount || 0)
    const totalCost = purchaseTotal + purchaseExpenses + repairTotal + repairExpenses + saleExpenses
    
    const daysSincePurchase = Math.floor(
      (Date.now() - new Date(car.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    let repairDays = null
    if (car.status === 'IN_REPAIR' || car.status === 'READY_FOR_SALE' || car.status === 'SOLD' || car.status === 'DELIVERED') {
      const firstRepair = car.repairs.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )[0]
      
      if (firstRepair) {
        const repairStartDate = new Date(firstRepair.createdAt)
        const repairEndDate = car.readyForSaleDate ? new Date(car.readyForSaleDate) : new Date()
        repairDays = Math.floor((repairEndDate.getTime() - repairStartDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    }
    
    const profit = car.salePrice ? car.salePrice - totalCost : 0
    
    const carWithSummary = {
      ...car,
      summary: {
        purchaseTotal,
        purchaseExpenses,
        repairTotal,
        repairExpenses,
        saleExpenses,
        totalCost,
        totalExpenses: purchaseExpenses + repairTotal + repairExpenses + saleExpenses,
        daysSincePurchase,
        repairDays,
        profit,
      }
    }
    
    return NextResponse.json(carWithSummary)
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
