import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const bookingSchema = z.object({
  bookingAmount: z.number().positive(),
  bookingPartyId: z.string(),
  paymentMethod: z.enum(['BANK', 'CASH']),
  bankAccountId: z.string().optional(),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = bookingSchema.parse(body)
    
    // Update car with booking info
    const car = await prisma.car.update({
      where: { id },
      data: {
        isBooked: true,
        bookingAmount: data.bookingAmount,
        bookingDate: new Date(),
        bookingPartyId: data.bookingPartyId,
        status: 'BOOKED',
      },
    })
    
    // Record incoming booking payment
    if (data.paymentMethod === 'BANK' && data.bankAccountId) {
      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            amount: data.bookingAmount,
            type: 'CREDIT',
            purpose: 'SALE',
            description: `Booking amount for car`,
            bankAccountId: data.bankAccountId,
            carId: id,
          },
        }),
        prisma.bankAccount.update({
          where: { id: data.bankAccountId },
          data: { balance: { increment: data.bookingAmount } },
        }),
      ])
    } else if (data.paymentMethod === 'CASH') {
      const cashAccount = await prisma.cashAccount.findFirst()
      if (cashAccount) {
        await prisma.$transaction([
          prisma.transaction.create({
            data: {
              amount: data.bookingAmount,
              type: 'CREDIT',
              purpose: 'SALE',
              description: `Booking amount for car`,
              cashAccountId: cashAccount.id,
              carId: id,
            },
          }),
          prisma.cashAccount.update({
            where: { id: cashAccount.id },
            data: { balance: { increment: data.bookingAmount } },
          }),
        ])
      }
    }
    
    return NextResponse.json(car)
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to book car' }, { status: 500 })
  }
}

// Cancel booking
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const car = await prisma.car.findUnique({ where: { id } })
    if (!car || !car.isBooked) {
      return NextResponse.json({ error: 'Car is not booked' }, { status: 400 })
    }
    
    // Update car to remove booking
    const updatedCar = await prisma.car.update({
      where: { id },
      data: {
        isBooked: false,
        bookingAmount: null,
        bookingDate: null,
        bookingPartyId: null,
        status: 'READY_FOR_SALE',
      },
    })
    
    return NextResponse.json(updatedCar)
  } catch (error) {
    console.error('Cancel booking error:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
