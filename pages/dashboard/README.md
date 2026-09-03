# Vista: Dashboard

## Estado
- `active`

## Proposito
- Panel agregado de solo lectura para el `ADMIN`: cuantos creditos activos tiene cada comercial, el monto total solicitado, la ganancia total estimada y el estado de envio de los correos de notificacion.
- No hay crear/editar/eliminar nada desde esta vista — es puramente lectura/aggregacion sobre datos que ya existen en `/credits` y `/email-jobs`.

## Ruta Y Acceso
- Ruta: `/dashboard`.
- Acceso: `ProtectedRoute` + `AdminRoute` (`app/guards/AdminRoute.jsx`) — solo cuentas con `state.user.role === "ADMIN"`. Cualquier otra cuenta que entre por URL directa es redirigida a `/credits`.
- Sidebar: solo visible para `ADMIN` (`app/layouts/DashboardLayout.jsx`), primer link del bloque admin.
- Es admin-only por la misma razon que Correos/Clientes/Usuarios: agrega datos de todos los comerciales, no solo los del usuario logueado.

## Fuente De Verdad
- Vista: `DashboardPage.jsx`.
- Servicios reutilizados (sin cambios): `listCredits()` en `../credits/credits.service.js` y `listEmailJobs()` en `../email-jobs/email-jobs.service.js`.
- Charts: `recharts` (`BarChart` horizontal para creditos por comercial, `PieChart` tipo donut para correos por estado).

## Como Funciona (y por que)
- Ambos servicios ya devuelven el dataset completo (sin paginado server-side) — mismo supuesto que usan `ClientsPage`, `CreditsPage` y `EmailJobsPage`. `DashboardPage` pide `listCredits({ sortBy: "createdAt", direction: "desc" })` y `listEmailJobs({ sortBy: "createdAt", direction: "desc" })` en paralelo (`Promise.all`) y agrega todo en el cliente — no hay endpoint nuevo en el backend.
- **Creditos por comercial**: agrupa `credits` por `salespersonName` y cuenta cuantos hay en cada grupo, ordenado descendente por cantidad. Se muestra como barras horizontales (una por comercial).
- **Monto total solicitado**: `sum(credit.amount)` sobre todos los creditos activos. Stat card unico, sin desglose por comercial (a proposito — el desglose por comercial solo aplica al conteo de creditos).
- **Ganancia total estimada**: `sum(credit.estimatedTotalToPay - credit.amount)` sobre todos los creditos activos — `estimatedTotalToPay` ya viene calculado por el backend (misma formula que usa `CreditResponse` y el PDF), esta vista no recalcula intereses/amortizacion. Stat card unico, tambien sin desglose por comercial.
- **Correos por estado**: agrupa `emailJobs` por `status` (`PENDING`, `PROCESSING`, `SENT`, `RETRY`, `FAILED`) y cuenta cada uno. Donut con `SENT` en tinta (`#052224`) y `FAILED` en rojo de error (`#dc2626`); el resto usa salvia / tinta atenuada. El verde Fya queda reservado a acciones primarias.
- `AbortController` por fetch, mismo patron de cancelacion-al-desmontar que `CreditsPage`/`ClientsPage`; `latestRequestId` evita pisar el estado con una respuesta vieja si el usuario navega rapido.

## Estados
- Loading (spinner centrado) mientras cargan ambos fetches.
- Error inline (`form-error`) si falla cualquiera de los dos fetches — no rompe la pagina.
- Empty por widget: "No hay creditos para mostrar." / "No hay correos para mostrar." si el dataset correspondiente viene vacio.

## Referencias
- `document/module-map.md`
- `document/security.md` (roles/permisos)
