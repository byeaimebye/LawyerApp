# TKT-03 · Endpoint de login

**Épica:** 1 — Autenticación
**Estado:** done
**Depende de:** TKT-02
**Estimación:** S

## Objetivo
Exponer `POST /auth/login` que valide credenciales y devuelva un JWT.

## Detalles técnicos
- Ruta: `POST /auth/login`
- Body: `{ email: string, password: string }`, validado con zod.
- Compara password contra `passwordHash` con `bcrypt.compare`.
- Si es válido, firma JWT con payload:
  `{ userId, email, role, timezone }`, expiración 8h.
- Secreto leído de `process.env.JWT_SECRET`.
- Responde `200 { token, user: { id, email, name, role, timezone, workStartHour, workEndHour } }`.
- Si inválido: `401 { error: "Invalid credentials" }`.

## Criterios de aceptación
- [ ] Login con credenciales correctas devuelve 200 + token.
- [ ] Login con password incorrecto devuelve 401.
- [ ] Login con email inexistente devuelve 401 (no revelar qué falló).
- [ ] Body inválido (sin email o password) devuelve 400.
- [ ] JWT decodificable contiene los campos esperados.

## Archivos a tocar
- `backend/src/routes/auth.ts` (crear)
- `backend/src/lib/jwt.ts` (crear — helpers sign/verify)
- `backend/src/index.ts` (modificar — registrar router)
- `backend/src/schemas/auth.ts` (crear — zod schemas)

## Notas
- No implementar refresh tokens (fuera de alcance).
- No agregar rate limiting (mencionable como next step).