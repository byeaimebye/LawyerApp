# TKT-17 · SUPERADMIN: enum + migración + seed

**Épica:** 6 — SUPERADMIN
**Estado:** pending
**Depende de:** TKT-02
**Estimación:** S

## Objetivo
Agregar el valor SUPERADMIN al enum Role, correr la migración y crear
el usuario admin en el seed.

## Detalles técnicos
- En `prisma/schema.prisma`: agregar `SUPERADMIN` al enum `Role`.
- Correr `npx prisma migrate dev --name add-superadmin-role`.
- En `prisma/seed.ts`: agregar upsert para `admin@fontanella.com`
  con `role: 'SUPERADMIN'`, `timezone: 'UTC'`,
  `workStartHour: 0`, `workEndHour: 24`.
- Correr el seed contra Neon.

## Criterios de aceptación
- [ ] `prisma migrate deploy` corre sin errores en Neon.
- [ ] `admin@fontanella.com` / `demo1234` existe en la DB con role SUPERADMIN.
- [ ] Login con esas credenciales devuelve un token con `role: "SUPERADMIN"`.

## Archivos a tocar
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts`

## Notas
- `workStartHour`/`workEndHour`/`timezone` del SUPERADMIN son irrelevantes
  para la app pero la tabla los requiere; defaults arbitrarios están bien.
