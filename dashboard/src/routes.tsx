import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./features/dashboard/pages/Dashboard";
import DevicesPage from "./features/devices/pages/DevicesPage";
import BeehivesPage from "./features/beehives/pages/BeehivesPage";
import { LoginPage } from "./features/users/pages/LoginPage";
import { RegisterPage } from "./features/users/pages/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "devices", element: <DevicesPage /> },
      { path: "beehives", element: <BeehivesPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
]);
