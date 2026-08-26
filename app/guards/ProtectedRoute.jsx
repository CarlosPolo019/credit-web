import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { state } = useAuth();
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
