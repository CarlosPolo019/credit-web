---
name: credits-management
description: Use when changing credit-web credit registration, listing, filtering, sorting, or credit API calls.
metadata:
  short-description: credit-web credit registration and query workflow
triggers:
  - credit-web credits
  - credit filters
  - create credit
priority: normal
---

# Credits Management

## Purpose
Keep credit workflows aligned with the backend contract.

## Invariants
- Create uses `POST /api/v1/credits`.
- List uses `GET /api/v1/credits`.
- Detail uses `GET /api/v1/credits/{id}`; edit uses `PUT /api/v1/credits/{id}` (same `CreditForm.jsx`, edit mode); delete uses `DELETE /api/v1/credits/{id}` (`DeleteCreditDialog.jsx`, shared by the list row actions and the detail page).
- Audit history uses `GET /api/v1/credits/{id}/audit`.
- PDF export downloads `GET /api/v1/credits/{id}/pdf` — the PDF is rendered server-side (same endpoint credit-mobile uses); the frontend never generates one.
- The estimated monthly payment/total (confirmation dialog and detail page) comes from the backend (`POST /credits/estimate` before saving, `CreditResponse.estimatedMonthlyPayment`/`estimatedTotalToPay` after) — never recompute it client-side.
- Supported sort fields are `createdAt` and `amount`.
- Supported directions are `asc` and `desc`.
- Frontend validation improves UX; backend remains authoritative.
- Listing should keep debounce, `AbortController`, and request id protection against stale responses.
- Listing is paginated client-side (`DataTable`'s `totalCount`/`page`/`pageCount`/`onPageChange`) — 10/page on desktop, 5/page on the 800px mobile-card breakpoint. Changing a filter or the sort resets to page 1.
- Create mode's cédula field is a MUI `Autocomplete` (`freeSolo`) over `GET /api/v1/clients` (`listClients()`), filtered locally by document. A match autofills and disables the 4 name fields (read-only, no edit from this flow); no match behaves like a plain text field. Edit mode has no autocomplete. The backend upserts `clients` on every create/update regardless of which path was used — never build a separate write for that on the frontend.

## Files
- `pages/credits/CreditsPage.jsx`
- `pages/credits/CreditDetailPage.jsx`
- `pages/credits/CreditForm.jsx`
- `pages/credits/DeleteCreditDialog.jsx`
- `pages/credits/CreditAuditHistory.jsx`
- `pages/credits/credits.columns.js`
- `pages/credits/credits.service.js`
- `lib/creditValidation.js`
- `pages/assistant/assistant.engine.js` (estimate/list/deep-links into this flow)

## Docs
Update `pages/credits/README.md` and `document/api.md` when behavior changes. The client autocomplete also touches `pages/clients/README.md` (same `listClients()` data source) if it changes.
