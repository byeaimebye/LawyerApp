# TKT-16 · CI con GitHub Actions

**Épica:** 5 — CI/CD y documentación
**Estado:** done
**Depende de:** TKT-01
**Estimación:** S

## Objetivo
Configurar un workflow de GitHub Actions que corra lint y build en cada
PR y push a `main`, para validar que el código compila antes de deployar.

## Detalles técnicos
- Archivo `.github/workflows/ci.yml`.
- Triggers: `pull_request` y `push` a `main`.
- Dos jobs paralelos: `frontend` y `backend`.
- Cada job:
  - Checkout.
  - Setup Node 20.
  - Cache de `node_modules` (via `actions/setup-node` con `cache: npm`).
  - `npm ci` en la carpeta correspondiente.
  - `npm run lint`.
  - `npm run build`.
  - (Backend) `npx prisma generate`.
- Opcional: step de `npm test` (que no falle si no hay tests).
- Protección de branch `main` en Settings → Branches:
  - Requiere que CI pase antes de mergear.

## Criterios de aceptación
- [ ] Workflow corre al abrir un PR.
- [ ] Workflow corre al pushear a `main`.
- [ ] Jobs de frontend y backend corren en paralelo.
- [ ] Lint o build rotos hacen fallar el workflow.
- [ ] Badge de CI agregado al README (en TKT-17).
- [ ] Branch `main` protegida: no se puede mergear con CI roja.

## Archivos a tocar
- `.github/workflows/ci.yml` (crear)

## Notas
- No ejecutar migraciones ni conectar a DB en CI: solo validación estática y build.
- Mantener el workflow simple; se puede extender con tests y deploy en el futuro.