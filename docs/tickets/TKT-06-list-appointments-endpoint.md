# TKT-06 · Endpoint listado de citas

**Épica:** 2 — Calendario
**Estado:** pending
**Depende de:** TKT-04
**Estimación:** S

## Objetivo
Exponer `GET /appointments` que devuelva las citas del abogado logueado
en un rango de fechas.

## Detalles técnicos
- Ruta: `GET /appointments?from=ISO&to=ISO&includeCancelled=false`.
- Protegida con `requireAuth`.
- Filtra por `lawyerId = req.user.userId`.
- Filtra `startAt >= from` y `startAt < to`.
- Por defecto excluye `status = CANCELLED`.
- Fechas devueltas en ISO 8601 UTC.
- Valida query params con zod.

## Criterios de aceptación
- [ ] Responde 200 con array de citas del abogado en el rango.
- [ ] Responde 401 sin token.
- [ ] No devuelve citas de otros abogados.
- [ ] Respeta `includeCancelled`.
- [ ] Responde 400 si `from`/`to` no son ISO válidos.

## Archivos a tocar
- `backend/src/routes/appointments.ts` (crear)
- `backend/src/services/appointmentsService.ts` (crear — query a DB)
- `backend/src/schemas/appointments.ts` (crear — zod schemas)
- `backend/src/index.ts` (modificar — registrar router)

## Notas
- No implementar paginación.
- No implementar orden custom: siempre `orderBy: { startAt: 'asc' }`.