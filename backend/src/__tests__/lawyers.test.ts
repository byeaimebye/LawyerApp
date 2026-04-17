import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { cleanDb, seedLawyer, seedSuperAdmin, tokenFor } from './setup.js'

let adminToken = ''
let lawyerToken = ''

beforeEach(async () => {
  await cleanDb()
  const admin = await seedSuperAdmin()
  adminToken = tokenFor(admin)

  const lawyer = await seedLawyer({ email: 'lawyer@test.com' })
  lawyerToken = tokenFor(lawyer)

  // Seed a second lawyer so the list is non-trivial
  await seedLawyer({ email: 'lawyer2@test.com', name: 'Lawyer Two' })
})

describe('GET /lawyers', () => {
  it('returns list of lawyers for SUPERADMIN', async () => {
    const res = await request(app)
      .get('/lawyers')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(2)
    expect(res.body[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
      timezone: expect.any(String),
      workStartHour: expect.any(Number),
      workEndHour: expect.any(Number),
    })
  })

  it('does not include SUPERADMIN in the list', async () => {
    const res = await request(app)
      .get('/lawyers')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    const emails = res.body.map((u: { email: string }) => u.email)
    expect(emails).not.toContain('admin@test.com')
  })

  it('returns 403 for LAWYER role', async () => {
    const res = await request(app)
      .get('/lawyers')
      .set('Authorization', `Bearer ${lawyerToken}`)

    expect(res.status).toBe(403)
    expect(res.body.code).toBe('FORBIDDEN')
  })
})
