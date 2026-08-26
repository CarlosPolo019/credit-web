# Vista: Login

## Estado
- `active`

## Proposito
- Permitir ingreso del usuario demo contra el backend.
- Crear sesion web con JWT en `sessionStorage`.

## Ruta Y Acceso
- Ruta: `/login`
- Acceso: publico.
- Redireccion: si ya existe token, navegar a `/credits`.

## Fuente De Verdad
- UI: `LoginPage.jsx`
- Estado: `auth/AuthContext.jsx`
- Storage: `auth/auth.storage.js`
- API: `api/client.js`

## Permisos
- No requiere Bearer.
- El backend valida credenciales.

## Referencias
- `document/security.md`
- `document/api.md`
- `.codex/skills/auth-session/SKILL.md`

