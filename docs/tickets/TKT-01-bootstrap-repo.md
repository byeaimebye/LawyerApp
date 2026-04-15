# TKT-01 · Bootstrap del repositorio

**Épica:** 0 — Setup
**Estado:** pending
**Depende de:** ninguno
**Estimación:** S

## Objetivo
Dejar la estructura base del monorepo funcionando, con frontend y backend
inicializados y corriendo en local.

## Detalles técnicos
- Monorepo con dos carpetas: `/frontend` y `/backend`.
- Frontend: Vite + React + TypeScript. Agregar MUI, MUI X Date Pickers, luxon, axios, react-query, react-router-dom.
- Backend: Node + Express + TypeScript. Agregar prisma, @prisma/client, jsonwebtoken, bcrypt, cors, dotenv, zod, luxon.
- Cada app con su propio `package.json`.
- Prettier y ESLint configurados en ambos.
- `.env.example` en ambos con las variables necesarias documentadas.
- `.gitignore` en la raíz (node_modules, .env, dist, build).
- Carpeta `.github/workflows/` creada vacía (la llena TKT-16).

## Criterios de aceptación
- [ ] `cd frontend && npm run dev` levanta Vite en localhost.
- [ ] `cd backend && npm run dev` levanta Express con tsx/nodemon y responde `GET /health` → 200.
- [ ] Lint corre sin errores en ambos (`npm run lint`).
- [ ] `.env.example` existe en ambos con placeholders.
- [ ] Primer commit hecho con mensaje `chore: bootstrap monorepo`.

## Archivos a tocar
- `frontend/package.json` (crear)
- `frontend/vite.config.ts` (crear)
- `frontend/tsconfig.json` (crear)
- `frontend/src/main.tsx` (crear)
- `frontend/src/App.tsx` (crear)
- `frontend/.env.example` (crear) — `VITE_API_URL=http://localhost:3001`
- `backend/package.json` (crear)
- `backend/tsconfig.json` (crear)
- `backend/src/index.ts` (crear, con endpoint `/health`)
- `backend/.env.example` (crear) — `DATABASE_URL=`, `JWT_SECRET=`, `CORS_ORIGIN=http://localhost:5173`, `PORT=3001`
- `.gitignore` (crear en raíz)
- `.github/workflows/` (crear carpeta vacía)

## Notas
- No configurar routing ni MUI theme todavía: eso va en tickets posteriores.
- No inicializar Prisma aún (va en TKT-02).
- No agregar librerías más allá de las listadas.