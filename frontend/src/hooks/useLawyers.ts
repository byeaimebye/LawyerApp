import { useQuery } from '@tanstack/react-query'
import { getLawyers } from '../lib/api'

export function useLawyers() {
  return useQuery({
    queryKey: ['lawyers'],
    queryFn: getLawyers,
  })
}
