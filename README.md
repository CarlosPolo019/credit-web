# Credit Web

Panel administrativo en React para la prueba técnica de créditos de Fya Social Capital — los operadores registran/consultan créditos y monitorean las notificaciones por correo.

## Demo En Vivo

No hace falta instalar nada para probar la app — **tanto el frontend como el backend ya están desplegados**:

- **Web**: **[https://fyatest.cmescorcia.com](https://fyatest.cmescorcia.com)**
- **Backend (API)**: `https://fyatest-api.cmescorcia.com` (ya conectado, no hace falta tocarlo)

Credenciales de prueba (usuarios ya sembrados en el backend):

| Cédula | Contraseña | Nombre |
|---|---|---|
| `900100001` | `demo12345` | Carlos Escorcia |
| `900100002` | `demo12345` | Jennifer Navarro |
| `900100003` | `demo12345` | Adriana Castellano |

Con cualquiera de esos usuarios podés entrar, registrar un crédito (con el paso de confirmación y la cuota estimada) y consultar/filtrar la tabla de créditos ya sembrada. La vista `/email-jobs` muestra el estado real de las notificaciones enviadas por correo.

Si preferís correrlo en tu máquina en vez de usar la demo, seguí la sección [Instalación Local](#instalación-local) más abajo.

## Sobre Esta Prueba Técnica

Este repo es **uno de los tres entregables independientes** de la prueba técnica de créditos:

| Repo | Rol | README |
|---|---|---|
| `credit-backend` | API REST, Firestore, JWT, worker de correo | [`../credit-backend/README.md`](../credit-backend/README.md) |
| `credit-web` (este repo) | Panel administrativo (React) para registrar/consultar créditos y monitorear correos | — |
| `credit-mobile` | App Android (React Native) para el comercial en campo | [`../credit-mobile/README.md`](../credit-mobile/README.md) |

## Arquitectura

```mermaid
flowchart LR
  web["credit-web<br/>React admin"] -->|REST + JWT| api["credit-backend<br/>Spring Boot"]
  mobile["credit-mobile<br/>React Native"] -->|REST + JWT| api
  api --> firestore[("Cloud Firestore")]
```

`credit-web` nunca habla con Firestore directamente — todo pasa por `credit-backend`. `credit-mobile` es la contraparte para el comercial en campo de este panel administrativo.

### Registrar Crédito (Con Confirmación)

```mermaid
sequenceDiagram
  participant User as Operador
  participant Form as CreditForm
  participant Confirm as CreditConfirmDialog
  participant API as credit-backend
  User->>Form: Completa cédula, nombre, valor, tasa, plazo
  Form->>Form: valida (sin pedir Comercial: viene de la sesión)
  Form->>Confirm: abre resumen + cuota/total estimados
  User->>Confirm: Confirmar y registrar
  Confirm->>API: POST /api/v1/credits (Bearer JWT)
  API-->>Confirm: 201 CreditResponse
  Confirm-->>User: éxito, tabla se actualiza
```

## Capturas

| Login | Consulta de créditos |
|---|---|
| ![Login](docs/screenshots/login.png) | ![Consulta de créditos](docs/screenshots/credits-list.png) |

| Registrar crédito | Confirmación con cuota estimada |
|---|---|
| ![Modal de registro](docs/screenshots/credits-register-modal.png) | ![Modal de confirmación](docs/screenshots/credits-confirm-modal.png) |

| Correos de crédito |
|---|
| ![Vista de correos](docs/screenshots/email-jobs.png) |

## Stack

| Capa | Tecnología |
|---|---|
| UI | React 18.3.1, MUI |
| Build | Vite |
| Ruteo | React Router |
| Lenguaje | Solo JavaScript (sin TypeScript, sin paso de compilación de tipos) |

## Instalación Local

Solo necesario si querés correr la app en tu máquina en vez de usar la [demo en vivo](#demo-en-vivo).

### Requisitos Previos

| Herramienta | Versión | Notas |
|---|---|---|
| Node.js | 20+ | Ver `credit-mobile/package.json` `engines` como referencia; este repo no declara uno propio |
| npm | 10+ | Viene incluido con Node |
| `credit-backend` corriendo | — | Esta app no funciona sola; necesita la API en `VITE_API_BASE_URL` (podés usar la demo desplegada, ver paso 3) |

### Paso A Paso

1. **Instalá dependencias:**
   ```bash
   cd credit-web
   npm install
   ```
2. **Configurá el entorno:**
   ```bash
   cp .env.example .env
   ```
3. **Elegí contra qué backend correr:**
   - Contra tu propio backend local (ver [`../credit-backend/README.md`](../credit-backend/README.md)): dejá el valor por defecto, `VITE_API_BASE_URL=http://localhost:8080`.
   - Contra el backend de la demo ya desplegado (sin instalar nada más): poné `VITE_API_BASE_URL=https://fyatest-api.cmescorcia.com` en el `.env`.
4. **Levantá el dev server:**
   ```bash
   npm run dev
   ```
   Se abre en `http://localhost:5173`.
5. **Iniciá sesión** con un usuario sembrado (`900100001 / demo12345`, ver tabla arriba) o el usuario demo genérico (`demo / demo12345`).
6. **Explorá**: `/credits` para registrar/consultar créditos, `/email-jobs` para ver el estado de las notificaciones.

## Páginas

| Ruta | Qué hace | Doc |
|---|---|---|
| `/login` | Ingreso público | [`pages/login/README.md`](pages/login/README.md) |
| `/credits` | Registrar créditos (con confirmación + cuota estimada) y consultar los activos | [`pages/credits/README.md`](pages/credits/README.md) |
| `/email-jobs` | Ver el estado de entrega de notificaciones, errores visibles al toque | [`pages/email-jobs/README.md`](pages/email-jobs/README.md) |

## Test Y Build

```bash
npm run lint
npm test
npm run build
```

## Mapa De Documentación

| Archivo | Qué cubre |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Reglas de trabajo para agentes en este repo |
| [`document/overview.md`](document/overview.md) | Arquitectura de la SPA |
| [`document/module-map.md`](document/module-map.md) | Inventario canónico de vistas/módulos |
| [`document/api.md`](document/api.md) | Contrato REST que consume la web |
| [`document/security.md`](document/security.md) | JWT, storage, rutas protegidas |
| [`document/testing.md`](document/testing.md) | Comandos y escenarios de prueba |
| [`document/deployment.md`](document/deployment.md) | Vercel, dominio propio y `VITE_API_BASE_URL` |
| [`document/agents/`](document/agents/) | Playbooks de agentes y convenciones de commit |

## Deploy

Producción corre en Vercel, servida en el dominio propio `https://fyatest.cmescorcia.com` (no la URL larga por defecto `*.vercel.app`). **El deploy es manual, no automático en cada push.**

```mermaid
flowchart LR
  dev["git push main"] --> ci["Web CI<br/>(corre en cada push)"]
  dev -.sin auto-deploy.-> vercelgit["Integración Git de Vercel<br/>(apagada vía Ignored Build Step)"]
  operator["Alguien hace click en<br/>Run workflow"] --> deploy["Action Deploy Web<br/>lint + test + build"]
  deploy -->|vercel deploy --prod| prod["fyatest.cmescorcia.com"]
```

1. Cada push a `main` corre `Web CI` (lint/test/build) automáticamente — es solo una validación, no despliega nada.
2. Para desplegar de verdad: GitHub → **Actions** → **Deploy Web** → **Run workflow** (rama `main`). Vuelve a correr lint/test/build y, solo si pasa, ejecuta `vercel deploy --prod`.
3. El auto-deploy nativo de Vercel por push a Git está apagado (proyecto de Vercel → Settings → Git → "Ignored Build Step" configurado para saltar siempre). Este workflow es lo único que llega a producción.

Secrets requeridos en el repo (`gh secret set <NOMBRE> --repo CarlosPolo019/credit-web`): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Detalles completos (incluyendo la configuración del dominio/DNS y el rewrite de SPA en `vercel.json`): [`document/deployment.md`](document/deployment.md).
