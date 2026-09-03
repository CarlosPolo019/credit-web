# Vista: Copiloto (Lesson Dock)

## Estado
- `active`

## Proposito
- Enseñar limites del credito, estimar una cuota con la API real y senalar el siguiente paso.
- No es un chatbot generico ni un FAB. Es una columna de primera clase en el shell autenticado.

## Ruta Y Acceso
- No tiene ruta propia. Se monta en `DashboardLayout` despues del login (`ProtectedRoute`).
- Primera sesion: tres notas cortas (`lessonBeats`) y luego se oculta. Queda a un clic en el header.
- La marca de leccion vista vive en `localStorage` (`credit-web-lesson-beats`).

## Fuente De Verdad
- UI: `AssistantDock.jsx`
- Motor: `assistant.engine.js` (parseo de intenciones en JS)
- Copy: `assistant.copy.js` (limites desde `lib/creditValidation.js`)
- Storage: `assistant.storage.js`
- Retrato: `ui/illustrations/portraits.jsx` (`PortraitCopilot`)

## Comportamiento
- Explica como registrar un credito con los limites reales: valor > 0 y <= 200.000.000, tasa mensual 0.5–3.5, plazo 1–60, cedula solo digitos.
- Estima cuota/total con `POST /api/v1/credits/estimate` via `credits.service.js`. Nunca recalcula amortizacion en el cliente. Nunca manda comercial en el body.
- Busca con `GET /api/v1/credits` y allowlist `createdAt`|`amount`, `asc`|`desc`.
- Deep-links: `/credits`, `/credits/:id`, `/credits?nuevo=1` (abre el formulario). Rutas admin solo si `role === "ADMIN"`.
- Nunca menciona `/auth/register`. Cuentas nuevas: `POST /api/v1/users`, solo admin.

## Referencias
- `document/module-map.md`
- `document/api.md`
- `document/security.md`
- `.codex/skills/assistant/SKILL.md`
