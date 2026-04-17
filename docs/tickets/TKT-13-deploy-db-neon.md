# TKT-13 · Deploy de la DB en Neon

**Épica:** 4 — Deploy
**Estado:** done
**Depende de:** TKT-02
**Estimación:** S

## Objetivo
Aprovisionar una base Postgres en Neon (free tier), correr las
migraciones y cargar el seed.

## Detalles técnicos
- Crear cuenta/proyecto en https://neon.tech.
- Crear DB `fontanella` (o similar).
- Copiar `DATABASE_URL` de Neon.
- Configurar variable localmente en `.env` del backend (no commitear).
- Correr `npx prisma migrate deploy` contra Neon.
- Correr seed.

## Criterios de aceptación
- [ ] DB accesible desde la URL provista por Neon.
- [ ] Migraciones aplicadas (tablas User y Appointment existen).
- [ ] Seed cargado (2 abogados visibles en Neon console).
- [ ] `DATABASE_URL` documentada en `.env.example` como placeholder.

## Archivos a tocar
- `backend/.env` (local, no commitear)
- README (al final, en TKT-17)

## Notas
- Neon free tier alcanza de sobra para el challenge.
- Anotar la URL para usarla en TKT-14 (variable de entorno en Render).
- No compartir la URL en el repo ni en la entrevista.