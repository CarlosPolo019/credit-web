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
- `GET /api/v1/credits`
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
