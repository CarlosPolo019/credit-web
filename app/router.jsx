import { Navigate, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./guards/ProtectedRoute.jsx";
import { DashboardLayout } from "./layouts/DashboardLayout.jsx";
import { AuthLayout } from "./layouts/AuthLayout.jsx";
import { LoginPage } from "../pages/login/LoginPage.jsx";
import { CreditsPage } from "../pages/credits/CreditsPage.jsx";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/credits" replace /> },
      { path: "credits", element: <CreditsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/credits" replace /> },
]);
