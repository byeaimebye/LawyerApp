import { z } from 'zod'

export const listAppointmentsSchema = z.object({
  from: z.string().datetime({ message: 'from must be a valid ISO 8601 date' }),
  to: z.string().datetime({ message: 'to must be a valid ISO 8601 date' }),
  includeCancelled: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  lawyerId: z.string().uuid().optional(),
})

export type ListAppointmentsInput = z.infer<typeof listAppointmentsSchema>

export const createAppointmentSchema = z.object({
  lawyerId: z.string().uuid().optional(),
  startAt: z.string().datetime({ message: 'startAt must be a valid ISO 8601 UTC datetime' }),
  durationMinutes: z.literal(45, {
    errorMap: () => ({ message: 'durationMinutes must be 45' }),
  }),
  type: z.enum(['IN_PERSON', 'VIDEO', 'PHONE'], {
    errorMap: () => ({ message: 'type must be IN_PERSON, VIDEO, or PHONE' }),
  }),
  clientName: z.string().min(1, 'clientName is required'),
  clientEmail: z.string().email('clientEmail must be a valid email'),
  clientTimezone: z.string().min(1, 'clientTimezone is required'),
  locationOrLink: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
