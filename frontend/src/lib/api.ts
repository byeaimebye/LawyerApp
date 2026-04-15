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
