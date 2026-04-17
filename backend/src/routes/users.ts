import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req: Request, res: Response) => {
  if (req.user!.role !== 'SUPERADMIN') {
    res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' })
    return
  }

  const lawyers = await prisma.user.findMany({
    where: { role: 'LAWYER' },
    select: {
      id: true,
      name: true,
      email: true,
      timezone: true,
      workStartHour: true,
      workEndHour: true,
    },
  })

  res.json(lawyers)
})

export default router
