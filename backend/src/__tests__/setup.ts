import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'
import { signToken } from '../lib/jwt.js'

export { prisma }

/** Deletes only test users (email ending in @test.com) and their appointments */
export async function cleanDb() {
  const testUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@test.com' } },
    select: { id: true },
  })
  const ids = testUsers.map((u) => u.id)
  if (ids.length > 0) {
    await prisma.appointment.deleteMany({ where: { lawyerId: { in: ids } } })
    await prisma.user.deleteMany({ where: { id: { in: ids } } })
  }
}

export interface SeedLawyerOptions {
  email?: string
  name?: string
  timezone?: string
  workStartHour?: number
  workEndHour?: number
}

export async function seedLawyer(opts: SeedLawyerOptions = {}) {
  const email = opts.email ?? 'lawyer@test.com'
  const passwordHash = await bcrypt.hash('test1234', 1)
  return prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: opts.name ?? 'Test Lawyer',
      role: 'LAWYER',
      timezone: opts.timezone ?? 'America/Argentina/Buenos_Aires',
      workStartHour: opts.workStartHour ?? 8,
      workEndHour: opts.workEndHour ?? 18,
    },
  })
}

export async function seedSuperAdmin() {
  const passwordHash = await bcrypt.hash('test1234', 1)
  return prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash },
    create: {
      email: 'admin@test.com',
      passwordHash,
      name: 'Test Admin',
      role: 'SUPERADMIN',
      timezone: 'UTC',
      workStartHour: 0,
      workEndHour: 24,
    },
  })
}

export function tokenFor(user: { id: string; email: string; role: string; timezone: string }) {
  return signToken({ userId: user.id, email: user.email, role: user.role, timezone: user.timezone })
}

/**
 * Returns an ISO string for a future date.
 * @param hourUTC  UTC hour (0-23)
 * @param dayOffset  days from today (default: 1 = tomorrow)
 */
export function futureISO(hourUTC: number, dayOffset = 1): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + dayOffset)
  d.setUTCHours(hourUTC, 0, 0, 0)
  return d.toISOString()
}

/**
 * Insert an appointment directly (bypasses service validations).
 * Use for seeding past/cancelled appointments in tests.
 */
export async function insertAppointment(lawyerId: string, startAt: Date, endAt: Date, status: 'SCHEDULED' | 'CANCELLED' = 'SCHEDULED') {
  return prisma.appointment.create({
    data: {
      lawyerId,
      clientName: 'Test Client',
      clientEmail: 'client@test.com',
      clientTimezone: 'UTC',
      type: 'IN_PERSON',
      startAt,
      endAt,
      durationMinutes: 45,
      status,
    },
  })
}
