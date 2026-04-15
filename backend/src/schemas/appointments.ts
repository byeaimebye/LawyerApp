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
