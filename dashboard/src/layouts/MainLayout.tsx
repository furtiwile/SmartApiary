import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/users/hooks/AuthHook";
import LogoutButton from "../features/users/components/LogoutButton";
import { NotificationDrawer } from "../components/ui/NotificationDrawer";
import { useNotify } from "../hooks/useNotify";
import { useApis } from "../shared/api/useApis";
import { useApiarySignalR } from "../features/beehives/hooks/useApiarySignalR";
import { HubConnectionState } from "@microsoft/signalr";
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

type NavigationTabsProps = {
  user: UserDto | null;
};

function NavigationTabs({ user }: NavigationTabsProps) {
  const location = useLocation();

  if (!user) return null;

  const role = user.role;
  const tabs = [];

  if (role === "Beekeeper") {
    tabs.push(
      {
        path: "/dashboard",
        label: "APIARIES",
        activeColor: "text-indigo-400",
        hoverColor: "hover:text-indigo-400",
        indicatorClass: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]",
        isActive: location.pathname === "/dashboard",
      },
      {
        path: "/dashboard/crops-map",
        label: "CROPS MAP",
        activeColor: "text-emerald-400",
        hoverColor: "hover:text-emerald-400",
        indicatorClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
        isActive: location.pathname === "/dashboard/crops-map",
      },
      {
        path: "/dashboard/smart-scales",
        label: "SMART SCALES",
        activeColor: "text-cyan-400",
        hoverColor: "hover:text-cyan-400",
        indicatorClass: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
        isActive: location.pathname === "/dashboard/smart-scales",
      },
      {
        path: "/dashboard/settings",
        label: "SETTINGS",
        activeColor: "text-amber-400",
        hoverColor: "hover:text-amber-400",
        indicatorClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
        isActive: location.pathname === "/dashboard/settings",
      }
    );
  } else if (role === "Farmer") {
    tabs.push(
      {
        path: "/dashboard/farms",
        label: "FIELDS",
        activeColor: "text-emerald-400",
        hoverColor: "hover:text-emerald-400",
        indicatorClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
        isActive: location.pathname === "/dashboard/farms",
      },
      {
        path: "/dashboard/spraying",
        label: "SPRAYING",
        activeColor: "text-rose-400",
        hoverColor: "hover:text-rose-400",
        indicatorClass: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]",
        isActive: location.pathname === "/dashboard/spraying",
      },
      {
        path: "/dashboard/spraying-records",
        label: "RECORDS",
        activeColor: "text-cyan-400",
        hoverColor: "hover:text-cyan-400",
        indicatorClass: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
        isActive: location.pathname === "/dashboard/spraying-records",
      }
    );
  } else if (role === "Admin") {
    tabs.push(
      {
        path: "/dashboard",
        label: "USERS",
        activeColor: "text-indigo-400",
        hoverColor: "hover:text-indigo-400",
        indicatorClass: "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]",
        isActive: location.pathname === "/dashboard",
      },
      {
        path: "/register",
        label: "REGISTER",
        activeColor: "text-cyan-400",
        hoverColor: "hover:text-cyan-400",
        indicatorClass: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
        isActive: location.pathname === "/register",
      }
    );
  }

  return (
    <>
      {tabs.map((tab) => (
        <li key={tab.path} className="relative py-2">
          <Link
            to={tab.path}
            className={`text-sm font-bold tracking-wide transition-all duration-200 ${
              tab.isActive ? tab.activeColor : `text-slate-400 ${tab.hoverColor}`
            }`}
          >
            {tab.label}
          </Link>
          {tab.isActive && (
            <span
              className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full transition-all duration-300 ${tab.indicatorClass}`}
            />
          )}
        </li>
      ))}
    </>
  );
}

const MainLayout: React.FC = () => {
  const {isAuthed, user, logout} = useAuth();
  const { notifications } = useApis();
  const { info, warning, error } = useNotify();
  const { connectionState, joinBeekeeperGroup, leaveBeekeeperGroup, joinPrivateChannel, leavePrivateChannel } = useApiarySignalR();

  React.useEffect(() => {
    if (!isAuthed || !user) return;

    if (connectionState === HubConnectionState.Connected) {
      if (user.role === "Beekeeper") {
        joinBeekeeperGroup(user.id);
      }
      joinPrivateChannel(user.id);
    }

    let mounted = true;

    async function fetchNotifications() {
      try {
        const unpushed = await notifications.getUnpushed();
        if (!mounted || unpushed.length === 0) return;

        const idsToMark = [];

        for (const notif of unpushed) {
          const type = notif.type.toLowerCase();
          const title = `Alert: ${notif.type}`;
          
          if (type === "critical") {
            error(title, notif.message, { duration: 10000 });
          } else if (type === "warning") {
            warning(title, notif.message, { duration: 8000 });
          } else {
            info(title, notif.message, { duration: 6000 });
          }

          idsToMark.push(notif.id);
        }

        if (idsToMark.length > 0) {
          await notifications.markAsPushed(idsToMark);
        }
      } catch (err) {
        console.error("Failed to fetch notifications on login", err);
      }
    }

    fetchNotifications();

    return () => { 
      mounted = false; 
      if (user?.role === "Beekeeper") {
        leaveBeekeeperGroup(user.id);
      }
      leavePrivateChannel(user.id);
    };
  }, [isAuthed, user, notifications, info, warning, error, joinBeekeeperGroup, leaveBeekeeperGroup, joinPrivateChannel, leavePrivateChannel, connectionState]);
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="container mx-auto flex items-center justify-between p-4">
          {/* Left: Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/dashboard" className="group">
              <h1 className="text-xl font-black bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-cyan-300 transition-all">
                SmartApiary
              </h1>
            </Link>
          </div>

          {/* Center: Tabs */}
          {user && (
            <div className="flex-none flex justify-center">
              <nav>
                <ul className="flex items-center space-x-6">
                  <NavigationTabs user={user} />
                </ul>
              </nav>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex-1 flex justify-end">
            <nav>
              <ul className="flex items-center space-x-4">
                <AccountActions isAuthed={isAuthed} user={user} logout={logout} />
              </ul>
            </nav>
          </div>
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
