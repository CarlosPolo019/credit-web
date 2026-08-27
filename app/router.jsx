import { Navigate, createBrowserRouter } from "react-router-dom";
import { AdminRoute } from "./guards/AdminRoute.jsx";
import { ProtectedRoute } from "./guards/ProtectedRoute.jsx";
import { DashboardLayout } from "./layouts/DashboardLayout.jsx";
import { AuthLayout } from "./layouts/AuthLayout.jsx";
import { LoginPage } from "../pages/login/LoginPage.jsx";
import { CreditsPage } from "../pages/credits/CreditsPage.jsx";
import { CreditDetailPage } from "../pages/credits/CreditDetailPage.jsx";
import { EmailJobsPage } from "../pages/email-jobs/EmailJobsPage.jsx";
import { ClientsPage } from "../pages/clients/ClientsPage.jsx";
import { UsersPage } from "../pages/users/UsersPage.jsx";

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
      { path: "credits/:id", element: <CreditDetailPage /> },
      { path: "email-jobs", element: <AdminRoute><EmailJobsPage /></AdminRoute> },
      { path: "clients", element: <AdminRoute><ClientsPage /></AdminRoute> },
      { path: "users", element: <AdminRoute><UsersPage /></AdminRoute> },
    ],
  },
  { path: "*", element: <Navigate to="/credits" replace /> },
]);
