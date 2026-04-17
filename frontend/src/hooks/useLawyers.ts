import { useQuery } from '@tanstack/react-query'
import { getLawyers } from '../lib/api'

export function useLawyers(enabled: boolean) {
  return useQuery({
    queryKey: ['lawyers'],
    queryFn: getLawyers,
    enabled,
  })
}
