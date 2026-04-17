import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { getAppointments } from '../lib/api'

export function useAppointments(month: DateTime, lawyerId?: string) {
  const from = month.startOf('month').toUTC().toISO()!
  const to = month.endOf('month').toUTC().toISO()!

  return useQuery({
    queryKey: ['appointments', from, to, lawyerId],
    queryFn: () => getAppointments(from, to, lawyerId),
  })
}
