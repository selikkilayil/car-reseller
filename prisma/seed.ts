import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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
