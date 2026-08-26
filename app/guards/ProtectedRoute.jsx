import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { state } = useAuth();
  const location = useLocation();
  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
