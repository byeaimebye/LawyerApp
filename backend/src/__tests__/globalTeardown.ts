import { PrismaClient } from '@prisma/client'

export async function teardown() {
  const prisma = new PrismaClient()
  try {
    const testUsers = await prisma.user.findMany({
      where: { email: { endsWith: '@test.com' } },
      select: { id: true },
    })
    const ids = testUsers.map((u) => u.id)
    if (ids.length > 0) {
      await prisma.appointment.deleteMany({ where: { lawyerId: { in: ids } } })
      await prisma.user.deleteMany({ where: { id: { in: ids } } })
    }
  } finally {
    await prisma.$disconnect()
  }
}
