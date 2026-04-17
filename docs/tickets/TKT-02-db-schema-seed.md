# TKT-02 · Schema de DB + seed

**Épica:** 0 — Setup
**Estado:** done
**Depende de:** TKT-01
**Estimación:** M

## Objetivo
Inicializar Prisma, definir el schema (User, Appointment + enums),
correr la migración inicial y cargar un seed con 2 abogados en distintas TZ.

## Detalles técnicos
- Inicializar Prisma en `/backend`: `npx prisma init`.
- Schema según `docs/data-model.md`.
- Cliente Prisma generado en `backend/src/lib/prisma.ts` (singleton).
- Seed en `backend/prisma/seed.ts`:
  - Abogado 1: `ana@fontanella.com` / password `demo1234`, TZ `America/Argentina/Buenos_Aires`, work 8–18.
  - Abogado 2: `john@fontanella.com` / password `demo1234`, TZ `Europe/London`, work 9–17.
  - Password hasheado con bcrypt.
- Configurar `package.json` de backend con script `prisma:seed`.

## Criterios de aceptación
- [ ] `npx prisma migrate dev --name init` crea la DB con las tablas.
- [ ] `npx prisma db seed` carga los dos abogados.
- [ ] `npx prisma studio` muestra los datos.
- [ ] Variables de entorno `DATABASE_URL` documentadas en `.env.example`.

## Archivos a tocar
- `backend/prisma/schema.prisma` (crear)
- `backend/prisma/seed.ts` (crear)
- `backend/src/lib/prisma.ts` (crear)
- `backend/package.json` (modificar: agregar `prisma.seed` command)
- `backend/.env.example` (modificar si hace falta)

## Notas
- Para desarrollo local se puede usar Postgres en Docker o una DB de Neon dev.
- No crear todavía índices adicionales más allá del que está en `data-model.md`.
- No implementar repositorios ni servicios; solo schema + seed.