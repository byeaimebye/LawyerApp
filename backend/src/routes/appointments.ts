import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { listAppointmentsSchema } from '../schemas/appointments.js'
import { listAppointments } from '../services/appointmentsService.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req: Request, res: Response) => {
  const parsed = listAppointmentsSchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query params', code: 'VALIDATION_ERROR' })
    return
  }

  const { from, to, includeCancelled } = parsed.data
  const appointments = await listAppointments({
    lawyerId: req.user!.userId,
    from,
    to,
    includeCancelled,
  })

  res.json(appointments)
})

export default router
