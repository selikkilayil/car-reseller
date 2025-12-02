import { PrismaClient } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
  // Create default admin user
  const adminUsername = 'admin'
  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashPassword('admin123'),
        name: 'Admin User',
        role: 'ADMIN',
      },
    })
    console.log('Default admin user created: admin / admin123')
  }

  // Create default repair types
  const repairTypes = [
    { name: 'BODYWORK', description: 'Body repairs, dents, scratches' },
    { name: 'ELECTRIC', description: 'Electrical system repairs' },
    { name: 'PAINTING', description: 'Paint jobs and touch-ups' },
    { name: 'SPARES', description: 'Spare parts replacement' },
    { name: 'ENGINE', description: 'Engine repairs and maintenance' },
    { name: 'TRANSMISSION', description: 'Transmission repairs' },
    { name: 'INTERIOR', description: 'Interior repairs and cleaning' },
    { name: 'TIRES', description: 'Tire replacement and alignment' },
  ]

  for (const type of repairTypes) {
    await prisma.repairType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    })
  }

  // Create initial cash account
  await prisma.cashAccount.upsert({
    where: { id: 'default-cash' },
    update: {},
    create: { id: 'default-cash', balance: 0 },
  })

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
