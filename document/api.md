# API Client

## Configuracion
- `VITE_API_BASE_URL`: base URL del backend Spring Boot.
- Default local: `http://localhost:8080`.

## Cliente
`api/client.js` centraliza:
- `Content-Type: application/json`
- `Authorization: Bearer <token>` cuando aplica
- dispatch de `credit-auth-expired` en `401`
- parseo de errores JSON

La primera carga autenticada lee el token directamente desde `auth.storage.js`; no depende de esperar un `useEffect`.

## Endpoints Usados
- `POST /api/v1/auth/login`
- `POST /api/v1/credits`
- `POST /api/v1/credits/estimate`
- `GET /api/v1/credits`
- `GET /api/v1/credits/{id}`
- `PUT /api/v1/credits/{id}`
- `DELETE /api/v1/credits/{id}`
- `GET /api/v1/credits/{id}/audit`
- `GET /api/v1/credits/{id}/pdf`
- `GET /api/v1/email-jobs`

## Crear Credito
El formulario envia:
- `clientFirstName`
- `clientSecondName`
- `clientFirstSurname`
- `clientSecondSurname`
- `clientDocument`: solo digitos
- `amount`
- `interestRate`
- `termMonths`

El backend toma el comercial desde el JWT y la coleccion `users`; el formulario no envia `salespersonName`.

`CreditDetailPage.jsx` reusa el mismo formulario en modo edicion y envia el mismo body a `PUT /api/v1/credits/{id}` para actualizar cliente y condiciones (el comercial original no cambia).

## Cuota Estimada Y PDF
Antes de confirmar un registro o una edicion, `CreditForm.jsx` pide la cuota mensual y el total estimados a `POST /api/v1/credits/estimate` (mismo body que crear, sin `client*`) — no hay formula de amortizacion en el frontend. Una vez guardado, `CreditResponse` ya trae `estimatedMonthlyPayment`/`estimatedTotalToPay`, que es lo que muestra `CreditDetailPage.jsx`.

"Exportar PDF" descarga `GET /api/v1/credits/{id}/pdf` (`credits.service.js#downloadCreditPdf`) como blob autenticado y dispara la descarga en el navegador; el PDF en si lo genera `credit-backend` (mismo endpoint que usa `credit-mobile`), no hay generacion de PDF en el cliente.

## Historial De Cambios (Auditoria)
`CreditAuditHistory.jsx` consume `GET /api/v1/credits/{id}/audit` y muestra, por cada edicion o borrado: quien lo hizo, cuando, y para ediciones el detalle campo por campo (`before`/`after`). Se recarga automaticamente despues de guardar una edicion desde el detalle.

## Query De Creditos
Campos enviados:
- `clientName`
- `clientDocument`
- `salesperson`
- `sortBy`: `createdAt` o `amount`
- `direction`: `asc` o `desc`

El backend aplica la fecha oficial, filtros normalizados y exclusiones de inactivos.
La vista de creditos usa debounce, `AbortController` y request id para evitar que respuestas antiguas pisen resultados recientes.

## Query De Email Jobs
Campos enviados:
- `status`: `PENDING`, `PROCESSING`, `SENT`, `RETRY`, `FAILED` o vacio.
- `search`: coincidencia parcial en cliente o destinatario.
- `sortBy`: `createdAt` (default) o `status`.
- `direction`: `asc` o `desc`.

La vista de email jobs usa el mismo patron de debounce, `AbortController` y request id que la de creditos.
