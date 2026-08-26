---
name: auth-session
description: Use when changing credit-web login, JWT storage, route protection, logout, or expired-session behavior.
metadata:
  short-description: credit-web auth and JWT session flow
triggers:
  - credit-web login
  - JWT sessionStorage
  - ProtectedRoute
priority: normal
---

# Auth Session

## Purpose
Preserve the web authentication contract.

## Invariants
- Login calls `POST /api/v1/auth/login`.
- JWT is stored only in `sessionStorage`.
- `401` clears session through the auth-expired event.
- The API client reads the initial token from `auth.storage.js` before React effects run.
- `/credits` remains protected.

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
