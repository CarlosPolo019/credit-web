# Deployment

## Vercel
El workflow esta preparado para desplegar con Vercel.

Variables requeridas:
- `VITE_API_BASE_URL`
- `VERCEL_TOKEN`

Si el proyecto no esta linkeado, configurar `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` o ejecutar el link inicial fuera del repo.

## Build
```bash
npm run build
```

El output local es `dist/`, ignorado por Git.

