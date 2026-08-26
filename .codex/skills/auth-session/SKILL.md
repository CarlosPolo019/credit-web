---
name: auth-session
description: Use when changing credit-web login, JWT storage, route protection, logout, or expired-session behavior.
metadata:
  short-description: credit-web auth and JWT session flow
triggers:
  - credit-web login
  - JWT localStorage
  - ProtectedRoute
priority: normal
---

# Auth Session

## Purpose
Preserve the web authentication contract.

## Invariants
- Login calls `POST /api/v1/auth/login`.
- JWT is stored only in `localStorage` (not `sessionStorage`), so a link opened in a new tab — e.g. the "ver detalle completo" button in the credit-registered email — reuses the already-authenticated session.
- `401` clears session through the auth-expired event.
- The API client reads the initial token from `auth.storage.js` before React effects run.
- `/credits`, `/credits/:id`, and `/email-jobs` remain protected by `ProtectedRoute`.
- `ProtectedRoute` captures the originally-requested location; `LoginPage` redirects there after a successful login instead of always going to `/credits`.

## Files
- `auth/AuthContext.jsx`
- `auth/auth.storage.js`
- `api/client.js`
- `app/guards/ProtectedRoute.jsx`
- `pages/login/LoginPage.jsx`

## Validation
- `npm run lint`
- `npm test`
- `npm run build`
