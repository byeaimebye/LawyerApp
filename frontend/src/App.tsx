import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { CalendarPage } from './pages/CalendarPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
