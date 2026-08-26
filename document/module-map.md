# Module Map

Inventario canonico de modulos y piezas activas.

| Dominio | Modulo | Ruta | Sidebar | Estado | README | Skill | Fuente De Verdad | Notas |
|---|---|---|---|---|---|---|---|---|
| auth | login | `/login` | no visible | active | `pages/login/README.md` | `auth-session` | `pages/login/LoginPage.jsx` | Entrada publica con `AuthLayout`. |
| credits | credits | `/credits` | Creditos | active | `pages/credits/README.md` | `credits-management` | `pages/credits/CreditsPage.jsx` | Entrada protegida con `DashboardLayout`. |
| auth | auth-context | provider global | no visible | active | `document/security.md` | `auth-session` | `auth/AuthContext.jsx` | Usa `sessionStorage` key `credit-web-session`. |
| api | api-client | REST client | no visible | active | `document/api.md` | `project-overview` | `api/client.js` | Lee token desde `auth.storage.js` y limpia sesion en `401`. |
| ui | ui-datatable | tabla creditos | no visible | active | `pages/credits/README.md` | `datatable-credit` | `ui/DataTable.jsx` | Sort accesible por columnas allowlisted. |

## Regla
Si cambia ruta, estado, fuente o skill de una vista, actualizar esta tabla en el mismo cambio.
