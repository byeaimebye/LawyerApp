import jwt from 'jsonwebtoken'

export interface JwtPayload {
  userId: string
  email: string
  role: string
  timezone: string
}

export function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return jwt.sign(payload, secret, { expiresIn: '8h' })
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return jwt.verify(token, secret) as JwtPayload
}
