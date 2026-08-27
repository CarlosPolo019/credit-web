# AGENTS.md

Guia operativa para agentes que trabajen en `credit-web`.

## Mapa Rapido
- Stack: React 18, Vite, JavaScript, MUI, React Router.
- SPA sin `src`; la app vive en `main.jsx`, `app/`, `auth/`, `api/`, `lib/`, `ui/`, `pages/`.
- Rutas: `/login` publica; `/credits`, `/credits/:id` protegidas por `ProtectedRoute`; `/dashboard`, `/email-jobs`, `/clients` y `/users` protegidas por `ProtectedRoute` + `AdminRoute` (solo `role: "ADMIN"`, hoy unicamente `900100001`).
- API: solo REST contra Spring Boot mediante `api/client.js`.
- Sesion: JWT en `localStorage` (necesario para que enlaces abiertos en pestaña nueva, como el del correo de crédito, reutilicen la sesión), limpieza en logout y en `401`. `state.user.role` viaja en el JWT/sesion, controla que ve el sidebar y las rutas de admin.
- Dominio activo: registro y consulta de creditos (con autocomplete de cliente por cedula, `GET /api/v1/clients`), directorio de clientes de solo lectura.

## Protocolo De Inicio
1. Ejecutar `pwd` y confirmar que estas en `credit-web`.
2. Revisar `git status --short --branch` si existe `.git`.
3. Leer este archivo, `README.md`, `document/module-map.md` y el README de la vista afectada.
4. Cargar la skill local aplicable si existe en `.codex/skills/**/SKILL.md`.
5. Buscar usos con `rg` antes de modificar componentes, servicios o contratos.

## Protocolo De Cierre
1. Ejecutar lint, tests y build.
2. Confirmar que no hay `.ts/.tsx` propios fuera de dependencias/build.
3. Actualizar README de vista, `document/**` y skill local si cambio el flujo.
4. Revisar que `.env`, `dist/` y `node_modules/` no esten staged.
5. Crear commit Conventional Commit por checkpoint funcional.

## Politica De Verificacion Visual
- No instalar Playwright/Chromium ni levantar un navegador headless para verificar cambios de UI: el usuario aporta sus propias capturas de pantalla cuando las necesita.
- Verificar cambios de UI con `npm run lint`, `npm test`, `npm run build` y, si aplica, pidiendo el `dev` server transforme los modulos tocados (`curl` a cada ruta modificada) para detectar errores de compilacion/import.
- Si el usuario pide explicitamente una verificacion visual en navegador, ahi si se puede instalar y usar Playwright; no hacerlo por iniciativa propia porque consume tiempo y ancho de banda innecesarios.

## Protocolo De Subagentes
Cada subagente debe declarar:
- `Scope`
- `Files owned`
- `Files read-only`
- `Deliverable`
- `Validation command`

Reglas:
- No solapar ownership entre subagentes.
- El agente principal integra cambios, resuelve conflictos y hace commits.
- Cerrar subagentes al terminar.

## Convenciones
- JavaScript-only estricto: no crear `.ts` ni `.tsx`.
- Componentes React en `.jsx`; servicios/helpers en `.js`.
- No acceder a Firestore ni Mailgun desde web.
- No guardar secretos en frontend; solo `VITE_API_BASE_URL` puede configurarse.
- Los filtros y sort deben usar allowlist compatible con backend: `createdAt`, `amount`, `asc`, `desc`.
- Mantener UI alineada con MUI y los componentes locales en `ui/`.

## Documentacion Obligatoria
- Cambios de arquitectura/rutas: actualizar `document/overview.md` y `document/module-map.md`.
- Cambios de API cliente: actualizar `document/api.md`.
- Cambios de sesion/auth: actualizar `document/security.md` y `pages/login/README.md`.
- Cambios de creditos: actualizar `pages/credits/README.md`.
- Cambios de clientes o roles/permisos: actualizar `pages/clients/README.md` y `document/security.md`.
- Cambios de creación de usuarios/comerciales de prueba: actualizar `pages/users/README.md` y `document/security.md`.
- Cambios del dashboard agregado: actualizar `pages/dashboard/README.md`, `document/module-map.md` y `document/security.md`.
- Cambios de despliegue/env: actualizar `README.md`, `.env.example` y `document/deployment.md`.
- Cambios en skills: actualizar `.codex/skills/**/SKILL.md` y `document/agents/commit-guide.md` si afecta el flujo de agentes.

## Comandos
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm test`
- `npm run build`

## Git Checkpoints
- Primer commit sugerido: `chore: bootstrap credit web`.
- Commit documental sugerido: `docs: add web agent documentation canon`.

## Definition Of Done
- Login funciona contra `/api/v1/auth/login`.
- `/credits` registra y lista creditos activos.
- Filtros, ordenamiento, loading, empty, error, success y sesion expirada funcionan.
- Lint, tests y build pasan.
- No hay `.ts/.tsx` propios fuera de dependencias/build.
- README, `document/**`, README de vista y `.env.example` estan sincronizados.
