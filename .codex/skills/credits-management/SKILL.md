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

## Files
- `pages/credits/CreditsPage.jsx`
- `pages/credits/CreditDetailPage.jsx`
- `pages/credits/CreditForm.jsx`
- `pages/credits/DeleteCreditDialog.jsx`
- `pages/credits/CreditAuditHistory.jsx`
- `pages/credits/credits.columns.js`
- `pages/credits/credits.service.js`
- `lib/creditValidation.js`

## Docs
Update `pages/credits/README.md` and `document/api.md` when behavior changes.
