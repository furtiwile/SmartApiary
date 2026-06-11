import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/users/hooks/AuthHook";



type ProtectedRouteProps = {
  children: React.ReactElement;
  requiredRole: string;
  redirectTo?: string;
};



export function ProtectedRoute({ children, requiredRole, redirectTo = "/login" }: ProtectedRouteProps) {
  const { isAuthed, user } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to={redirectTo} state={{ from: location }} replace/>;
  }
  
  if (user?.role === requiredRole) 
    return <>{children}</>;

  // TODO: Check if class choices are cohherent with overall style
  // If not, change them
  return (
    <main className="min-h-screen bg-gradient-to-tr from-slate-600/75 to red-800/70 flex items-center justify-center">
      <div className="bg-white/30 backdrop-lg shadow-lg border border-red-300 rounded-2xl p-10 w-full max-w-lg text-center">
        <h2 className="text-3xl font-bold mb-4 text-red-800">
          Access Denied
        </h2>
        <p className="text-gray-800 text-lg mb-6">
          Role required: {requiredRole}
        </p>
      </div>
    </main>
  );
};