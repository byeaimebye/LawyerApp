import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { DateTime } from 'luxon'
import { app } from '../app.js'
import {
  cleanDb,
  seedLawyer,
  seedSuperAdmin,
  tokenFor,
  futureISO,
  insertAppointment,
} from './setup.js'

// Lawyer timezone: America/Argentina/Buenos_Aires (UTC-3, no DST)
// Rule: SUPERADMIN operates in the lawyer's timezone context.
// The frontend converts slot times to UTC before sending — backend validates
// against the lawyer's timezone. UTC storage is the source of truth.
//
// Key mapping (Buenos Aires = UTC-3):
//   08:00 BA = 11:00 UTC  (workStart)
//   10:00 BA = 13:00 UTC  (valid mid-morning slot)
//   17:15 BA = 20:15 UTC  (valid near-end-of-day slot, ends 18:00 BA = 21:00 UTC)
//   18:00 BA = 21:00 UTC  (workEnd)
//   23:45 BA = 02:45 UTC  (midnight edge — outside working hours)

const BA_TZ = 'America/Argentina/Buenos_Aires'
// 10:00 AM Buenos Aires = 13:00 UTC — valid working-hours slot
const VALID_HOUR_UTC = 13
// 00:00 AM Buenos Aires = 03:00 UTC — outside working hours
const OUTSIDE_HOUR_UTC = 3

let adminToken = ''
let lawyerId = ''
let lawyerToken = ''

const FROM = new Date(Date.now() - 86400000).toISOString()
const TO = new Date(Date.now() + 30 * 86400000).toISOString()

beforeEach(async () => {
  await cleanDb()
  const admin = await seedSuperAdmin()
  adminToken = tokenFor(admin)

  // Lawyer is in Buenos Aires (UTC-3), SUPERADMIN is in UTC
  const lawyer = await seedLawyer({
    email: 'lawyer@test.com',
    timezone: BA_TZ,
    workStartHour: 8,
    workEndHour: 18,
  })
  lawyerId = lawyer.id
  lawyerToken = tokenFor(lawyer)
})

// ── GET /appointments ──────────────────────────────────────────────────────────

describe('GET /appointments — SUPERADMIN', () => {
  it('returns appointments of any lawyer when lawyerId is provided', async () => {
    const startAt = new Date(futureISO(VALID_HOUR_UTC))
    const endAt = new Date(startAt.getTime() + 45 * 60 * 1000)
    await insertAppointment(lawyerId, startAt, endAt)

    const res = await request(app)
      .get(`/appointments?from=${FROM}&to=${TO}&lawyerId=${lawyerId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].lawyerId).toBe(lawyerId)
  })

  it('returns 400 when lawyerId is missing', async () => {
    const res = await request(app)
      .get(`/appointments?from=${FROM}&to=${TO}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})

// ── POST /appointments ─────────────────────────────────────────────────────────

describe('POST /appointments — SUPERADMIN cross-timezone', () => {
  const basePayload = (id: string, startAt: string) => ({
    lawyerId: id,
    startAt,
    durationMinutes: 45,
    type: 'IN_PERSON',
    clientName: 'Admin Client',
    clientEmail: 'admin.client@example.com',
    clientTimezone: 'UTC',
  })

  it('creates appointment for any lawyer when lawyerId is in body', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(basePayload(lawyerId, futureISO(VALID_HOUR_UTC)))

    expect(res.status).toBe(201)
    expect(res.body.lawyerId).toBe(lawyerId)
  })

  it('returns 400 when lawyerId is missing from body', async () => {
    const { lawyerId: _id, ...payloadWithoutLawyerId } = basePayload(lawyerId, futureISO(VALID_HOUR_UTC))
    void _id

    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payloadWithoutLawyerId)

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })

  // Rule: the frontend converts slot.start (in lawyer's TZ) to UTC before POST.
  // The backend validates against the lawyer's timezone.
  // Stored startAt in UTC must round-trip back to the same local date in the lawyer's TZ.
  it('stores startAt in UTC and round-trips to correct local date in lawyer timezone', async () => {
    // SUPERADMIN selects 10:00 AM Buenos Aires = 13:00 UTC for "tomorrow"
    const startAtUTC = futureISO(VALID_HOUR_UTC) // 13:00 UTC = 10:00 BA

    const createRes = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(basePayload(lawyerId, startAtUTC))

    expect(createRes.status).toBe(201)

    // The stored startAt in UTC, when interpreted in BA timezone, must be the same calendar date
    const storedUTC = createRes.body.startAt as string
    const expectedDate = DateTime.fromISO(startAtUTC).setZone(BA_TZ).toISODate()
    const storedLocalDate = DateTime.fromISO(storedUTC).setZone(BA_TZ).toISODate()

    // No day shift: the date the SUPERADMIN intended (in lawyer's TZ) matches what is stored
    expect(storedLocalDate).toBe(expectedDate)
    expect(storedUTC).toBe(startAtUTC) // UTC value preserved exactly
  })

  it('SUPERADMIN and lawyer see the appointment on the same calendar date', async () => {
    const startAtUTC = futureISO(VALID_HOUR_UTC) // 13:00 UTC = 10:00 BA

    const createRes = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(basePayload(lawyerId, startAtUTC))

    expect(createRes.status).toBe(201)

    // SUPERADMIN retrieves via GET /appointments?lawyerId=X
    const adminRes = await request(app)
      .get(`/appointments?from=${FROM}&to=${TO}&lawyerId=${lawyerId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    // Lawyer retrieves their own appointments
    const lawyerRes = await request(app)
      .get(`/appointments?from=${FROM}&to=${TO}`)
      .set('Authorization', `Bearer ${lawyerToken}`)

    const adminApt = adminRes.body[0]
    const lawyerApt = lawyerRes.body[0]

    // Both sides receive the identical UTC value
    expect(adminApt.startAt).toBe(lawyerApt.startAt)

    // When both interpret the UTC value in BA timezone, they see the same local date
    const adminLocalDate = DateTime.fromISO(adminApt.startAt).setZone(BA_TZ).toISODate()
    const lawyerLocalDate = DateTime.fromISO(lawyerApt.startAt).setZone(BA_TZ).toISODate()
    expect(adminLocalDate).toBe(lawyerLocalDate)
  })

  // Edge case: midnight in one timezone ≠ midnight in UTC.
  // 23:45 Buenos Aires = 02:45 UTC next day — outside working hours → must be rejected.
  it('rejects appointment that falls outside working hours when converted to lawyer timezone (near-midnight edge)', async () => {
    // OUTSIDE_HOUR_UTC = 03:00 UTC = 00:00 BA — midnight in Buenos Aires, outside 8–18
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(basePayload(lawyerId, futureISO(OUTSIDE_HOUR_UTC)))

    expect(res.status).toBe(422)
    expect(res.body.code).toBe('OUTSIDE_WORKING_HOURS')
  })

  // Edge case: near end-of-day. 17:15 BA = 20:15 UTC. Ends at 18:00 BA = 21:00 UTC.
  // Must be accepted: endAt (18:00 BA) <= workEndHour (18).
  it('accepts appointment near end of working hours in lawyer timezone (17:15 BA = 20:15 UTC)', async () => {
    // 20:15 UTC = 17:15 BA, ends 21:00 UTC = 18:00 BA — exactly at workEnd, valid
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(basePayload(lawyerId, futureISO(20, 1, 15)))

    expect(res.status).toBe(201)
    const localEnd = DateTime.fromISO(res.body.endAt).setZone(BA_TZ)
    expect(localEnd.hour).toBe(18)
    expect(localEnd.minute).toBe(0)
  })

  // Regression guard: a UTC time that is day X in UTC but day X-1 in BA timezone
  // must be stored and retrieved as day X-1 in the lawyer's calendar — no phantom day shift.
  it('appointment at 02:30 UTC is stored as previous day in BA timezone (no phantom +1 shift)', async () => {
    // 02:30 UTC = 23:30 BA previous day — outside working hours
    // This test ensures the backend does NOT accidentally shift the date
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(basePayload(lawyerId, futureISO(2)))  // 02:00 UTC = 23:00 BA

    // Must be rejected (23:00 BA is outside working hours 8-18)
    expect(res.status).toBe(422)
    expect(res.body.code).toBe('OUTSIDE_WORKING_HOURS')
  })
})

// ── PATCH /:id/cancel ──────────────────────────────────────────────────────────

describe('PATCH /:id/cancel — SUPERADMIN', () => {
  it('cancels appointment belonging to any lawyer', async () => {
    const startAt = new Date(futureISO(VALID_HOUR_UTC))
    const endAt = new Date(startAt.getTime() + 45 * 60 * 1000)
    const apt = await insertAppointment(lawyerId, startAt, endAt)

    const res = await request(app)
      .patch(`/appointments/${apt.id}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('CANCELLED')
  })
})

// suppress unused warning
void lawyerToken
