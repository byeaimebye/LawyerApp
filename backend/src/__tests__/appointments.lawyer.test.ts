import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import {
  cleanDb,
  seedLawyer,
  tokenFor,
  futureISO,
  insertAppointment,
} from './setup.js'

// Lawyer timezone: America/Argentina/Buenos_Aires (UTC-3)
// 13:00 UTC = 10:00 AM Buenos Aires → within 08:00–18:00 ✓
// 03:00 UTC = 00:00 AM Buenos Aires → outside 08:00–18:00 ✗
const VALID_HOUR_UTC = 13
const OUTSIDE_HOUR_UTC = 3

let lawyerToken = ''
let lawyerId = ''
let otherToken = ''
let otherId = ''

const FROM = new Date(Date.now() - 86400000).toISOString() // yesterday
const TO = new Date(Date.now() + 30 * 86400000).toISOString() // 30 days ahead

beforeEach(async () => {
  await cleanDb()
  const lawyer = await seedLawyer({ email: 'lawyer@test.com' })
  lawyerToken = tokenFor(lawyer)
  lawyerId = lawyer.id

  const other = await seedLawyer({ email: 'other@test.com', name: 'Other Lawyer' })
  otherToken = tokenFor(other)
  otherId = other.id
})

// ── GET /appointments ──────────────────────────────────────────────────────────

describe('GET /appointments — LAWYER', () => {
  it('returns only own appointments', async () => {
    const s1 = new Date(futureISO(VALID_HOUR_UTC))
    await insertAppointment(lawyerId, s1, new Date(s1.getTime() + 45 * 60 * 1000))
    const s2 = new Date(futureISO(VALID_HOUR_UTC, 2))
    await insertAppointment(otherId, s2, new Date(s2.getTime() + 45 * 60 * 1000))

    const res = await request(app)
      .get(`/appointments?from=${FROM}&to=${TO}`)
      .set('Authorization', `Bearer ${lawyerToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].lawyerId).toBe(lawyerId)
  })

  it('does not return appointments from other lawyers', async () => {
    const s = new Date(futureISO(VALID_HOUR_UTC))
    await insertAppointment(otherId, s, new Date(s.getTime() + 45 * 60 * 1000))

    const res = await request(app)
      .get(`/appointments?from=${FROM}&to=${TO}`)
      .set('Authorization', `Bearer ${lawyerToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })
})

// ── POST /appointments ─────────────────────────────────────────────────────────

describe('POST /appointments — LAWYER', () => {
  const validPayload = () => ({
    startAt: futureISO(VALID_HOUR_UTC),
    durationMinutes: 45,
    type: 'IN_PERSON',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientTimezone: 'UTC',
  })

  it('creates a valid appointment', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send(validPayload())

    expect(res.status).toBe(201)
    expect(res.body.lawyerId).toBe(lawyerId)
    expect(res.body.status).toBe('SCHEDULED')
  })

  it('rejects appointment in the past (400 PAST_DATE)', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({ ...validPayload(), startAt: '2020-01-01T13:00:00.000Z' })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('PAST_DATE')
  })

  it('rejects appointment outside working hours (422)', async () => {
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({ ...validPayload(), startAt: futureISO(OUTSIDE_HOUR_UTC) })

    expect(res.status).toBe(422)
    expect(res.body.code).toBe('OUTSIDE_WORKING_HOURS')
  })

  it('rejects overlapping appointment (409 OVERLAP)', async () => {
    const slot = futureISO(VALID_HOUR_UTC)
    // First appointment
    await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({ ...validPayload(), startAt: slot })

    // Same slot again
    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({ ...validPayload(), startAt: slot })

    expect(res.status).toBe(409)
    expect(res.body.code).toBe('OVERLAP')
  })
})

// ── PATCH /:id/cancel ──────────────────────────────────────────────────────────

describe('PATCH /:id/cancel — LAWYER', () => {
  it('cancels own appointment', async () => {
    const startAt = new Date(futureISO(VALID_HOUR_UTC))
    const endAt = new Date(startAt.getTime() + 45 * 60 * 1000)
    const apt = await insertAppointment(lawyerId, startAt, endAt)

    const res = await request(app)
      .patch(`/appointments/${apt.id}/cancel`)
      .set('Authorization', `Bearer ${lawyerToken}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('CANCELLED')
  })

  it('returns 403 when cancelling another lawyer\'s appointment', async () => {
    const startAt = new Date(futureISO(VALID_HOUR_UTC))
    const endAt = new Date(startAt.getTime() + 45 * 60 * 1000)
    const apt = await insertAppointment(otherId, startAt, endAt)

    const res = await request(app)
      .patch(`/appointments/${apt.id}/cancel`)
      .set('Authorization', `Bearer ${lawyerToken}`)

    expect(res.status).toBe(403)
    expect(res.body.code).toBe('FORBIDDEN')
  })

  it('returns 409 when cancelling already cancelled appointment', async () => {
    const startAt = new Date(futureISO(VALID_HOUR_UTC))
    const endAt = new Date(startAt.getTime() + 45 * 60 * 1000)
    const apt = await insertAppointment(lawyerId, startAt, endAt, 'CANCELLED')

    const res = await request(app)
      .patch(`/appointments/${apt.id}/cancel`)
      .set('Authorization', `Bearer ${lawyerToken}`)

    expect(res.status).toBe(409)
    expect(res.body.code).toBe('ALREADY_CANCELLED')
  })

  it('returns 400 when cancelling a past appointment', async () => {
    const pastStart = new Date(Date.now() - 2 * 3600 * 1000) // 2 hours ago
    const pastEnd = new Date(pastStart.getTime() + 45 * 60 * 1000)
    const apt = await insertAppointment(lawyerId, pastStart, pastEnd)

    const res = await request(app)
      .patch(`/appointments/${apt.id}/cancel`)
      .set('Authorization', `Bearer ${lawyerToken}`)

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('PAST_DATE')
  })
})

// suppress unused warning
void otherToken
