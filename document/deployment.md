# Deployment

## Vercel — Deploy Manual Desde El Action
El deploy a produccion **no es automatico**. El workflow `.github/workflows/deploy-web.yml` corre solo con `workflow_dispatch` (boton manual):
1. GitHub -> pestaña **Actions** -> workflow **Deploy Web** -> **Run workflow** -> rama `main` -> Run.
2. Corre lint, tests y build primero; si algo falla, no despliega.
3. Si pasa, hace `npx vercel@59.11.2 deploy --prod --yes` con los secrets del repo (CLI pineado; el job tiene `timeout-minutes: 15` y cache npm).

El deploy automatico de Vercel por push a Git tambien esta apagado (Vercel -> Settings -> Git -> **Ignored Build Step** configurado para saltar siempre `main`). Asi, nada se despliega a produccion sin que alguien lo dispare a mano desde GitHub.

Secrets requeridos en el repo (`gh secret set <NOMBRE> --repo CarlosPolo019/credit-web`):
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Variable de entorno del build: `VITE_API_BASE_URL=https://fyatest-api.cmescorcia.com` (configurada en Vercel -> proyecto -> Settings -> Environment Variables, entorno Production). Vite hornea esta variable en el build, asi que cambiarla requiere un redeploy (Run workflow) para tomar efecto — no alcanza con guardarla en Vercel.

## Dominio Personalizado
Produccion vive en `https://fyatest.cmescorcia.com` (en vez de la URL larga `*.vercel.app` por defecto). El dominio `cmescorcia.com` se compro en Squarespace pero **el DNS real lo maneja Cloudflare** (nameservers `*.ns.cloudflare.com`) — los registros que se cargan en el panel de DNS de Squarespace no tienen ningun efecto, hay que cargarlos en Cloudflare. Pasos:
1. Vercel: proyecto `credit-web` -> Settings -> Domains -> Add `fyatest.cmescorcia.com`. Vercel muestra el registro CNAME exacto a crear (ej. `xxxxxxxxxxxx.vercel-dns-017.com`).
2. Cloudflare (no Squarespace) -> dominio `cmescorcia.com` -> DNS -> Records -> Add record: `CNAME`, Name `fyatest`, Target el valor que dio Vercel, **Proxy status: DNS only** (nube gris, no naranja — con el proxy de Cloudflare activado Vercel no puede validar el dominio ni emitir SSL).
3. Esperar propagacion (unos minutos); Vercel verifica y emite SSL automaticamente.
4. En `credit-backend` (Render), agregar `https://fyatest.cmescorcia.com` a `APP_CORS_ALLOWED_ORIGINS` — sin esto el login/API fallan por CORS aunque el dominio ya resuelva.

## Build
```bash
npm run build
```

El output local es `dist/`, ignorado por Git.

## SPA Rewrites
`vercel.json` reescribe cualquier ruta a `/index.html` para que React Router pueda manejarla en el cliente. Sin esto, entrar directo (o refrescar) en `/login`, `/credits` o `/email-jobs` da `404: NOT_FOUND` de Vercel — solo `/` funciona porque ahi si existe el archivo. Si se agregan rutas nuevas no hace falta tocar este archivo, ya cubre cualquier path.

