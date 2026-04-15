# TKT-09 · Endpoint de creación de cita

**Épica:** 3 — Gestión de citas
**Estado:** pending
**Depende de:** TKT-06
**Estimación:** M

## Objetivo
Exponer `POST /appointments` que cree una cita con validación completa
(solapamiento, duración, horario laboral, no en el pasado).

## Detalles técnicos
- Ruta: `POST /appointments`.
- Protegida con `requireAuth`.
- Body (zod):
  ```
  {
    startAt: string (ISO UTC),
    durationMinutes: 30 | 60 | 120,
    type: 'IN_PERSON' | 'VIDEO' | 'PHONE',
    clientName: string,
    clientEmail: string (email),
    clientTimezone: string (IANA),
    locationOrLink?: string,
    notes?: string
  }
  ```
- `endAt = startAt + durationMinutes`.
- `lawyerId = req.user.userId`.
- Validaciones (en orden):
  1. `startAt` no en el pasado → 400.
  2. `startAt`/`endAt` dentro del horario laboral del abogado (convertir a su TZ) → 422.
  3. No solapa con citas SCHEDULED existentes → 409.
- Si pasa, crear cita con status SCHEDULED, devolver 201 con la cita.

## Criterios de aceptación
- [ ] Creación válida devuelve 201 + cita.
- [ ] Solapamiento devuelve 409 con mensaje claro.
- [ ] Duración inválida (ej. 45) devuelve 400.
- [ ] Cita fuera del horario laboral devuelve 422.
- [ ] Cita en el pasado devuelve 400.
- [ ] Sin token devuelve 401.

## Archivos a tocar
- `backend/src/routes/appointments.ts` (modificar)
- `backend/src/services/appointmentsService.ts` (modificar — agregar `create`)
- `backend/src/utils/overlap.ts` (crear — query helper)
- `backend/src/utils/workingHours.ts` (crear — validación con luxon)
- `backend/src/schemas/appointments.ts` (modificar)

## Notas
- La lógica de solapamiento y de horario laboral son las piezas críticas.
- Candidatas naturales a tests unitarios (ver TKT-16 / next steps).
- El timezone del cliente se guarda pero NO se usa para validar (solo para mostrar).