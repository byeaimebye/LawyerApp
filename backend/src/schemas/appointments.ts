import { z } from 'zod'

export const listAppointmentsSchema = z.object({
  from: z.string().datetime({ message: 'from must be a valid ISO 8601 date' }),
  to: z.string().datetime({ message: 'to must be a valid ISO 8601 date' }),
  includeCancelled: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
})

export type ListAppointmentsInput = z.infer<typeof listAppointmentsSchema>

export const createAppointmentSchema = z.object({
  startAt: z.string().datetime({ message: 'startAt must be a valid ISO 8601 UTC datetime' }),
  durationMinutes: z.union([z.literal(30), z.literal(60), z.literal(120)], {
    errorMap: () => ({ message: 'durationMinutes must be 30, 60, or 120' }),
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
