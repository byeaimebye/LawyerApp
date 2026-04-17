# TKT-18 · SUPERADMIN: autorización y visibilidad en backend

**Épica:** 6 — SUPERADMIN
**Estado:** pending
**Depende de:** TKT-17
**Estimación:** M

## Objetivo
Actualizar los endpoints de appointments para que SUPERADMIN pueda
ver, crear y cancelar citas de cualquier abogado. Agregar endpoint
de listado de abogados para el frontend picker.

## Detalles técnicos

### GET /lawyers (nuevo)
- Nuevo router `backend/src/routes/users.ts`.
- Requiere auth. Solo accesible por SUPERADMIN (devuelve 403 si role != SUPERADMIN).
- Devuelve array de `{ id, name, email, timezone, workStartHour, workEndHour }`
  para todos los users con `role = LAWYER`.
- Registrar en `src/index.ts` como `app.use('/lawyers', lawyersRouter)`.

### GET /appointments
- Si `req.user.role === 'SUPERADMIN'`: usar `lawyerId` del query param
  (requerido — devolver 400 si no se provee).
- Si `req.user.role === 'LAWYER'`: comportamiento actual (ignora query param).
- Agregar `lawyerId` como campo opcional al `listAppointmentsSchema`.

### POST /appointments
- Agregar campo opcional `lawyerId` al `createAppointmentSchema`.
- En la ruta: si SUPERADMIN, usar `lawyerId` del body (requerido — 400 si falta);
  si LAWYER, usar `req.user.userId` (ignorar body.lawyerId).

### PATCH /:id/cancel
- En `cancelAppointment` service: si `isSuperAdmin === true`, omitir
  la verificación `appointment.lawyerId !== lawyerId`.
- Pasar `isSuperAdmin: boolean` al service desde la ruta.

## Criterios de aceptación
- [ ] `GET /lawyers` devuelve la lista correcta para SUPERADMIN, 403 para LAWYER.
- [ ] `GET /lawyers` no incluye al SUPERADMIN en la lista.
- [ ] `GET /appointments?lawyerId=X` retorna citas de X cuando lo pide SUPERADMIN.
- [ ] `GET /appointments` sin lawyerId devuelve 400 para SUPERADMIN.
- [ ] `POST /appointments` con `lawyerId` en body crea cita para ese abogado.
- [ ] `PATCH /:id/cancel` cancela cualquier cita si el caller es SUPERADMIN.
- [ ] Las restricciones de solapamiento y horario laboral siguen aplicando.

## Archivos a tocar
- `backend/src/routes/users.ts` (crear)
- `backend/src/index.ts` (registrar nuevo router)
- `backend/src/routes/appointments.ts`
- `backend/src/schemas/appointments.ts`
- `backend/src/services/appointmentsService.ts`

## Notas
- No hardcodear strings de rol; comparar contra `req.user.role`.
- El service `cancelAppointment` recibe `lawyerId` actualmente —
  agregar `isSuperAdmin: boolean` como parámetro adicional.
