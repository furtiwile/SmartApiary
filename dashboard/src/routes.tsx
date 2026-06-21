import { createBrowserRouter, Outlet } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { FarmsPage } from "./features/farms/pages/FarmsPage";
import { SprayingPage } from "./features/farms/pages/SprayingPage";
import { LoginPage } from "./features/users/pages/LoginPage";
import { RegisterPage } from "./features/users/pages/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { SmartScalesPage } from "./features/smart-scales/components/SmartScalesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "login", element: <LoginPage /> },
      {
        // Register is protected — Admin only. Guests and non-admins are redirected.
        path: "register",
        element: (
          <AdminRoute>
            <RegisterPage />
          </AdminRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "farms", element: <FarmsPage /> },
          { path: "spraying", element: <SprayingPage /> },
          { path: "smart-scales", element: <SmartScalesPage /> },
        ],
      },
    ],
  },
]);
