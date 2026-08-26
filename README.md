# Credit Web

React web admin for the Fya credit technical test.

## Stack
- React 18.3.1
- Vite
- JavaScript only
- MUI
- React Router

This app intentionally does not use TypeScript and does not access Firestore directly.

## Install
```bash
npm install
```

## Environment
Copy `.env.example` and set:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Run
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Documentacion Operativa
- `AGENTS.md`: reglas para agentes y mantenimiento.
- `document/overview.md`: arquitectura de la SPA.
- `document/module-map.md`: inventario canonico de vistas/modulos.
- `document/api.md`: contrato REST usado por web.
- `document/security.md`: JWT, storage y rutas protegidas.
- `document/testing.md`: comandos y escenarios de prueba.
- `document/deployment.md`: Vercel y `VITE_API_BASE_URL`.
- `document/guia_docs.md`: estandar de README por vista.
- `document/agents/`: playbooks de agentes y commits.
- `pages/login/README.md`: flujo de login.
- `pages/credits/README.md`: flujo de registro/consulta.
- `.codex/skills/`: skills locales para contexto selectivo.

## Test
```bash
npm test
npm run lint
```

## Demo Credentials
Backend defaults to `demo / demo12345` only when no `DEMO_USER_PASSWORD_HASH` is configured.

## Architecture
- `auth/AuthContext.jsx`: JWT session, login/logout, expired session handling.
- `api/client.js`: REST client with Bearer token.
- `pages/credits`: registration and query UI.
- `ui`: reusable MUI wrappers and table.

## Deployment
Vercel is the target platform. Set `VITE_API_BASE_URL` to the deployed Render backend URL and use the provided GitHub Actions workflow with `VERCEL_TOKEN`.
