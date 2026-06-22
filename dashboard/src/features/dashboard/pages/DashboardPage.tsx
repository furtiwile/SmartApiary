import React from "react";
import { useAuth } from "../../users/hooks/AuthHook";
import BeehivesPage from "../../beehives/pages/BeehivesPage";
import { FarmsPage } from "../../farms/pages/FarmsPage";
import { AdminUsersPage } from "../../users/pages/AdminUsersPage";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  // Beekeepers see hives/apiaries
  if (user.role === "Beekeeper") {
    return <BeehivesPage />;
  }

  if (user.role === "Admin") {
    return <AdminUsersPage />;
  }

  // Farmers see parcels
  if (user.role === "Farmer") {
    return <FarmsPage />;
  }

  // Fallback for unknown roles
  return (
    <div className="p-6">
      <p className="text-slate-600">Dashboard not available for your role.</p>
    </div>
  );
};
