import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
