import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fontanella_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Appointment {
  id: string
  lawyerId: string
  clientName: string
  clientEmail: string
  clientTimezone: string
  type: 'IN_PERSON' | 'VIDEO' | 'PHONE'
  startAt: string
  endAt: string
  durationMinutes: number
  status: 'SCHEDULED' | 'CANCELLED'
  locationOrLink: string | null
  notes: string | null
  createdAt: string
}

export async function getAppointments(from: string, to: string): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>('/appointments', {
    params: { from, to },
  })
  return data
}

export interface CreateAppointmentPayload {
  startAt: string
  durationMinutes: 45
  type: 'IN_PERSON' | 'VIDEO' | 'PHONE'
  clientName: string
  clientEmail: string
  clientTimezone: string
  locationOrLink?: string
  notes?: string
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  const { data } = await api.post<Appointment>('/appointments', payload)
  return data
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(`/appointments/${id}/cancel`)
  return data
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('fontanella_token')
      localStorage.removeItem('fontanella_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
