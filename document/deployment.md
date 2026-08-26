# Deployment

## Vercel — Deploy Manual Desde El Action
El deploy a produccion **no es automatico**. El workflow `.github/workflows/deploy-web.yml` corre solo con `workflow_dispatch` (boton manual):
1. GitHub -> pestaña **Actions** -> workflow **Deploy Web** -> **Run workflow** -> rama `main` -> Run.
2. Corre lint, tests y build primero; si algo falla, no despliega.
3. Si pasa, hace `vercel deploy --prod` con los secrets del repo.

El deploy automatico de Vercel por push a Git tambien esta apagado (Vercel -> Settings -> Git -> **Ignored Build Step** configurado para saltar siempre `main`). Asi, nada se despliega a produccion sin que alguien lo dispare a mano desde GitHub.

Secrets requeridos en el repo (`gh secret set <NOMBRE> --repo CarlosPolo019/credit-web`):
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Variable de entorno del build: `VITE_API_BASE_URL` (configurada en el proyecto de Vercel).

## Dominio Personalizado
Produccion vive en `https://fyatest.cmescorcia.com` (en vez de la URL larga `*.vercel.app` por defecto). Pasos (manuales, panel de Vercel + Squarespace):
1. Vercel: proyecto `credit-web` -> Settings -> Domains -> Add `fyatest.cmescorcia.com`. Vercel muestra el registro CNAME exacto a crear (tipicamente `cname.vercel-dns.com`).
2. Squarespace (DNS de `cmescorcia.com`): Configuracion de DNS -> Registros personalizados -> Agregar registro: `CNAME`, Host `fyatest`, Data el valor que dio Vercel, TTL 1 hora.
3. Esperar propagacion (minutos a un par de horas); Vercel verifica y emite SSL automaticamente.
4. En `credit-backend` (Render), agregar `https://fyatest.cmescorcia.com` a `APP_CORS_ALLOWED_ORIGINS` — sin esto el login/API fallan por CORS aunque el dominio ya resuelva.

## Build
```bash
npm run build
```

El output local es `dist/`, ignorado por Git.

## SPA Rewrites
`vercel.json` reescribe cualquier ruta a `/index.html` para que React Router pueda manejarla en el cliente. Sin esto, entrar directo (o refrescar) en `/login`, `/credits` o `/email-jobs` da `404: NOT_FOUND` de Vercel — solo `/` funciona porque ahi si existe el archivo. Si se agregan rutas nuevas no hace falta tocar este archivo, ya cubre cualquier path.

