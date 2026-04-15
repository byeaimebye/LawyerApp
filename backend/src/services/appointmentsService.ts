import { AppointmentStatus } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export async function listAppointments({
  lawyerId,
  from,
  to,
  includeCancelled,
}: {
  lawyerId: string
  from: string
  to: string
  includeCancelled: boolean
}) {
  const where: Parameters<typeof prisma.appointment.findMany>[0]['where'] = {
    lawyerId,
    startAt: {
      gte: new Date(from),
      lt: new Date(to),
    },
  }

  if (!includeCancelled) {
    where.status = AppointmentStatus.SCHEDULED
  }

  return prisma.appointment.findMany({
    where,
    orderBy: { startAt: 'asc' },
  })
}
