import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'
import { signToken } from '../lib/jwt.js'
import { loginSchema } from '../schemas/auth.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', code: 'VALIDATION_ERROR' })
    return
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    timezone: user.timezone,
  })

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      timezone: user.timezone,
      workStartHour: user.workStartHour,
      workEndHour: user.workEndHour,
    },
  })
})

router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user })
})

export default router
