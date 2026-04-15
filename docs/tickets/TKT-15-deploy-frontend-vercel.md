# TKT-15 · Deploy del frontend en Vercel

**Épica:** 4 — Deploy
**Estado:** pending
**Depende de:** TKT-14
**Estimación:** S

## Objetivo
Deployar el frontend en Vercel con auto-deploy y preview deploys en PRs.

## Detalles técnicos
- Crear proyecto en Vercel importando el repo.
- **Root Directory:** `frontend`.
- **Framework Preset:** Vite (autodetect).
- Env var: `VITE_API_URL` = URL pública del backend de Render.
- Auto-deploy desde `main` activado.
- Preview deploys en PRs activados (default).
- Una vez que Vercel asigna la URL pública, actualizar `CORS_ORIGIN` en Render con esa URL.

## Criterios de aceptación
- [ ] Frontend accesible en URL pública de Vercel.
- [ ] Login funcional contra el backend de Render (sin errores CORS).
- [ ] Calendario carga citas del seed.
- [ ] Crear una cita end-to-end funciona en prod.
- [ ] PRs generan preview URLs.

## Archivos a tocar
- `frontend/.env.production` (si es necesario — Vercel usa env vars directamente)
- README (en TKT-17)

## Notas
- Si hay errores de CORS: revisar que `CORS_ORIGIN` en Render coincida exactamente con la URL de Vercel (sin barra final).
- Si el build de Vite falla por TS strict: revisar logs de Vercel y corregir.