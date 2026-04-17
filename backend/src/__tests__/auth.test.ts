import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { cleanDb, seedLawyer } from './setup.js'

beforeEach(async () => {
  await cleanDb()
  await seedLawyer()
})

describe('POST /auth/login', () => {
  it('returns token and user on valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'lawyer@test.com', password: 'test1234' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('lawyer@test.com')
    expect(res.body.user.role).toBe('LAWYER')
  })

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'lawyer@test.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
    expect(res.body.token).toBeUndefined()
  })

  it('returns 401 on unknown email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@test.com', password: 'test1234' })

    expect(res.status).toBe(401)
  })
})

describe('Protected endpoints without token', () => {
  it('GET /appointments returns 401', async () => {
    const res = await request(app).get('/appointments?from=2026-01-01T00:00:00Z&to=2026-02-01T00:00:00Z')
    expect(res.status).toBe(401)
  })

  it('GET /lawyers returns 401', async () => {
    const res = await request(app).get('/lawyers')
    expect(res.status).toBe(401)
  })
})

describe('Protected endpoints with invalid token', () => {
  it('GET /appointments returns 401', async () => {
    const res = await request(app)
      .get('/appointments?from=2026-01-01T00:00:00Z&to=2026-02-01T00:00:00Z')
      .set('Authorization', 'Bearer invalid.token.here')

    expect(res.status).toBe(401)
  })
})
