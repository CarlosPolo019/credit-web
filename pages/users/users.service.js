import { request } from "../../api/client.js";

/**
 * Admin-only "create a test account" flow (comercial, or another admin).
 * Calls `POST /api/v1/users` — a dedicated, properly-authenticated endpoint
 * in credit-backend (`UserController`/`UserService`), gated the same way
 * `/api/v1/email-jobs/**` already is: `SecurityConfig` requires a Bearer
 * token from a caller with `ROLE_ADMIN` (`hasRole("ADMIN")`), enforced
 * before the request ever reaches the controller. There is no public
 * `/api/v1/auth/register` endpoint — accounts are admin-created only.
 *
 * `request()` is called with its normal (default) auth behavior, so it
 * attaches the current session's token automatically — this page is only
 * reachable by an authenticated `ADMIN` (`AdminRoute`), so that's always
 * the admin's own token.
 *
 * The endpoint does NOT return a login session for the created account —
 * no token, just `{ document, fullName, role }`. Nothing here can be
 * mistaken for a session and handed to `AuthContext`/`auth.storage.js`.
 */
export async function createUser({ fullName, document, password, role }) {
  return request("/api/v1/users", {
    method: "POST",
    body: { fullName, document, password, role },
  });
}
