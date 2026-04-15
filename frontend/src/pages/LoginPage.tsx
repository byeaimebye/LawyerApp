import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (loading) return

    setLoading(true)

    try {
      await login(email, password)
      navigate('/calendar', { replace: true })
    } catch {
      setError('Credenciales inválidas. Verificá tu email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value)
    if (error) setError(null)
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value)
    if (error) setError(null)
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Fontanella
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Gestión de citas legales
        </Typography>

        <Paper sx={{ p: 4, width: '100%' }} elevation={3}>
          <Typography variant="h6" mb={2}>
            Iniciar sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
            />

            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}