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
- Supported sort fields are `createdAt` and `amount`.
- Supported directions are `asc` and `desc`.
- Frontend validation improves UX; backend remains authoritative.
- Listing should keep debounce, `AbortController`, and request id protection against stale responses.

## Files
- `pages/credits/CreditsPage.jsx`
- `pages/credits/CreditForm.jsx`
- `pages/credits/credits.service.js`
- `lib/creditValidation.js`

## Docs
Update `pages/credits/README.md` and `document/api.md` when behavior changes.
