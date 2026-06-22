import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../features/users/hooks/AuthHook";
import LogoutButton from "../features/users/components/LogoutButton";
import { NotificationDrawer } from "../components/ui/NotificationDrawer";
import type { UserDto } from "../features/users/models/UserDto";


type AccountActionsProps = {
  isAuthed: boolean;
  user: UserDto | null;
  logout: () => void;
};

function AccountActions({ isAuthed, user, logout }: AccountActionsProps) {
  if (!isAuthed) {
    return (
      <li>
        <Link
          to="/login"
          className="text-sm font-bold tracking-wide text-slate-400 hover:text-cyan-400 transition-colors duration-200"
        >
          LOGIN
        </Link>
      </li>
    );
  }

  const displayName = user?.firstName || user?.lastName
    ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
    : user?.email ?? "User";

  return (
    <>
      {/* Register link — only shown to Admin; route itself is also guarded */}
      {user?.role === "Admin" && (
        <li>
          <Link
            to="/register"
            className="text-sm font-bold tracking-wide text-slate-400 hover:text-cyan-400 transition-colors duration-200"
          >
            REGISTER
          </Link>
        </li>
      )}
      {user?.role === "Beekeeper" && (
        <>
          <li>
            <Link
              to="/dashboard/crops-map"
              className="text-sm font-bold tracking-wide text-slate-400 hover:text-emerald-400 transition-colors duration-200"
            >
              CROPS MAP
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/smart-scales"
              className="text-sm font-bold tracking-wide text-slate-400 hover:text-cyan-400 transition-colors duration-200"
            >
              SMART SCALES
            </Link>
          </li>
        </>
      )}
      {user?.role === "Farmer" && (
        <>
          <li>
            <Link
              to="/dashboard/farms"
              className="text-sm font-bold tracking-wide text-slate-400 hover:text-emerald-400 transition-colors duration-200"
            >
              FIELDS
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/spraying"
              className="text-sm font-bold tracking-wide text-slate-400 hover:text-rose-400 transition-colors duration-200"
            >
              SPRAYING
            </Link>
          </li>
        </>
      )}
      <li>
        <span className="text-sm font-bold tracking-wide text-slate-400">
          {displayName}
        </span>
      </li>
      <li>
        <NotificationDrawer />
      </li>
      <li>
        <LogoutButton logout={logout} />
      </li>
    </>
  );
}

const MainLayout: React.FC = () => {
  const {isAuthed, user, logout} = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link to="/dashboard" className="group">
            <h1 className="text-xl font-black bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-cyan-300 transition-all">
              SmartApiary
            </h1>
          </Link>
          <nav>
            <ul className="flex items-center space-x-4">
              <AccountActions isAuthed={isAuthed} user={user} logout={logout} />
            </ul>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-auto">
        <div className="container mx-auto text-center">
          <p className="text-slate-600 text-[10px] font-bold tracking-widest uppercase">
            © 2026 SmartApiary
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
