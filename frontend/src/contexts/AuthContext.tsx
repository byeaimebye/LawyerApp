import { createContext, useContext, useState, ReactNode } from 'react'
import { api } from '../lib/api'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  timezone: string
  workStartHour: number
  workEndHour: number
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadFromStorage(): { user: AuthUser | null; token: string | null } {
  try {
    const token = localStorage.getItem('fontanella_token')
    const raw = localStorage.getItem('fontanella_user')
    const user = raw ? (JSON.parse(raw) as AuthUser) : null
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, token }, setAuth] = useState(loadFromStorage)

  async function login(email: string, password: string) {
    const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    })
    localStorage.setItem('fontanella_token', data.token)
    localStorage.setItem('fontanella_user', JSON.stringify(data.user))
    setAuth({ token: data.token, user: data.user })
  }

  function logout() {
    localStorage.removeItem('fontanella_token')
    localStorage.removeItem('fontanella_user')
    setAuth({ token: null, user: null })
  }

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
