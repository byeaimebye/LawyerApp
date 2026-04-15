import { AppointmentStatus } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export async function hasOverlap({
  lawyerId,
  startAt,
  endAt,
  excludeId,
}: {
  lawyerId: string
  startAt: Date
  endAt: Date
  excludeId?: string
}): Promise<boolean> {
  const count = await prisma.appointment.count({
    where: {
      lawyerId,
      status: AppointmentStatus.SCHEDULED,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
    },
  })
  return count > 0
}
