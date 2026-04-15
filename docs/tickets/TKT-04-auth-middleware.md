# TKT-04 · Middleware de autenticación

**Épica:** 1 — Autenticación
**Estado:** pending
**Depende de:** TKT-03
**Estimación:** S

## Objetivo
Crear el middleware `requireAuth` que valide el JWT y popule `req.user`
para las rutas protegidas.

## Detalles técnicos
- Middleware lee `Authorization: Bearer <token>`.
- Verifica con `jwt.verify` usando `JWT_SECRET`.
- Si válido: `req.user = { userId, email, role, timezone }` y `next()`.
- Si falta header: `401 { error: "Missing token" }`.
- Si token inválido o expirado: `401 { error: "Invalid token" }`.
- Declarar el tipo `AuthenticatedRequest` en `backend/src/types/express.d.ts`.

## Criterios de aceptación
- [ ] Una ruta de prueba (ej. `GET /me`) protegida con el middleware devuelve 401 sin token.
- [ ] Con token válido devuelve 200 y los datos del user.
- [ ] Con token expirado devuelve 401.
- [ ] TypeScript reconoce `req.user` sin errores.

## Archivos a tocar
- `backend/src/middleware/requireAuth.ts` (crear)
- `backend/src/types/express.d.ts` (crear)
- `backend/src/routes/auth.ts` (modificar — agregar `GET /auth/me` para probar)

## Notas
- No implementar autorización por roles aún (solo LAWYER existe).
- Guardar pattern listo para reutilizar en todos los endpoints de citas.