# TKT-20 · Tests de integración — cobertura completa de la app

**Épica:** 7 — Calidad
**Estado:** pending
**Depende de:** TKT-19
**Estimación:** L

## Objetivo
Agregar tests de integración que cubran los flujos de negocio principales
de la app — tanto los existentes como los nuevos de SUPERADMIN — usando
una base de datos real de test (no mocks).

## Enfoque
- Framework: **Vitest** en el backend (ya tiene TypeScript configurado).
- Cada test levanta el servidor Express real y usa **supertest** para HTTP.
- DB: Postgres local o Neon en una base separada (`DATABASE_URL_TEST`).
- Setup/teardown: `beforeEach` crea datos mínimos, `afterEach` limpia.
- No mockear Prisma ni la DB — los tests deben validar el comportamiento
  real end-to-end a nivel API.

## Casos a cubrir

### Auth
- [ ] Login con credenciales válidas devuelve token con role correcto.
- [ ] Login con contraseña incorrecta devuelve 401.
- [ ] Request a endpoint protegido sin token devuelve 401.
- [ ] Request con token expirado/inválido devuelve 401.

### Appointments — LAWYER
- [ ] `GET /appointments` devuelve solo las citas propias del abogado.
- [ ] `GET /appointments` no devuelve citas de otros abogados.
- [ ] `POST /appointments` crea una cita válida.
- [ ] `POST /appointments` rechaza cita en el pasado (400 PAST_DATE).
- [ ] `POST /appointments` rechaza cita fuera del horario laboral (422).
- [ ] `POST /appointments` rechaza cita solapada (409 OVERLAP).
- [ ] `PATCH /:id/cancel` cancela una cita propia.
- [ ] `PATCH /:id/cancel` rechaza cancelar cita de otro abogado (403).
- [ ] `PATCH /:id/cancel` rechaza cancelar cita ya cancelada (409).
- [ ] `PATCH /:id/cancel` rechaza cancelar cita pasada (400).

### Appointments — SUPERADMIN
- [ ] `GET /appointments?lawyerId=X` devuelve citas de cualquier abogado.
- [ ] `GET /appointments` sin lawyerId devuelve 400.
- [ ] `POST /appointments` con `lawyerId` en body crea cita para ese abogado.
- [ ] `POST /appointments` sin `lawyerId` devuelve 400.
- [ ] `PATCH /:id/cancel` cancela cita de cualquier abogado.

### Lawyers endpoint
- [ ] `GET /lawyers` devuelve lista de abogados para SUPERADMIN.
- [ ] `GET /lawyers` devuelve 403 para LAWYER.
- [ ] `GET /lawyers` no incluye al SUPERADMIN en la lista.

## Archivos a tocar
- `backend/src/__tests__/auth.test.ts` (crear)
- `backend/src/__tests__/appointments.lawyer.test.ts` (crear)
- `backend/src/__tests__/appointments.superadmin.test.ts` (crear)
- `backend/src/__tests__/lawyers.test.ts` (crear)
- `backend/src/__tests__/setup.ts` (crear — helpers de seed y teardown)
- `backend/package.json` (agregar `vitest`, `supertest`, `@types/supertest`)
- `backend/.env.test` (o variable `DATABASE_URL_TEST` — no commitear)

## Notas
- Configurar `vitest` con `globalSetup` para conectar/desconectar Prisma.
- Usar `upsert` en el setup para garantizar idempotencia entre runs.
- Los tests de solapamiento requieren crear una cita existente primero.
- No testear el frontend en este ticket — el scope es la API REST.
- Si el tiempo apremia, priorizar los casos de autorización
  (403/401/ownership) sobre los happy paths, ya que son los más
  críticos para el challenge.
