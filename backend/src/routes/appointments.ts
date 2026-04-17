import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { listAppointmentsSchema, createAppointmentSchema } from '../schemas/appointments.js'
import { listAppointments, createAppointment, cancelAppointment } from '../services/appointmentsService.js'

const router = Router()

router.use(requireAuth)

router.get('/', async (req: Request, res: Response) => {
  const parsed = listAppointmentsSchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query params', code: 'VALIDATION_ERROR' })
    return
  }

  const { from, to, includeCancelled, lawyerId: queryLawyerId } = parsed.data

  let lawyerId: string
  if (req.user!.role === 'SUPERADMIN') {
    if (!queryLawyerId) {
      res.status(400).json({ error: 'lawyerId query param is required for SUPERADMIN', code: 'VALIDATION_ERROR' })
      return
    }
    lawyerId = queryLawyerId
  } else {
    lawyerId = req.user!.userId
  }

  const appointments = await listAppointments({
    lawyerId,
    from,
    to,
    includeCancelled,
  })

  res.json(appointments)
})

router.post('/', async (req: Request, res: Response) => {
  const parsed = createAppointmentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.errors[0]?.message ?? 'Invalid request body',
      code: 'VALIDATION_ERROR',
    })
    return
  }

  let lawyerId: string
  if (req.user!.role === 'SUPERADMIN') {
    if (!parsed.data.lawyerId) {
      res.status(400).json({ error: 'lawyerId is required in body for SUPERADMIN', code: 'VALIDATION_ERROR' })
      return
    }
    lawyerId = parsed.data.lawyerId
  } else {
    lawyerId = req.user!.userId
  }

  try {
    const appointment = await createAppointment({
      lawyerId,
      ...parsed.data,
    })
    res.status(201).json(appointment)
  } catch (err: unknown) {
    const e = err as { status?: number; error?: string; code?: string }
    if (e.status) {
      res.status(e.status).json({ error: e.error, code: e.code })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

router.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const appointment = await cancelAppointment({
      appointmentId: req.params.id,
      lawyerId: req.user!.userId,
      isSuperAdmin: req.user!.role === 'SUPERADMIN',
    })
    res.json(appointment)
  } catch (err: unknown) {
    const e = err as { status?: number; error?: string; code?: string }
    if (e.status) {
      res.status(e.status).json({ error: e.error, code: e.code })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

export default router
