import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import {
  cleanDb,
  seedLawyer,
  seedSuperAdmin,
  tokenFor,
  futureISO,
  insertAppointment,
} from './setup.js'

const VALID_HOUR_UTC = 13

let adminToken = ''
let lawyerId = ''
let lawyerToken = ''

const FROM = new Date(Date.now() - 86400000).toISOString()
const TO = new Date(Date.now() + 30 * 86400000).toISOString()

beforeEach(async () => {
  await cleanDb()
  const admin = await seedSuperAdmin()
  adminToken = tokenFor(admin)

  const lawyer = await seedLawyer({ email: 'lawyer@test.com' })
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

describe('POST /appointments — SUPERADMIN', () => {
  const validPayload = (id: string) => ({
    lawyerId: id,
    startAt: futureISO(VALID_HOUR_UTC),
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
      .send(validPayload(lawyerId))

    expect(res.status).toBe(201)
    expect(res.body.lawyerId).toBe(lawyerId)
  })

  it('returns 400 when lawyerId is missing from body', async () => {
    const { lawyerId: _id, ...payloadWithoutLawyerId } = validPayload(lawyerId)
    void _id

    const res = await request(app)
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payloadWithoutLawyerId)

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
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
