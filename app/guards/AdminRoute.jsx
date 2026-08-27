import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";

/**
 * Nested under ProtectedRoute (see router.jsx) — authentication is already
 * guaranteed by the time this runs, it only checks the role. Non-admin
 * accounts get redirected to /credits instead of a blank/forbidden page.
 */
export function AdminRoute({ children }) {
  const { state } = useAuth();
  if (state.user?.role !== "ADMIN") {
    return <Navigate to="/credits" replace />;
  }
  return children;
}
