---
name: assistant
description: Use when changing the credit-web Lesson Dock copiloto, intent parsing, or first-run teaching beats.
metadata:
  short-description: credit-web in-app teaching copiloto
triggers:
  - credit-web assistant
  - credit-web copiloto
  - Lesson Dock
priority: normal
---

# Assistant (Lesson Dock)

## Purpose
Keep the authenticated teaching dock aligned with real REST contracts.

## Invariants
- No LLM vendor, no chat endpoint, no new env vars.
- Estimate through `estimateCredit()` (`POST /api/v1/credits/estimate`) only.
- List through `listCredits()` with `createdAt`|`amount` and `asc`|`desc`.
- Limits come from `lib/creditValidation.js`. Do not invent rules.
- Never send salesperson in a request body.
- Never mention `/auth/register`.
- Admin routes only when `role === "ADMIN"`.
- First-run beats live in `localStorage` key `credit-web-lesson-beats`.
- Dock lives in `DashboardLayout`, not a FAB.

## Files
- `pages/assistant/AssistantDock.jsx`
- `pages/assistant/assistant.engine.js`
- `pages/assistant/assistant.copy.js`
- `pages/assistant/assistant.storage.js`
- `app/layouts/DashboardLayout.jsx`

## Docs
Update `pages/assistant/README.md`, `document/module-map.md`, `document/api.md` and `document/security.md`.
