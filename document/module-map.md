# Module Map

Inventario canonico de modulos y piezas activas.

| Dominio | Modulo | Ruta | Sidebar | Estado | README | Skill | Fuente De Verdad | Notas |
|---|---|---|---|---|---|---|---|---|
| auth | login | `/login` | no visible | active | `pages/login/README.md` | `auth-session` | `pages/login/LoginPage.jsx` | Entrada publica con `AuthLayout`. |
| credits | credits | `/credits` | Creditos | active | `pages/credits/README.md` | `credits-management` | `pages/credits/CreditsPage.jsx` | Entrada protegida con `DashboardLayout`. |
| credits | credit-detail | `/credits/:id` | Creditos | active | `pages/credits/README.md` | `credits-management` | `pages/credits/CreditDetailPage.jsx` | Detalle, editar, eliminar y exportar PDF de un credito. |
| email-jobs | email-jobs | `/email-jobs` | Correos (solo `ADMIN`) | active | `pages/email-jobs/README.md` | `project-overview` | `pages/email-jobs/EmailJobsPage.jsx` | Entrada protegida con `DashboardLayout` + `AdminRoute`; sin skill dedicado aun. |
| clients | clients | `/clients` | Clientes (solo `ADMIN`) | active | `pages/clients/README.md` | — | `pages/clients/ClientsPage.jsx` | Directorio de solo lectura (cedula + nombre), protegido con `DashboardLayout` + `AdminRoute`. Sin skill dedicado aun. |
| users | users | `/users` | Usuarios (solo `ADMIN`) | active | `pages/users/README.md` | — | `pages/users/UsersPage.jsx` | Crea cuentas `USER` de prueba (comerciales) via `POST /api/v1/auth/register`, protegido con `DashboardLayout` + `AdminRoute`. Sin listar/editar/eliminar — el backend no lo expone. Sin skill dedicado aun. |
| dashboard | dashboard | `/dashboard` | Dashboard (solo `ADMIN`) | active | `pages/dashboard/README.md` | — | `pages/dashboard/DashboardPage.jsx` | Estadisticas agregadas (creditos por comercial, monto total, ganancia total, correos por estado) sobre `listCredits`/`listEmailJobs` existentes, sin endpoint nuevo. Protegido con `DashboardLayout` + `AdminRoute`. Sin skill dedicado aun. |
| auth | auth-context | provider global | no visible | active | `document/security.md` | `auth-session` | `auth/AuthContext.jsx` | Usa `localStorage` key `credit-web-session`. |
| app | backend-wake-gate | shell global (antes de `AuthProvider`) | no visible | active | `document/deployment.md` | `project-overview` | `app/BackendWakeGate.jsx` | Poll a `/actuator/health` con mensajes de espera mientras el backend (Render free) hace cold start; deja pasar tras 5 min aunque no responda. |
| app | admin-route | guard de rutas | no visible | active | `document/security.md` | — | `app/guards/AdminRoute.jsx` | Redirige a `/credits` si `state.user.role !== "ADMIN"`; usado en `/email-jobs` y `/clients`. |
| api | api-client | REST client | no visible | active | `document/api.md` | `project-overview` | `api/client.js` | Lee token desde `auth.storage.js` y limpia sesion en `401`. |
| ui | ui-datatable | tabla creditos | no visible | active | `pages/credits/README.md` | `datatable-credit` | `ui/DataTable.jsx` | Sort accesible por columnas allowlisted. |

## Regla
Si cambia ruta, estado, fuente o skill de una vista, actualizar esta tabla en el mismo cambio.
