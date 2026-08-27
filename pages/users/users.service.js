import { request } from "../../api/client.js";

/**
 * Admin-only "create a test account" flow (comercial, or another admin).
 * Calls `POST /api/v1/users` — a dedicated, properly-authenticated endpoint
 * in credit-backend (`UserController`/`UserService`), gated the same way
 * `/api/v1/email-jobs/**` already is: `SecurityConfig` requires a Bearer
 * token from a caller with `ROLE_ADMIN` (`hasRole("ADMIN")`), enforced
 * before the request ever reaches the controller. This is NOT the public
 * `/api/v1/auth/register` self-registration endpoint — that one stays
 * untouched, always public, always `role: "USER"`.
 *
 * `request()` is called with its normal (default) auth behavior, so it
 * attaches the current session's token automatically — this page is only
 * reachable by an authenticated `ADMIN` (`AdminRoute`), so that's always
 * the admin's own token.
 *
 * Unlike self-registration, this endpoint does NOT return a login session
 * for the created account — no token, just `{ document, fullName, role }`
 * (`UserResponse` in credit-backend). There's nothing here that could be
 * mistaken for a session and handed to `AuthContext`/`auth.storage.js`, so
 * the earlier "don't clobber the admin's session" concern (relevant when
 * this called the public register endpoint, which does return a token)
 * doesn't apply to this shape of response at all.
 */
export async function createUser({ fullName, document, password, role }) {
  return request("/api/v1/users", {
    method: "POST",
    body: { fullName, document, password, role },
  });
}
