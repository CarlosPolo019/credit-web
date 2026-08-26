# Deployment

## Vercel
El workflow esta preparado para desplegar con Vercel.

Variables requeridas:
- `VITE_API_BASE_URL`
- `VERCEL_TOKEN`

Si el proyecto no esta linkeado, configurar `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` o ejecutar el link inicial fuera del repo.

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

