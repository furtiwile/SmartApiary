import { createBrowserRouter, Outlet } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { FarmsPage } from "./features/farms/pages/FarmsPage";
import { LoginPage } from "./features/users/pages/LoginPage";
import { RegisterPage } from "./features/users/pages/RegisterPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import BeehivesPage from "./features/beehives/pages/BeehivesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
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
          // { path: "beehives/:apiaryId", element: <BeehivesPage />}
        ],
      },
      {
        path: "beehives/:apiaryId",
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <BeehivesPage />}
        ]
      }
    ],
  },
]);
