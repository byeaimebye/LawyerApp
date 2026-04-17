import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10)

  await prisma.user.upsert({
    where: { email: 'ana@fontanella.com' },
    update: {},
    create: {
      email: 'ana@fontanella.com',
      passwordHash,
      name: 'Ana García',
      timezone: 'America/Argentina/Buenos_Aires',
      workStartHour: 8,
      workEndHour: 18,
    },
  })

  await prisma.user.upsert({
    where: { email: 'john@fontanella.com' },
    update: {},
    create: {
      email: 'john@fontanella.com',
      passwordHash,
      name: 'John Smith',
      timezone: 'Europe/London',
      workStartHour: 9,
      workEndHour: 17,
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@fontanella.com' },
    update: {},
    create: {
      email: 'admin@fontanella.com',
      passwordHash,
      name: 'Admin',
      role: 'SUPERADMIN',
      timezone: 'UTC',
      workStartHour: 0,
      workEndHour: 24,
    },
  })

  console.log('Seed complete: 2 lawyers + 1 superadmin created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
