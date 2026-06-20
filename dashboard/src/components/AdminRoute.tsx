import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/users/hooks/AuthHook";

type AdminRouteProps = {
  children: React.ReactElement;
};

/**
 * Strictly guards a route so that only authenticated Admin users can access it.
 * - Unauthenticated users are redirected to /login.
 * - Authenticated non-Admins are redirected to /dashboard.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthed, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
