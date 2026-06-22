import { createBrowserRouter, Outlet } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { FarmsPage } from "./features/farms/pages/FarmsPage";
import { SprayingPage } from "./features/farms/pages/SprayingPage";
import { LoginPage } from "./features/users/pages/LoginPage";
import { RegisterPage } from "./features/users/pages/RegisterPage";
import { ActivatePage } from "./features/users/pages/ActivatePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { SmartScalesPage } from "./features/smart-scales/components/SmartScalesPage";
import { CropsMapPage } from "./features/maps/pages/CropsMapPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "login", element: <LoginPage /> },
      {
        path: "activate",
        element: <ActivatePage />,
      },
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
          {
            path: "farms",
            element: (
              <ProtectedRoute requiredRole="Farmer">
                <FarmsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "spraying",
            element: (
              <ProtectedRoute requiredRole="Farmer">
                <SprayingPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "smart-scales",
            element: (
              <ProtectedRoute requiredRole="Beekeeper">
                <SmartScalesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "crops-map",
            element: (
              <ProtectedRoute requiredRole="Beekeeper">
                <CropsMapPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
]);
