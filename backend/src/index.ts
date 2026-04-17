import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import appointmentsRouter from './routes/appointments.js'
import lawyersRouter from './routes/users.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRouter)
app.use('/appointments', appointmentsRouter)
app.use('/lawyers', lawyersRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
