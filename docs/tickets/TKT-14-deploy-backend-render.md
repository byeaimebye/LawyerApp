# TKT-14 · Deploy del backend en Render

**Épica:** 4 — Deploy
**Estado:** pending
**Depende de:** TKT-13
**Estimación:** M

## Objetivo
Deployar la API en Render con auto-deploy desde la branch `main`.

## Detalles técnicos
- Crear cuenta en Render.
- Crear Web Service conectado al repo de GitHub.
- **Root Directory:** `backend`.
- **Build Command:** `npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`.
- **Start Command:** `npm start`.
- Env vars:
  - `DATABASE_URL` (Neon)
  - `JWT_SECRET` (generar uno largo y random)
  - `CORS_ORIGIN` (URL pública del frontend — se completa en TKT-15)
  - `NODE_ENV=production`
- Auto-deploy desde `main` activado.
- Health check path: `/health`.

## Criterios de aceptación
- [ ] API accesible en URL pública provista por Render.
- [ ] `GET /health` responde 200.
- [ ] `POST /auth/login` contra la URL pública funciona.
- [ ] Push a `main` dispara redeploy automático.
- [ ] Logs visibles en Render dashboard.

## Archivos a tocar
- `backend/package.json` (verificar scripts `build` y `start` correctos)
- README (en TKT-17)

## Notas
- Render free duerme a los 15 min de inactividad; primer request post-sueño tarda ~30s.
  Documentar esto en README y hacer warm-up antes de la demo.
- Si el backend no compila: revisar que `tsc` esté instalado como devDep y que `npm ci` lo instale (NODE_ENV no debe ser production durante build, Render lo maneja).