import { AppointmentStatus, AppointmentType, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { isWithinWorkingHours } from '../utils/workingHours.js'
import { hasOverlap } from '../utils/overlap.js'
import type { CreateAppointmentInput } from '../schemas/appointments.js'

interface AppointmentServiceError {
  status: number
  error: string
  code: string
}

function serviceError(status: number, error: string, code: string): AppointmentServiceError {
  return { status, error, code }
}

const DURATION_MINUTES = 45

export async function createAppointment({
  lawyerId,
  startAt: startAtStr,
  type,
  clientName,
  clientEmail,
  clientTimezone,
  locationOrLink,
  notes,
}: Omit<CreateAppointmentInput, 'durationMinutes'> & { lawyerId: string }) {
  const startAt = new Date(startAtStr)
  const endAt = new Date(startAt.getTime() + DURATION_MINUTES * 60 * 1000)

  // 1. Not in the past
  if (startAt <= new Date()) {
    throw serviceError(400, 'startAt must be in the future', 'PAST_DATE')
  }

  // 2. Fetch lawyer to validate working hours
  const lawyer = await prisma.user.findUnique({ where: { id: lawyerId } })
  if (!lawyer) {
    throw serviceError(404, 'Lawyer not found', 'NOT_FOUND')
  }

  // 3. Within working hours
  if (
    !isWithinWorkingHours({
      startAt,
      endAt,
      timezone: lawyer.timezone,
      workStartHour: lawyer.workStartHour,
      workEndHour: lawyer.workEndHour,
    })
  ) {
    throw serviceError(422, 'Appointment is outside of working hours', 'OUTSIDE_WORKING_HOURS')
  }

  // 4. No overlap with existing SCHEDULED appointments
  if (await hasOverlap({ lawyerId, startAt, endAt })) {
    throw serviceError(409, 'Appointment overlaps with an existing one', 'OVERLAP')
  }

  return prisma.appointment.create({
    data: {
      lawyerId,
      clientName,
      clientEmail,
      clientTimezone,
      type: type as AppointmentType,
      startAt,
      endAt,
      durationMinutes: DURATION_MINUTES,
      locationOrLink,
      notes,
    },
  })
}

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
  const where: Prisma.AppointmentWhereInput = {
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
